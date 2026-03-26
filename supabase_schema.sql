-- Supabase schema for Premium Charity Platform (digital_heroes)
-- Generated from dataschema.md

-- ENUMS
CREATE TYPE subscription_status AS ENUM ('pending','active','cancelled','past_due','expired','suspended','deleted');
CREATE TYPE payment_status AS ENUM ('success','failed');
CREATE TYPE draw_type AS ENUM ('random','algorithmic');
CREATE TYPE draw_status AS ENUM ('pending','simulated','published');
CREATE TYPE winner_status AS ENUM ('pending','approved','rejected','paid');
CREATE TYPE proof_status AS ENUM ('pending','approved','rejected');
CREATE TYPE notification_type AS ENUM ('subscription','draw_result','winner');
CREATE TYPE notification_status AS ENUM ('sent','failed');
CREATE TYPE charity_transaction_source AS ENUM ('subscription','direct');

-- TABLES
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  full_name text,
  email text UNIQUE,
  country text,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles (id) ON DELETE CASCADE,
  plan_type text CHECK (plan_type in ('monthly','yearly')),
  status subscription_status NOT NULL DEFAULT 'pending',
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  stripe_subscription_id text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE payments (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles (id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL,
  stripe_payment_id text UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE subscription_allocations (
  id uuid PRIMARY KEY,
  payment_id uuid REFERENCES payments (id) ON DELETE CASCADE,
  prize_pool_amount numeric(12,2) NOT NULL CHECK (prize_pool_amount >= 0),
  charity_amount numeric(12,2) NOT NULL CHECK (charity_amount >= 0),
  platform_fee numeric(12,2) NOT NULL CHECK (platform_fee >= 0),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE charities (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  image_url text,
  country text,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE user_charities (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles (id) ON DELETE CASCADE,
  charity_id uuid REFERENCES charities (id) ON DELETE SET NULL,
  contribution_percentage numeric(5,2) NOT NULL CHECK (contribution_percentage >= 10),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE charity_transactions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles (id) ON DELETE CASCADE,
  charity_id uuid REFERENCES charities (id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  source charity_transaction_source NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE scores (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles (id) ON DELETE CASCADE,
  score int NOT NULL CHECK (score BETWEEN 1 AND 45),
  played_at date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT no_future_score CHECK (played_at <= now()::date)
);

CREATE TABLE draws (
  id uuid PRIMARY KEY,
  month int NOT NULL CHECK (month BETWEEN 1 AND 12),
  year int NOT NULL CHECK (year >= 2000),
  draw_type draw_type NOT NULL DEFAULT 'random',
  status draw_status NOT NULL DEFAULT 'pending',
  draw_numbers int[],
  is_locked boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone
);

CREATE TABLE draw_participants (
  id uuid PRIMARY KEY,
  draw_id uuid REFERENCES draws (id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles (id) ON DELETE CASCADE,
  is_eligible boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE draw_simulations (
  id uuid PRIMARY KEY,
  draw_id uuid REFERENCES draws (id) ON DELETE CASCADE,
  simulated_numbers int[],
  results_json jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE draw_results (
  id uuid PRIMARY KEY,
  draw_id uuid REFERENCES draws (id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles (id) ON DELETE CASCADE,
  matched_count int NOT NULL CHECK (matched_count BETWEEN 0 AND 5),
  is_winner boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE prize_pools (
  id uuid PRIMARY KEY,
  draw_id uuid REFERENCES draws (id) ON DELETE CASCADE UNIQUE,
  total_pool numeric(12,2) NOT NULL CHECK (total_pool >= 0),
  match_5_pool numeric(12,2) NOT NULL CHECK (match_5_pool >= 0),
  match_4_pool numeric(12,2) NOT NULL CHECK (match_4_pool >= 0),
  match_3_pool numeric(12,2) NOT NULL CHECK (match_3_pool >= 0),
  rollover_amount numeric(12,2) NOT NULL CHECK (rollover_amount >= 0),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE prize_pool_contributions (
  id uuid PRIMARY KEY,
  payment_id uuid REFERENCES payments (id) ON DELETE SET NULL,
  draw_id uuid REFERENCES draws (id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE winners (
  id uuid PRIMARY KEY,
  draw_id uuid REFERENCES draws (id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles (id) ON DELETE CASCADE,
  match_type text CHECK (match_type in ('match_3','match_4','match_5')),
  prize_amount numeric(12,2) NOT NULL CHECK (prize_amount >= 0),
  status winner_status NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE proofs (
  id uuid PRIMARY KEY,
  winner_id uuid REFERENCES winners (id) ON DELETE CASCADE,
  file_url text,
  status proof_status NOT NULL DEFAULT 'pending',
  uploaded_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles (id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  status notification_status NOT NULL DEFAULT 'sent',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE admin_logs (
  id uuid PRIMARY KEY,
  admin_id uuid,
  action text,
  entity_type text,
  entity_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_draw_participants_draw ON draw_participants(draw_id);
CREATE INDEX idx_draw_results_draw ON draw_results(draw_id);
CREATE INDEX idx_winners_draw ON winners(draw_id);
