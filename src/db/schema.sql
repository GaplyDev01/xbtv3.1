-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID, -- Optional, for when we add authentication
  token_count INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

-- Create index for full-text search on messages
CREATE INDEX IF NOT EXISTS idx_chat_history_messages ON chat_history 
USING gin(to_tsvector('english', user_message || ' ' || assistant_message));
