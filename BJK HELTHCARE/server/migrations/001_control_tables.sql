-- ============================================================================
-- Migration 001: Migration Control & Identity Mapping Tables
-- ============================================================================

-- Track applied migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64) NOT NULL
);

-- Track migration run lifecycle
CREATE TABLE IF NOT EXISTS migration_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_type VARCHAR(32) NOT NULL, -- 'DRY_RUN', 'FULL_MIGRATION', 'DELTA_SYNC'
    status VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    total_source_docs INT DEFAULT 0,
    total_migrated INT DEFAULT 0,
    total_skipped INT DEFAULT 0,
    total_rejected INT DEFAULT 0,
    manifest_hash VARCHAR(128)
);

-- Deterministic ID mapping (Mongo ObjectId to PostgreSQL UUID)
CREATE TABLE IF NOT EXISTS migration_id_map (
    source_collection VARCHAR(64) NOT NULL,
    source_id VARCHAR(32) NOT NULL,
    target_table VARCHAR(64) NOT NULL,
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (source_collection, source_id)
);
CREATE INDEX IF NOT EXISTS idx_mig_map_target ON migration_id_map (target_table, target_id);

-- Checkpoints for restartable/resumable batching
CREATE TABLE IF NOT EXISTS migration_checkpoints (
    collection_name VARCHAR(64) PRIMARY KEY,
    last_source_id VARCHAR(32),
    migrated_count INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'PENDING',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Dead-letter table for rejected/exceptional records (PII redacted)
CREATE TABLE IF NOT EXISTS migration_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_name VARCHAR(64) NOT NULL,
    source_id VARCHAR(32) NOT NULL,
    error_message TEXT NOT NULL,
    payload_redacted JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_mig_ex_coll ON migration_exceptions (collection_name);
