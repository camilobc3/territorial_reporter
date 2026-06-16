export interface AnnotationFormPayload {
  description: string;
  latitude: number;
  longitude: number;
  categoryIds: number[];
  entityIds: number[];
  photos: File[];
}
