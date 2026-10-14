-- ============================================================================
-- Migration 009: Regulatory Audit Log & Immutability Trigger
-- ============================================================================

-- Audit Logs (1,425 Live Compliance Records)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    actor_id UUID,
    actor_name VARCHAR(255),
    actor_role VARCHAR(100),
    actor_email VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    route VARCHAR(255),
    method VARCHAR(10),
    previous_state JSONB DEFAULT '{}'::jsonb,
    new_state JSONB DEFAULT '{}'::jsonb,
    diff JSONB DEFAULT '{}'::jsonb,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'SUCCESS',
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- Immutability Enforcement Function
CREATE OR REPLACE FUNCTION trg_block_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'GxP / 21 CFR Part 11 Compliance Violation: Modifying or deleting audit_logs records is strictly prohibited.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent any UPDATE or DELETE operations on audit_logs
DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION trg_block_audit_mutation();
