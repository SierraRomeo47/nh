export interface TradingOpportunity {
  id: string;
  route: string;
  cargo: string;
  freightRate: number;
  availableAt: Date;
  createdAt: Date;
}

export interface TradingRequest {
  route: string;
  cargo: string;
  freightRate: number;
}


