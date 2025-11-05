export interface Voyage {
  id: string;
  vesselId: string;
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface VoyageRequest {
  vesselId: string;
  origin: string;
  destination: string;
  startDate: Date;
  endDate: Date;
}


