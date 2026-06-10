export interface Neighborhood {
    id_neighborhood?: number;
    id_commune: number;
    name: string;
    status: string;
    created_at?: string; // ISO datetime
    updated_at?: string; // ISO datetime
  }