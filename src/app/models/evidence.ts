export interface Evidence {
    id_evidence?: number;
    id_annotation: number;
    file_url: string;
    file_type: string;
    file_size?: number | null;
    upload_date?: string; // ISO datetime
  }