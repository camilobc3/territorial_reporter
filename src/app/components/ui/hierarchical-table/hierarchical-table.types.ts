export interface HierarchicalColumnDef {
    key: string;
    header: string;
    type?: 'text' | 'badge' | 'image';
    hideOnMobile?: boolean;
    badgeOptions?: { value: string; label: string; class: string }[];
    imageBaseUrl?: string;
    imageFallbackIcon?: string;
  }
  
  export interface HierarchicalActionButton {
    id: string;
    icon: string;
    tooltip: string;
    iconClass?: string;
  }
  
  export interface HierarchicalActionEvent<T> {
    actionId: string;
    row: T;
  }