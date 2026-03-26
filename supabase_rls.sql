-- Supabase RLS policy script for Premium Charity Platform

-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pool_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Utility policy for admins: check profile is_admin
CREATE POLICY admin_access ON profiles FOR ALL
  USING (is_admin = true)
  WITH CHECK (is_admin = true);

-- profile access for self: select/update own row
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "profiles_insert_any" ON profiles
  FOR INSERT USING (true);

-- Global admin policy for all tables (needs db function for meets_admin?)
CREATE POLICY "admin_all_tables" ON subscriptions FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_payments" ON payments FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_subscription_allocations" ON subscription_allocations FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_user_charities" ON user_charities FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_charity_transactions" ON charity_transactions FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_scores" ON scores FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_draws" ON draws FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_draw_participants" ON draw_participants FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_draw_simulations" ON draw_simulations FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_draw_results" ON draw_results FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_prize_pools" ON prize_pools FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_prize_pool_contributions" ON prize_pool_contributions FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_winners" ON winners FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_proofs" ON proofs FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_notifications" ON notifications FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "admin_all_tables_admin_logs" ON admin_logs FOR ALL
  USING (exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- User policies
CREATE POLICY "self_subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "self_subscriptions_insert" ON subscriptions
  FOR INSERT USING (user_id = auth.uid());
CREATE POLICY "self_subscriptions_update" ON subscriptions
  FOR UPDATE USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));

CREATE POLICY "self_payments" ON payments
  FOR SELECT USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "self_payments_insert" ON payments
  FOR INSERT USING (user_id = auth.uid());

CREATE POLICY "self_scores" ON scores
  FOR SELECT USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "self_scores_insert" ON scores
  FOR INSERT USING (user_id = auth.uid());
CREATE POLICY "self_scores_update" ON scores
  FOR UPDATE USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "self_scores_delete" ON scores
  FOR DELETE USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));

CREATE POLICY "self_user_charities" ON user_charities
  FOR SELECT USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "self_user_charities_insert" ON user_charities
  FOR INSERT USING (user_id = auth.uid());
CREATE POLICY "self_user_charities_update" ON user_charities
  FOR UPDATE USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));

CREATE POLICY "self_charity_transactions" ON charity_transactions
  FOR SELECT USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "self_charity_transactions_insert" ON charity_transactions
  FOR INSERT USING (user_id = auth.uid());

CREATE POLICY "self_draw_results" ON draw_results
  FOR SELECT USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));

CREATE POLICY "self_winners" ON winners
  FOR SELECT USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));

CREATE POLICY "self_proofs" ON proofs
  FOR SELECT USING (winner_id IN (SELECT id FROM winners WHERE user_id = auth.uid()) OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
CREATE POLICY "self_proofs_insert" ON proofs
  FOR INSERT USING (exists(select 1 from winners w where w.id = winner_id and w.user_id = auth.uid()));

CREATE POLICY "self_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid() OR exists(select 1 from profiles p where p.id = auth.uid() and p.is_admin));
