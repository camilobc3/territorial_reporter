export interface Category {
    id_category?: number;
    id_parent_category?: number | null;
    name: string;
    description?: string | null;
    image_url?: string | null;
    status: string;
  }