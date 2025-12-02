-- Initialize TimescaleDB extension and setup
-- This script runs automatically when the PostgreSQL container starts

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable additional helpful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create database user if not exists (for safety)
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'eventuser') THEN
      CREATE USER eventuser WITH PASSWORD 'eventpass';
   END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE eventdb TO eventuser;
GRANT USAGE ON SCHEMA public TO eventuser;
GRANT CREATE ON SCHEMA public TO eventuser;

-- Print initialization complete message
SELECT 'TimescaleDB initialized successfully' as status;