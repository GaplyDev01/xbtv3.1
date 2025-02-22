const { AccountMonitorService } = require('../services/AccountMonitorService.ts');

// Pump.fun Fee Account for testing
const PUMP_FUN_FEE_ACCOUNT = 'CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM';
const RPC_ENDPOINT = 'https://green-skilled-wish.solana-mainnet.quiknode.pro/7c4d7edef5f22b26ca2065560f263480ee633258';
const WS_ENDPOINT = 'wss://green-skilled-wish.solana-mainnet.quiknode.pro/7c4d7edef5f22b26ca2065560f263480ee633258';

async function main() {
  let reconnectCount = 0;
  console.log(`💊 Tracking Pump.fun Fee Account: ${PUMP_FUN_FEE_ACCOUNT} 💊`);

  // Create a monitor for the account
  const cleanup = AccountMonitorService.createMonitor({
    updateIntervalMs: 10 * 60 * 1000, // 10 minutes
    rpcEndpoint: RPC_ENDPOINT,
    wsEndpoint: WS_ENDPOINT,
    accountAddress: PUMP_FUN_FEE_ACCOUNT,
    maxRetries: 5,
    retryDelayMs: 1000,
    onBalanceChange: ({ slot, formattedBalance, formattedDelta }) => {
      console.log(
        `[${new Date().toISOString()}] Account change detected at slot ${slot.toLocaleString()}. ` +
        `New Balance: ${formattedBalance} (${formattedDelta})`
      );
    },
    onError: (error) => {
      console.error(`[${new Date().toISOString()}] Monitor error:`, error.message);
    },
    onReconnect: () => {
      reconnectCount++;
      console.log(
        `[${new Date().toISOString()}] WebSocket reconnected ` +
        `(attempt ${reconnectCount})`
      );
    },
    commitment: 'confirmed'
  });

  // Monitor for 10 minutes then cleanup
  const MONITOR_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  console.log(`Monitoring for 24 hours with 10-minute intervals...`);
  
  setTimeout(() => {
    console.log('Cleaning up subscription...');
    cleanup();
    process.exit(0);
  }, MONITOR_DURATION_MS);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Received SIGINT. Cleaning up...');
  process.exit(0);
});

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
