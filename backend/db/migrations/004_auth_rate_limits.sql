CREATE TABLE pukki.auth_rate_limits (
  key text PRIMARY KEY,
  attempts integer NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE INDEX auth_rate_limits_expiry ON pukki.auth_rate_limits (expires_at);
