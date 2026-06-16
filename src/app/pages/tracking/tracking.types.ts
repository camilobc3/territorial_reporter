export interface OfficialTrackingUpdate {
  id_official: number;
  latitude: number;
  longitude: number;
  last_gps_update: string;
}

export interface OfficialTrackingPayload {
  officials: OfficialTrackingUpdate[];
}
