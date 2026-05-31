-- Run this in your Supabase SQL Editor

-- 1. Add key_hash and key_prefix columns to existing Projects_apiD table
ALTER TABLE "Projects_apiD" ADD COLUMN IF NOT EXISTS key_hash TEXT;
ALTER TABLE "Projects_apiD" ADD COLUMN IF NOT EXISTS key_prefix TEXT;

-- 2. Backfill: hash any existing plaintext API keys
--    This generates SHA-256 hashes for keys already stored
UPDATE "Projects_apiD"
SET key_hash = encode(sha256(("API_key")::bytea), 'hex'),
    key_prefix = LEFT("API_key", 8)
WHERE "API_key" IS NOT NULL AND key_hash IS NULL;

-- 3. Make columns NOT NULL after backfill
ALTER TABLE "Projects_apiD" ALTER COLUMN key_hash SET NOT NULL;
ALTER TABLE "Projects_apiD" ALTER COLUMN key_prefix SET NOT NULL;

-- 4. Unique constraint + index on key_prefix for fast auth lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_key_prefix ON "Projects_apiD"(key_prefix);

-- 5. Index on project_id for Logs queries
CREATE INDEX IF NOT EXISTS idx_logs_project_id ON "Logs_apiD"(project_id);

-- 6. Enable RLS on both tables
ALTER TABLE "Projects_apiD" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Logs_apiD" ENABLE ROW LEVEL SECURITY;

-- 7. RLS: Allow anon to SELECT on Projects (needed for API key auth middleware)
CREATE POLICY "anon_select_projects" ON "Projects_apiD"
  FOR SELECT
  TO anon
  USING (true);

-- 8. RLS: Allow anon to INSERT on Projects (needed for project creation API)
CREATE POLICY "anon_insert_projects" ON "Projects_apiD"
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 9. RLS: Allow anon to DELETE on Projects
CREATE POLICY "anon_delete_projects" ON "Projects_apiD"
  FOR DELETE
  TO anon
  USING (true);

-- 10. RLS: Allow anon to INSERT into Logs
--     Skip this if a policy already exists (the SDK log ingestion already works)
-- CREATE POLICY "anon_insert_logs" ON "Logs_apiD"
--   FOR INSERT
--   TO anon
--   WITH CHECK (true);

-- === Incident Grouping Engine ===

-- 11. Add columns for auto-grouping on Incidents_apiD
ALTER TABLE "Incidents_apiD" ADD COLUMN IF NOT EXISTS endpoint TEXT;
ALTER TABLE "Incidents_apiD" ADD COLUMN IF NOT EXISTS method TEXT;
ALTER TABLE "Incidents_apiD" ADD COLUMN IF NOT EXISTS status_code TEXT;
ALTER TABLE "Incidents_apiD" ADD COLUMN IF NOT EXISTS error_fingerprint TEXT;

-- 12. Index for fast matching (lookup open incidents by grouping key)
CREATE INDEX IF NOT EXISTS idx_incidents_lookup
  ON "Incidents_apiD"(project_id, endpoint, method, status_code, error_fingerprint)
  WHERE status IN ('open', 'investigating');

-- 13. Index for listing by project
CREATE INDEX IF NOT EXISTS idx_incidents_project
  ON "Incidents_apiD"(project_id, last_seen DESC);

-- === AI Analysis Engine ===

-- 14. Create ai_analysis table for storing DeepSeek AI insights
CREATE TABLE IF NOT EXISTS "ai_analysis_apiD" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES "Incidents_apiD"(id) ON DELETE CASCADE,
  summary TEXT,
  severity TEXT,
  probable_cause TEXT,
  affected_component TEXT,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  suggested_fix TEXT,
  incident_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Index for fast lookup by incident
CREATE INDEX IF NOT EXISTS idx_ai_analysis_incident
  ON "ai_analysis_apiD"(incident_id);

-- 16. Index for listing latest analyses (dashboard)
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created
  ON "ai_analysis_apiD"(created_at DESC);

-- 17. RLS: Allow anon to SELECT on ai_analysis
ALTER TABLE "ai_analysis_apiD" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_ai_analysis" ON "ai_analysis_apiD"
  FOR SELECT
  TO anon
  USING (true);

-- 18. RLS: Allow anon to INSERT on ai_analysis
CREATE POLICY "anon_insert_ai_analysis" ON "ai_analysis_apiD"
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 19. RLS: Allow anon to UPDATE on ai_analysis
CREATE POLICY "anon_update_ai_analysis" ON "ai_analysis_apiD"
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
