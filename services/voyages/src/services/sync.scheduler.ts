// Automated sync scheduler for OVD operations
import cron from 'node-cron';
import pool from '../config/database';
import { OVDService } from './ovd.service';
import { logAuditEvent } from '../utils/audit-logger';

interface SyncConfig {
  id: string;
  configName: string;
  enabled: boolean;
  syncDirection: 'IMPORT_ONLY' | 'EXPORT_ONLY' | 'BIDIRECTIONAL';
  scheduleFrequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'CUSTOM';
  cronExpression: string | null;
  organizationId: string | null;
  vesselFilter: any;
  dateRangeFilter: any;
  autoApprove: boolean;
  notificationEmails: string[];
  notifyOnError: boolean;
  notifyOnSuccess: boolean;
  maxRetries: number;
}

class SyncScheduler {
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();
  private isInitialized: boolean = false;
  
  /**
   * Initialize the scheduler and load configurations from database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Sync scheduler already initialized');
      return;
    }
    
    try {
      console.log('Initializing OVD sync scheduler...');
      
      // Load all enabled sync configurations
      const result = await pool.query(
        'SELECT * FROM ovd_sync_config WHERE enabled = true'
      );
      
      const configs: SyncConfig[] = result.rows;
      console.log(`Found ${configs.length} enabled sync configurations`);
      
      // Schedule each configuration
      for (const config of configs) {
        await this.scheduleSync(config);
      }
      
      this.isInitialized = true;
      console.log('OVD sync scheduler initialized successfully');
    } catch (error) {
      console.error('Failed to initialize sync scheduler:', error);
      throw error;
    }
  }
  
  /**
   * Schedule a sync job based on configuration
   */
  async scheduleSync(config: SyncConfig): Promise<void> {
    try {
      // Get cron expression
      const cronExpression = this.getCronExpression(config);
      
      if (!cronExpression) {
        console.warn(`No valid cron expression for config ${config.configName}`);
        return;
      }
      
      // Validate cron expression
      if (!cron.validate(cronExpression)) {
        console.error(`Invalid cron expression for config ${config.configName}: ${cronExpression}`);
        return;
      }
      
      // Cancel existing job if any
      if (this.scheduledJobs.has(config.id)) {
        this.scheduledJobs.get(config.id)?.stop();
        this.scheduledJobs.delete(config.id);
      }
      
      // Create new scheduled job
      const job = cron.schedule(cronExpression, async () => {
        await this.executeSyncJob(config);
      });
      
      this.scheduledJobs.set(config.id, job);
      
      // Update next sync time in database
      await this.updateNextSyncTime(config.id, cronExpression);
      
      console.log(`Scheduled sync job for ${config.configName} with cron: ${cronExpression}`);
    } catch (error) {
      console.error(`Failed to schedule sync for ${config.configName}:`, error);
    }
  }
  
