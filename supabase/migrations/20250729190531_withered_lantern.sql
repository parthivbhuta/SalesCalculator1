/*
  # Create clients table for Sales Cost Calculator

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `client_info` (jsonb) - stores client contact information
      - `cost_inputs` (jsonb) - stores project cost parameters
      - `consulting_inputs` (jsonb) - stores consulting engagement parameters
      - `calculations` (jsonb) - stores calculated results
      - `status` (text) - project status (draft, completed, archived)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `clients` table
    - Add policies for authenticated users to manage their own clients
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_info jsonb DEFAULT '{}',
  cost_inputs jsonb DEFAULT '{}',
  consulting_inputs jsonb DEFAULT '{}',
  calculations jsonb DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'pending', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);
CREATE INDEX IF NOT EXISTS clients_status_idx ON clients(status);
CREATE INDEX IF NOT EXISTS clients_created_at_idx ON clients(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();