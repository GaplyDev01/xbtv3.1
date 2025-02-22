-- Create token_prices table
CREATE TABLE IF NOT EXISTS token_prices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  price DECIMAL NOT NULL,
  price_change_24h DECIMAL NOT NULL,
  volume_24h DECIMAL NOT NULL,
  market_cap DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_token_prices_symbol ON token_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_token_prices_name ON token_prices(name);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_token_prices_updated_at
    BEFORE UPDATE ON token_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
