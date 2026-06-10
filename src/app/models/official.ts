export interface Official {
    id_official?: number;
    id_entity: number;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    status: string;
    last_latitude?: number | null;
    last_longitude?: number | null;
    last_gps_update?: string | null; // ISO datetime
    gps_active: boolean;
  }