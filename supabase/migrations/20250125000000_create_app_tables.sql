-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users(id) primary key,
  is_premium boolean default false,
  trial_ends_at timestamp with time zone default (now() + interval '7 days'),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid());

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  dosage jsonb not null,
  schedule jsonb not null,
  inventory integer default 0,
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable RLS for medications
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Create policy for medications
CREATE POLICY "Users can manage their own medications"
  ON medications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create medication_logs table
CREATE TABLE IF NOT EXISTS medication_logs (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  medication_id text references medications(id) on delete cascade,
  timestamp timestamp with time zone default now(),
  status text check (status in ('taken', 'skipped', 'missed'))
);

-- Enable RLS for medication_logs
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for medication_logs
CREATE POLICY "Users can manage their own medication logs"
  ON medication_logs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_medication_id ON medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_timestamp ON medication_logs(timestamp);

-- Create a function to automatically create a profile for new users
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, is_premium, trial_ends_at, created_at, updated_at)
  VALUES (
    NEW.id,
    false,
    NOW() + INTERVAL '7 days',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user(); 