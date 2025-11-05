export interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: string;
  createdAt: Date;
}

export interface VesselRequest {
  name: string;
  imo: string;
  type: string;
}


