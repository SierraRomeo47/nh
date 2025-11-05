export interface ComplianceCheck {
  id: string;
  vesselId: string;
  checkType: string;
  status: 'pass' | 'fail' | 'pending';
  checkedAt: Date;
  createdAt: Date;
}

export interface ComplianceRequest {
  vesselId: string;
  checkType: string;
}


