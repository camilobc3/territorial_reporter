export interface Vote {
    id_vote?: number;
    id_citizen: number;
    id_annotation: number;
    stars: number; // 1 a 5
    comment?: string | null;
    vote_date?: string; // ISO datetime
  }