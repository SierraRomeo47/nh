import { AuditDecision, LedgerEntry } from '../types/index';
import { generateAuditNarrative } from './geminiService';

// Audit service for compliance decision tracking
export class AuditService {
  private decisions: AuditDecision[] = [];
  private ledgerEntries: LedgerEntry[] = [];

  // Record a compliance decision with full audit trail
  async recordDecision(
    decisionType: AuditDecision['decisionType'],
    inputs: Record<string, any>,
    outputs: Record<string, any>,
    userId: string,
    policies?: Record<string, any>
  ): Promise<AuditDecision> {
    const decision: AuditDecision = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      decisionType,
      inputs,
      outputs,
      policies: policies || this.getCurrentPolicies(),
      userId
    };

    this.decisions.push(decision);
    return decision;
  }

  // Generate comprehensive audit pack
  async generateAuditPack(decisionId: string): Promise<{
    decision: AuditDecision;
    ledgerEntries: LedgerEntry[];
    narrative: string;
    downloadUrl: string;
  }> {
    const decision = this.decisions.find(d => d.id === decisionId);
    if (!decision) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    // Get related ledger entries
    const relatedEntries = this.ledgerEntries.filter(entry => 
      entry.refType.includes(decision.decisionType) || 
      entry.refId === decisionId
    );

    // Generate AI narrative
    const narrative = await generateAuditNarrative(
      decision.decisionType,
      decision.inputs,
      decision.outputs
    );

    // Create audit pack structure
    const auditPack = {
      metadata: {
        decisionId,
        generatedAt: new Date().toISOString(),
        version: '1.0',
        regulations: ['FuelEU Maritime', 'EU ETS', 'IMO DCS']
      },
      decision,
      ledgerEntries: relatedEntries,
      narrative,
      policies: decision.policies,
      summary: {
        totalFinancialImpact: relatedEntries.reduce((sum, entry) => sum + entry.amountEur, 0),
        complianceStatus: 'COMPLIANT',
        riskLevel: 'LOW'
      }
    };

    // In a real implementation, this would upload to cloud storage
    const downloadUrl = await this.createDownloadableAuditPack(auditPack);

    return {
      decision,
      ledgerEntries: relatedEntries,
      narrative,
      downloadUrl
    };
  }

  // Add ledger entry linked to audit decision
  addLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'timestamp'>): LedgerEntry {
    const ledgerEntry: LedgerEntry = {
      ...entry,
      id: `ledger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    this.ledgerEntries.push(ledgerEntry);
    return ledgerEntry;
  }

  // Get all decisions for a time period
  getDecisions(startDate?: string, endDate?: string): AuditDecision[] {
    let filtered = this.decisions;

    if (startDate) {
      filtered = filtered.filter(d => d.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(d => d.timestamp <= endDate);
    }

    return filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  // Get ledger entries for audit trail
  getLedgerEntries(refType?: string, refId?: string): LedgerEntry[] {
    let filtered = this.ledgerEntries;

    if (refType) {
      filtered = filtered.filter(entry => entry.refType === refType);
    }

    if (refId) {
      filtered = filtered.filter(entry => entry.refId === refId);
    }

    return filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  // Validate compliance decision against policies
  validateDecision(decision: AuditDecision): {
    isValid: boolean;
    violations: string[];
    warnings: string[];
  } {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Example validation rules
    switch (decision.decisionType) {
      case 'POOL_ACCEPT':
        if (!decision.inputs.rfqId || !decision.inputs.offerId) {
          violations.push('Missing required RFQ or offer ID');
        }
        if (decision.outputs.totalCost > 1000000) {
          warnings.push('High-value transaction requires additional approval');
        }
        break;

      case 'BORROW':
        const borrowAmount = decision.inputs.amount || 0;
        const borrowCap = decision.policies?.fueleuBorrowCaps || 0.02;
        if (borrowAmount > borrowCap) {
          violations.push(`Borrowing amount exceeds cap of ${borrowCap * 100}%`);
        }
        break;

      case 'HEDGE_EXECUTE':
        if (!decision.inputs.hedgeType || !decision.inputs.quantity) {
          violations.push('Missing hedge parameters');
        }
        break;
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings
    };
  }

  // Export audit data for regulatory reporting
  async exportComplianceReport(
    startDate: string,
    endDate: string,
    format: 'JSON' | 'CSV' | 'XML' = 'JSON'
  ): Promise<string> {
    const decisions = this.getDecisions(startDate, endDate);
    const ledgerEntries = this.getLedgerEntries();
    
    const report = {
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        period: { start: startDate, end: endDate },
        totalDecisions: decisions.length,
        totalFinancialImpact: ledgerEntries.reduce((sum, entry) => sum + entry.amountEur, 0)
      },
      decisions,
      ledgerEntries: ledgerEntries.filter(entry => 
        entry.timestamp >= startDate && entry.timestamp <= endDate
      ),
      summary: {
        decisionsByType: this.groupDecisionsByType(decisions),
        complianceStatus: 'COMPLIANT',
        auditTrailComplete: true
      }
    };

    switch (format) {
      case 'JSON':
        return JSON.stringify(report, null, 2);
      case 'CSV':
        return this.convertToCSV(report);
      case 'XML':
        return this.convertToXML(report);
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  // Private helper methods
  private getCurrentPolicies(): Record<string, any> {
    return {
      version: '1.0',
      effectiveDate: '2025-01-01',
      fueleuPenaltyEurPerGj: 60,
      fueleuBorrowCaps: 0.02,
      etsRampSchedule: {
        2025: 0.4,
        2026: 0.7,
        2027: 1.0
      },
      poolingRules: 'One pool per period per ship',
      auditRetention: '7 years'
    };
  }

  private async createDownloadableAuditPack(auditPack: any): Promise<string> {
    // In a real implementation, this would:
    // 1. Generate PDF summary
    // 2. Create CSV exports
    // 3. Package as ZIP
    // 4. Upload to secure storage
    // 5. Return signed download URL
    
    // Mock implementation
    const packId = `audit-pack-${auditPack.metadata.decisionId}`;
    const mockUrl = `/api/v1/audit/download/${packId}`;
    
    return mockUrl;
  }

  private groupDecisionsByType(decisions: AuditDecision[]): Record<string, number> {
    return decisions.reduce((acc, decision) => {
      acc[decision.decisionType] = (acc[decision.decisionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private convertToCSV(report: any): string {
    // Simple CSV conversion for decisions
    const headers = ['ID', 'Timestamp', 'Type', 'User', 'Financial Impact'];
    const rows = report.decisions.map((d: AuditDecision) => [
      d.id,
      d.timestamp,
      d.decisionType,
      d.userId,
      report.ledgerEntries.find((e: LedgerEntry) => e.refId === d.id)?.amountEur || 0
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertToXML(report: any): string {
    // Simple XML conversion
    return `<?xml version="1.0" encoding="UTF-8"?>
<ComplianceReport>
  <Metadata>
    <GeneratedAt>${report.reportMetadata.generatedAt}</GeneratedAt>
    <Period start="${report.reportMetadata.period.start}" end="${report.reportMetadata.period.end}" />
    <TotalDecisions>${report.reportMetadata.totalDecisions}</TotalDecisions>
  </Metadata>
  <Decisions>
    ${report.decisions.map((d: AuditDecision) => `
    <Decision id="${d.id}" type="${d.decisionType}" timestamp="${d.timestamp}" user="${d.userId}" />
    `).join('')}
  </Decisions>
</ComplianceReport>`;
  }
}

// Singleton instance
export const auditService = new AuditService();

