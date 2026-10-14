-- ============================================================================
-- Migration 006: Product Catalogue, Manufacturing & Inventory
-- ============================================================================

-- Product Categories (11 Master Categories)
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Products (111-Product Pharmaceutical Catalogue)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    product_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    generic_name VARCHAR(255),
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    category_name VARCHAR(255),
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    pack_size VARCHAR(100),
    therapeutic_class VARCHAR(255),
    storage_conditions VARCHAR(255),
    shelf_life_months INT,
    unit_price NUMERIC(12, 2) DEFAULT 0.0,
    mrp NUMERIC(12, 2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    regulatory_status VARCHAR(100),
    specifications JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Warehouses (1 Record)
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    location VARCHAR(255),
    capacity JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Production Lines (2 Lines)
CREATE TABLE IF NOT EXISTS production_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    line_code VARCHAR(50) UNIQUE,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    capacity_per_hour INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Manufacturing Batches (2 Batches)
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_code VARCHAR(100),
    product_name VARCHAR(255),
    batch_size INT NOT NULL,
    manufacturing_date DATE,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'RELEASED', -- 'QUARANTINE', 'TESTING', 'RELEASED', 'REJECTED'
    qa_release_status VARCHAR(50),
    qa_released_by UUID REFERENCES users(id) ON DELETE SET NULL,
    qa_released_at TIMESTAMPTZ,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_batches_num ON batches(batch_number);

-- Inventory Items (1 Item)
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    item_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    item_type VARCHAR(50),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    quantity_on_hand NUMERIC(12, 2) DEFAULT 0.0,
    reorder_level NUMERIC(12, 2) DEFAULT 0.0,
    unit_of_measure VARCHAR(50),
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Transactions (2 Transactions)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'INWARD', 'OUTWARD', 'TRANSFER', 'ADJUSTMENT'
    quantity NUMERIC(12, 2) NOT NULL,
    batch_number VARCHAR(100),
    source_location VARCHAR(255),
    destination_location VARCHAR(255),
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    remarks TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
