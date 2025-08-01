-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast sorting by score
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_leaderboard_username ON leaderboard(username);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read leaderboard
CREATE POLICY "Allow public read access" ON leaderboard
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert scores
CREATE POLICY "Allow authenticated insert" ON leaderboard
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow users to update their own scores
CREATE POLICY "Allow update own score" ON leaderboard
  FOR UPDATE USING (auth.uid()::text = username);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_leaderboard_updated_at 
  BEFORE UPDATE ON leaderboard 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 