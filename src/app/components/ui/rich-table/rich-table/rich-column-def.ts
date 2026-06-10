// src/app/models/component-rich-table/rich-column-def.ts

export type RichColumnType = 'text' | 'image' | 'badge' | 'date';

export interface BadgeOption {
  value: string;
  label: string;
  class: string;
}

export interface RichColumnDef {
  key: string;
  header: string;
  type?: RichColumnType;
  imageBaseUrl?: string;
  imageFallbackIcon?: string;
  badgeOptions?: BadgeOption[];
  class?: string;
  hideOnMobile?: boolean;
}