  /**
   * Execute a scheduled sync job
   */
  private async executeSyncJob(config: SyncConfig): Promise<void> {
    const startTime = Date.now();
    
    console.log(`Executing scheduled sync: ${config.configName}`);
    
    try {
      // Log sync start
      const syncHistoryResult = await pool.query(
        `INSERT INTO ovd_sync_history (
          sync_type, operation, direction, initiated_by, sync_config_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [
          'AUTOMATED',
          config.syncDirection === 'BIDIRECTIONAL' ? 'BIDIRECTIONAL' : 
            config.syncDirection === 'IMPORT_ONLY' ? 'IMPORT' : 'EXPORT',
          config.syncDirection === 'IMPORT_ONLY' ? 'FROM_OVD' : 
            config.syncDirection === 'EXPORT_ONLY' ? 'TO_OVD' : 'BIDIRECTIONAL',
          null, // System-initiated
          config.id,
          'IN_PROGRESS'
        ]
      );
      
      const syncHistoryId = syncHistoryResult.rows[0].id;
      let success = true;
      let errorMessage: string | null = null;
      
      // Execute sync based on direction
      if (config.syncDirection === 'EXPORT_ONLY' || config.syncDirection === 'BIDIRECTIONAL') {
        await this.executeExportSync(config, syncHistoryId);
      }
      
      if (config.syncDirection === 'IMPORT_ONLY' || config.syncDirection === 'BIDIRECTIONAL') {
        await this.executeImportSync(config, syncHistoryId);
      }
      
      const executionTime = Date.now() - startTime;
      
      // Update sync history
      await pool.query(
        `UPDATE ovd_sync_history SET
          status = $1, completed_at = NOW(), execution_time_ms = $2, error_log = $3
        WHERE id = $4`,
        [success ? 'SUCCESS' : 'FAILED', executionTime, errorMessage, syncHistoryId]
      );
      
      // Update last sync time
      await pool.query(
        'UPDATE ovd_sync_config SET last_sync_at = NOW(), retry_count = 0 WHERE id = $1',
        [config.id]
      );
      
      // Send notifications
      if ((success && config.notifyOnSuccess) || (!success && config.notifyOnError)) {
        await this.sendNotification(config, success, errorMessage);
      }
      
      console.log(`Sync job completed: ${config.configName} (${executionTime}ms)`);
    } catch (error: any) {
      console.error(`Sync job failed: ${config.configName}`, error);
      
      // Handle retry logic
      await this.handleSyncFailure(config, error.message);
    }
  }
  
  /**
   * Execute export sync
   */
  private async executeExportSync(config: SyncConfig, syncHistoryId: string): Promise<void> {
    // Extract date range from filter
    const dateRange = config.dateRangeFilter || {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
      endDate: new Date().toISOString().split('T')[0]
    };
    
    // Export data
    await OVDService.exportOVDFile(
      'system', // System user ID
      null, // All voyages
      dateRange
    );
  }
  
  /**
   * Execute import sync
   */
  private async executeImportSync(config: SyncConfig, syncHistoryId: string): Promise<void> {
    // In a real implementation, this would fetch data from an external OVD system
    // For now, this is a placeholder
    console.log('Import sync placeholder - would fetch from external system');
  }
  
  /**
   * Handle sync failure and retry logic
   */
  private async handleSyncFailure(config: SyncConfig, errorMessage: string): Promise<void> {
    const result = await pool.query(
      'SELECT retry_count FROM ovd_sync_config WHERE id = $1',
      [config.id]
    );
    
    const currentRetryCount = result.rows[0]?.retry_count || 0;
    
    if (currentRetryCount < config.maxRetries) {
      // Increment retry count
      await pool.query(
        'UPDATE ovd_sync_config SET retry_count = retry_count + 1 WHERE id = $1',
        [config.id]
      );
      
      console.log(`Will retry sync for ${config.configName} (attempt ${currentRetryCount + 1}/${config.maxRetries})`);
    } else {
      // Max retries reached, disable the sync
      await pool.query(
        'UPDATE ovd_sync_config SET enabled = false, retry_count = 0 WHERE id = $1',
        [config.id]
      );
      
      // Unschedule the job
      if (this.scheduledJobs.has(config.id)) {
        this.scheduledJobs.get(config.id)?.stop();
        this.scheduledJobs.delete(config.id);
      }
      
      console.error(`Max retries reached for ${config.configName}, sync disabled`);
      
      // Send failure notification
      if (config.notifyOnError) {
        await this.sendNotification(config, false, `Max retries reached: ${errorMessage}`);
      }
    }
  }
  
  /**
   * Send notification email (placeholder)
   */
  private async sendNotification(
    config: SyncConfig,
    success: boolean,
    errorMessage: string | null
  ): Promise<void> {
    // In a real implementation, this would send email via SendGrid/SES/etc.
    console.log(`Notification for ${config.configName}:`, {
      success,
      errorMessage,
      recipients: config.notificationEmails
    });
  }
  
  /**
   * Get cron expression based on frequency
   */
  private getCronExpression(config: SyncConfig): string | null {
    if (config.cronExpression) {
      return config.cronExpression;
    }
    
    // Generate cron expression based on frequency
    switch (config.scheduleFrequency) {
      case 'HOURLY':
        return '0 * * * *'; // Every hour at minute 0
      case 'DAILY':
        return '0 2 * * *'; // Daily at 2 AM
      case 'WEEKLY':
        return '0 2 * * 0'; // Weekly on Sunday at 2 AM
      default:
        return null;
    }
  }
  
  /**
   * Update next sync time in database
   */
  private async updateNextSyncTime(configId: string, cronExpression: string): Promise<void> {
    // Calculate next execution time (simplified - in production use a library like cron-parser)
    const nextRun = new Date(Date.now() + 60 * 60 * 1000); // Placeholder: 1 hour from now
    
    await pool.query(
      'UPDATE ovd_sync_config SET next_sync_at = $1 WHERE id = $2',
      [nextRun, configId]
    );
  }
  
  /**
   * Stop a scheduled sync job
   */
  stopSync(configId: string): void {
    if (this.scheduledJobs.has(configId)) {
      this.scheduledJobs.get(configId)?.stop();
      this.scheduledJobs.delete(configId);
      console.log(`Stopped sync job for config ${configId}`);
    }
  }
  
  /**
   * Stop all scheduled sync jobs
   */
  stopAll(): void {
    this.scheduledJobs.forEach((job, configId) => {
      job.stop();
      console.log(`Stopped sync job for config ${configId}`);
    });
    this.scheduledJobs.clear();
    this.isInitialized = false;
  }
  
  /**
   * Reload sync configurations from database
   */
  async reload(): Promise<void> {
    console.log('Reloading sync configurations...');
    this.stopAll();
    await this.initialize();
  }
}

// Export singleton instance
export const syncScheduler = new SyncScheduler();

