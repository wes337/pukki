CREATE TABLE pukki.users (
  user_id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_]{3,32}$'),
  password_hash text NOT NULL,
  name text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pukki.gifts (
  id uuid PRIMARY KEY,
  "user" uuid NOT NULL REFERENCES pukki.users(user_id),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
  description text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  claimed_by uuid REFERENCES pukki.users(user_id),
  CHECK (claimed_by IS NULL OR claimed_by <> "user")
);
CREATE INDEX gifts_owner_idx ON pukki.gifts ("user");
CREATE INDEX gifts_claimant_idx ON pukki.gifts (claimed_by);

CREATE TABLE pukki.sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES pukki.users(user_id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX sessions_expiry_idx ON pukki.sessions (expires_at);

CREATE TABLE pukki.login_attempts (
  username text PRIMARY KEY,
  attempts integer NOT NULL,
  expires_at timestamptz NOT NULL
);
