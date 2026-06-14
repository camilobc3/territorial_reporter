// category-icon.util.ts
//
// Mapea el nombre de una categoría a un ícono de Material Icons.
// Si no se encuentra ninguna coincidencia, se usa el ícono genérico 'category'.

const ICON_KEYWORDS: Array<{ keywords: string[]; icon: string }> = [
  { keywords: ['seguridad', 'security'], icon: 'security' },
  { keywords: ['infraestructura', 'infrastructure'], icon: 'construction' },
  { keywords: ['vía', 'via', 'tránsito', 'transito', 'road', 'traffic', 'andén', 'anden'], icon: 'traffic' },
  { keywords: ['servicio', 'service', 'agua', 'water', 'acueducto'], icon: 'plumbing' },
  { keywords: ['ambiente', 'environment', 'ambiental', 'árbol', 'arbol'], icon: 'park' },
  { keywords: ['espacio público', 'espacio publico', 'public space', 'parque', 'plaza'], icon: 'deck' },
  { keywords: ['residuo', 'basura', 'waste', 'garbage', 'escombro'], icon: 'delete' },
  { keywords: ['salud', 'health', 'sanitari'], icon: 'medical_services' },
  { keywords: ['educac', 'education', 'escuela', 'school', 'colegio'], icon: 'school' },
  { keywords: ['movilidad', 'mobility', 'transporte', 'transport', 'bus'], icon: 'directions_bus' },
  { keywords: ['riesgo', 'risk', 'peligro', 'danger'], icon: 'warning' },
  { keywords: ['ruido', 'noise'], icon: 'volume_up' },
  { keywords: ['alumbrado', 'lighting', 'iluminac', 'luminaria'], icon: 'lightbulb' },
  { keywords: ['comercio', 'commerce', 'comercial'], icon: 'storefront' },
  { keywords: ['otro', 'other', 'varios', 'general'], icon: 'more_horiz' },
];

export function getCategoryIcon(name: string | undefined | null): string {
  const value = (name ?? '').toLowerCase();

  for (const entry of ICON_KEYWORDS) {
    if (entry.keywords.some((keyword) => value.includes(keyword))) {
      return entry.icon;
    }
  }

  return 'category';
}