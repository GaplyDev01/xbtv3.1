import { AccountMonitorService } from '../services/AccountMonitorService';

// Pump.fun Fee Account for testing
const PUMP_FUN_FEE_ACCOUNT = 'CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM';

async function main() {
  console.log(`💊 Tracking Pump.fun Fee Account: ${PUMP_FUN_FEE_ACCOUNT} 💊`);

  // Create a monitor for the account
  const cleanup = AccountMonitorService.createMonitor(
    process.env.QUICK_NODE_WS_URL!,
    PUMP_FUN_FEE_ACCOUNT,
    ({ slot, formattedBalance, formattedDelta }) => {
      console.log(
        `Account change detected at slot ${slot.toLocaleString()}. ` +
        `New Balance: ${formattedBalance} (${formattedDelta})`
      );
    }
  );

  // Monitor for 5 minutes then cleanup
  setTimeout(() => {
    console.log('Cleaning up subscription...');
    cleanup();
  }, 5 * 60 * 1000);
}

main().catch(console.error);
