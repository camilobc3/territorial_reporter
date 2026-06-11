export type OptimizedColumnType = 'text' | 'image' | 'badge' | 'date';

export interface BadgeOption {
  value: string;
  label: string;
  class: string;
}

export interface OptimizedColumnDef {
  key: string;
  header: string;
  type?: OptimizedColumnType;
  imageBaseUrl?: string;
  imageFallbackIcon?: string;
  badgeOptions?: BadgeOption[];
  class?: string;
  hideOnMobile?: boolean;
}