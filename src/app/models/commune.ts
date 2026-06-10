export interface Commune {
    id_commune?: number;
    id_city: number;
    name: string;
    status: string;
    created_at?: string; // ISO datetime
    updated_at?: string; // ISO datetime
  }