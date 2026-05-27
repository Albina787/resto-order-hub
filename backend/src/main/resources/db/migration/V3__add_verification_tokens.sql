-- Add email verification and password reset tokens to users
ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN password_reset_expires_at DATETIME DEFAULT NULL;
ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255) DEFAULT NULL;

-- Add indexes for token lookups
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);