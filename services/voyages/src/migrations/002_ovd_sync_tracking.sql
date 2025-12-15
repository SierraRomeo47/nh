-- OVD Sync Tracking Database Schema
-- Tracks OVD file imports, exports, and automated synchronization

-- OVD File Metadata Table
-- Stores information about uploaded and generated OVD files
CREATE TABLE IF NOT EXISTS ovd_file_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    file_type VARCHAR(10) CHECK (file_type IN ('xlsx', 'xls')),
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('IMPORT', 'EXPORT')),
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    voyage_id UUID REFERENCES voyages(id) ON DELETE SET NULL,
    ship_id UUID,
    imo_number VARCHAR(20),
    record_count INTEGER DEFAULT 0,
    date_range_start DATE,
    date_range_end DATE,
    processing_status VARCHAR(20) DEFAULT 'PENDING' CHECK (processing_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OVD Sync History Table
-- Tracks all sync operations (manual and automated)
CREATE TABLE IF NOT EXISTS ovd_sync_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_type VARCHAR(20) NOT NULL CHECK (sync_type IN ('MANUAL', 'AUTOMATED')),
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('IMPORT', 'EXPORT', 'BIDIRECTIONAL')),
    direction VARCHAR(20) CHECK (direction IN ('TO_OVD', 'FROM_OVD', 'BIDIRECTIONAL')),
    initiated_by UUID,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED')),
    records_processed INTEGER DEFAULT 0,
    records_imported INTEGER DEFAULT 0,
    records_exported INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_log TEXT,
    file_metadata_id UUID REFERENCES ovd_file_metadata(id) ON DELETE SET NULL,
    sync_config_id UUID,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OVD Sync Configuration Table
-- Stores automated sync schedules and settings
CREATE TABLE IF NOT EXISTS ovd_sync_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_name VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT false,
    sync_direction VARCHAR(20) NOT NULL CHECK (sync_direction IN ('IMPORT_ONLY', 'EXPORT_ONLY', 'BIDIRECTIONAL')),
    schedule_frequency VARCHAR(20) NOT NULL CHECK (schedule_frequency IN ('HOURLY', 'DAILY', 'WEEKLY', 'CUSTOM')),
    cron_expression VARCHAR(50),
    organization_id UUID,
    vessel_filter JSONB, -- Filter specific vessels
    date_range_filter JSONB, -- Date range configuration
    auto_approve BOOLEAN DEFAULT false,
    notification_emails TEXT[], -- Array of email addresses
    notify_on_error BOOLEAN DEFAULT true,
    notify_on_success BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    next_sync_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(config_name, organization_id)
);

-- OVD Import Validation Errors Table
-- Stores validation errors for imported data
CREATE TABLE IF NOT EXISTS ovd_import_validation_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_history_id UUID REFERENCES ovd_sync_history(id) ON DELETE CASCADE,
    file_metadata_id UUID REFERENCES ovd_file_metadata(id) ON DELETE CASCADE,
    row_number INTEGER,
    field_name VARCHAR(100),
    error_type VARCHAR(50) CHECK (error_type IN ('MISSING_FIELD', 'INVALID_FORMAT', 'OUT_OF_RANGE', 'DUPLICATE', 'REFERENCE_ERROR', 'VALIDATION_FAILED')),
    error_message TEXT NOT NULL,
    field_value TEXT,
    severity VARCHAR(20) DEFAULT 'ERROR' CHECK (severity IN ('WARNING', 'ERROR', 'CRITICAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ovd_file_metadata_voyage ON ovd_file_metadata(voyage_id);
CREATE INDEX IF NOT EXISTS idx_ovd_file_metadata_ship ON ovd_file_metadata(ship_id);
CREATE INDEX IF NOT EXISTS idx_ovd_file_metadata_uploaded_at ON ovd_file_metadata(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_ovd_file_metadata_status ON ovd_file_metadata(processing_status);

CREATE INDEX IF NOT EXISTS idx_ovd_sync_history_status ON ovd_sync_history(status);
CREATE INDEX IF NOT EXISTS idx_ovd_sync_history_initiated_at ON ovd_sync_history(initiated_at);
CREATE INDEX IF NOT EXISTS idx_ovd_sync_history_sync_type ON ovd_sync_history(sync_type);

CREATE INDEX IF NOT EXISTS idx_ovd_sync_config_enabled ON ovd_sync_config(enabled);
CREATE INDEX IF NOT EXISTS idx_ovd_sync_config_next_sync ON ovd_sync_config(next_sync_at) WHERE enabled = true;

CREATE INDEX IF NOT EXISTS idx_ovd_validation_errors_sync ON ovd_import_validation_errors(sync_history_id);
CREATE INDEX IF NOT EXISTS idx_ovd_validation_errors_severity ON ovd_import_validation_errors(severity);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ovd_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ovd_file_metadata_updated_at
    BEFORE UPDATE ON ovd_file_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_ovd_updated_at_column();

CREATE TRIGGER update_ovd_sync_config_updated_at
    BEFORE UPDATE ON ovd_sync_config
    FOR EACH ROW
    EXECUTE FUNCTION update_ovd_updated_at_column();

-- OVD Audit Log Table
-- Tracks all user actions and changes in OVD system
CREATE TABLE IF NOT EXISTS ovd_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'IMPORT_FILE', 'EXPORT_FILE', 'DELETE_FILE', 
        'CREATE_SYNC_CONFIG', 'UPDATE_SYNC_CONFIG', 'DELETE_SYNC_CONFIG',
        'TRIGGER_MANUAL_SYNC', 'APPROVE_DATA', 'REJECT_DATA',
        'UPDATE_FUEL_RECORD', 'DELETE_FUEL_RECORD'
    )),
    entity_type VARCHAR(50) CHECK (entity_type IN ('FILE', 'SYNC_CONFIG', 'FUEL_RECORD', 'SYNC_OPERATION')),
    entity_id UUID,
    changes JSONB, -- Stores before/after values
    metadata JSONB, -- Additional context
    ip_address VARCHAR(45),
    user_agent TEXT,
    result VARCHAR(20) CHECK (result IN ('SUCCESS', 'FAILED', 'PARTIAL')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_ovd_audit_log_user ON ovd_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ovd_audit_log_action ON ovd_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_ovd_audit_log_entity ON ovd_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ovd_audit_log_created ON ovd_audit_log(created_at);

-- Add comments for documentation
COMMENT ON TABLE ovd_file_metadata IS 'Stores metadata about OVD Excel files uploaded or generated';
COMMENT ON TABLE ovd_sync_history IS 'Audit log of all OVD sync operations';
COMMENT ON TABLE ovd_sync_config IS 'Configuration for automated OVD synchronization';
COMMENT ON TABLE ovd_import_validation_errors IS 'Validation errors encountered during OVD import';
COMMENT ON TABLE ovd_audit_log IS 'Comprehensive audit trail of all user actions in OVD system';

