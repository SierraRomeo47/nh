// OVD (Operational Vessel Data) TypeScript Types

export interface OVDImportRequest {
  file: File;
  voyageId?: string;
}

export interface OVDImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsImported: number;
  recordsFailed: number;
  errors: string[];
  syncHistoryId?: string;
  fileMetadataId?: string;
}

export interface OVDExportRequest {
  voyageId?: string;
  startDate: string;
  endDate: string;
  shipId?: string;
}

export interface OVDExportResult {
  success: boolean;
  fileName: string;
  filePath: string;
  recordCount: number;
  fileSize: number;
  fileMetadataId?: string;
}

export interface OVDSyncStatus {
  id: string;
  syncType: 'MANUAL' | 'AUTOMATED';
  operation: 'IMPORT' | 'EXPORT' | 'BIDIRECTIONAL';
  status: 'IN_PROGRESS' | 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  recordsProcessed: number;
  recordsImported: number;
  recordsExported: number;
  recordsFailed?: number;
  initiatedAt: string;
  completedAt?: string;
  fileName?: string;
  imoNumber?: string;
}

export interface OVDSyncConfig {
  id: string;
  configName: string;
  enabled: boolean;
  syncDirection: 'IMPORT_ONLY' | 'EXPORT_ONLY' | 'BIDIRECTIONAL';
  scheduleFrequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'CUSTOM';
  cronExpression?: string;
  organizationId?: string;
  vesselFilter?: any;
  dateRangeFilter?: any;
  autoApprove: boolean;
  notificationEmails?: string[];
  notifyOnError: boolean;
  notifyOnSuccess: boolean;
  lastSyncAt?: string;
  nextSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OVDSyncHistory {
  id: string;
  syncType: 'MANUAL' | 'AUTOMATED';
  operation: 'IMPORT' | 'EXPORT' | 'BIDIRECTIONAL';
  direction: 'TO_OVD' | 'FROM_OVD' | 'BIDIRECTIONAL';
  initiatedBy?: string;
  initiatedAt: string;
  completedAt?: string;
  status: 'IN_PROGRESS' | 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  recordsProcessed: number;
  recordsImported: number;
  recordsExported: number;
  recordsFailed: number;
  errorLog?: string;
  executionTimeMs?: number;
}

export interface OVDAuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  actionType: OVDAuditActionType;
  entityType?: OVDAuditEntityType;
  entityId?: string;
  changes?: any;
  metadata?: any;
  ipAddress?: string;
  result: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  errorMessage?: string;
  createdAt: string;
}

export type OVDAuditActionType = 
  | 'IMPORT_FILE'
  | 'EXPORT_FILE'
  | 'DELETE_FILE'
  | 'CREATE_SYNC_CONFIG'
  | 'UPDATE_SYNC_CONFIG'
  | 'DELETE_SYNC_CONFIG'
  | 'TRIGGER_MANUAL_SYNC'
  | 'APPROVE_DATA'
  | 'REJECT_DATA'
  | 'UPDATE_FUEL_RECORD'
  | 'DELETE_FUEL_RECORD';

export type OVDAuditEntityType = 
  | 'FILE'
  | 'SYNC_CONFIG'
  | 'FUEL_RECORD'
  | 'SYNC_OPERATION';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface OVDFileMetadata {
  id: string;
  fileName: string;
  filePath?: string;
  fileSizeBytes?: number;
  fileType: 'xlsx' | 'xls';
  operationType: 'IMPORT' | 'EXPORT';
  uploadedBy?: string;
  uploadedAt: string;
  voyageId?: string;
  shipId?: string;
  imoNumber?: string;
  recordCount: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
}

