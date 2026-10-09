CREATE TABLE pukki.password_resets (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES pukki.users(user_id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX password_resets_user_idx ON pukki.password_resets (user_id);
CREATE INDEX password_resets_expiry_idx ON pukki.password_resets (expires_at);
