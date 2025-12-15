// OVD Service - Frontend API client for OVD operations
import {
  OVDImportResult,
  OVDExportRequest,
  OVDSyncStatus,
  OVDSyncConfig,
  OVDAuditLog,
  DateRange
} from '../types/ovd';

const API_BASE_URL = 'http://localhost:8080/voyages/api/voyages/ovd';

/**
 * Upload OVD Excel file for import
 */
export async function uploadOVDFile(
  file: File,
  voyageId?: string,
  shipId?: string
): Promise<OVDImportResult> {
  const formData = new FormData();
  formData.append('ovdFile', file);
  if (voyageId) {
    formData.append('voyageId', voyageId);
  }
  if (shipId) {
    formData.append('shipId', shipId);
  }
  
  const response = await fetch(`${API_BASE_URL}/import`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload OVD file');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Export fuel consumption data as OVD Excel file
 */
export async function exportOVDData(
  exportRequest: OVDExportRequest
): Promise<Blob> {
  const params = new URLSearchParams();
  params.append('startDate', exportRequest.startDate);
  params.append('endDate', exportRequest.endDate);
  
  if (exportRequest.voyageId) {
    params.append('voyageId', exportRequest.voyageId);
  }
  
  if (exportRequest.shipId) {
    params.append('shipId', exportRequest.shipId);
  }
  
  const response = await fetch(`${API_BASE_URL}/export?${params.toString()}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to export OVD data');
  }
  
  return await response.blob();
}

/**
 * Trigger manual sync operation
 */
export async function triggerManualSync(
  direction: 'IMPORT' | 'EXPORT' | 'BIDIRECTIONAL',
  voyageId?: string,
  dateRange?: DateRange
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ direction, voyageId, dateRange }),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to trigger manual sync');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Get sync status and history
 */
export async function getSyncStatus(limit: number = 10): Promise<OVDSyncStatus[]> {
  const response = await fetch(`${API_BASE_URL}/sync-status?limit=${limit}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get sync status');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Get sync schedule configuration
 */
export async function getSyncSchedule(): Promise<OVDSyncConfig[]> {
  const response = await fetch(`${API_BASE_URL}/schedule`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get sync schedule');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Configure automated sync schedule
 */
export async function configureSyncSchedule(
  config: Partial<OVDSyncConfig>
): Promise<OVDSyncConfig> {
  const response = await fetch(`${API_BASE_URL}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to configure sync schedule');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Update sync schedule configuration
 */
export async function updateSyncSchedule(
  id: string,
  config: Partial<OVDSyncConfig>
): Promise<OVDSyncConfig> {
  const response = await fetch(`${API_BASE_URL}/schedule/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update sync schedule');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Delete sync schedule configuration
 */
export async function deleteSyncSchedule(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/schedule/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete sync schedule');
  }
}

/**
 * Get audit log
 */
export async function getAuditLog(filters?: {
  limit?: number;
  actionType?: string;
  result?: string;
  startDate?: string;
  endDate?: string;
}): Promise<OVDAuditLog[]> {
  const params = new URLSearchParams();
  
  if (filters?.limit) {
    params.append('limit', filters.limit.toString());
  }
  if (filters?.actionType) {
    params.append('actionType', filters.actionType);
  }
  if (filters?.result) {
    params.append('result', filters.result);
  }
  if (filters?.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters?.endDate) {
    params.append('endDate', filters.endDate);
  }
  
  const response = await fetch(`${API_BASE_URL}/audit-log?${params.toString()}`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get audit log');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Download file from blob
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

