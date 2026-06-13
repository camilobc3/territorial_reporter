import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeoJsonFeature, GeoJsonPolygon } from 'src/app/types/map.types';

export type DrawMode = 'none' | 'drawing' | 'editing';

@Injectable({ providedIn: 'root' })
export class PolygonStateService {

  private _hasChanges   = new BehaviorSubject<boolean>(false);
  private _coordinates  = new BehaviorSubject<[number, number][]>([]);
  private _currentGeoJson = new BehaviorSubject<GeoJsonFeature<GeoJsonPolygon> | null>(null);
  private _drawMode     = new BehaviorSubject<DrawMode>('none');

  readonly hasChanges$   = this._hasChanges.asObservable();
  readonly coordinates$  = this._coordinates.asObservable();
  readonly drawMode$     = this._drawMode.asObservable();

  get hasChanges():    boolean                              { return this._hasChanges.value;    }
  get coordinates():   [number, number][]                   { return this._coordinates.value;   }
  get currentGeoJson(): GeoJsonFeature<GeoJsonPolygon> | null { return this._currentGeoJson.value; }
  get drawMode():      DrawMode                             { return this._drawMode.value;      }

  setPolygon(geojson: GeoJsonFeature<GeoJsonPolygon>, coords: [number, number][]): void {
    this._currentGeoJson.next(geojson);
    this._coordinates.next(coords);
    this._hasChanges.next(true);
  }

  setDrawMode(mode: DrawMode): void {
    this._drawMode.next(mode);
  }

  markChanged(): void {
    this._hasChanges.next(true);
  }

  reset(): void {
    this._currentGeoJson.next(null);
    this._coordinates.next([]);
    this._hasChanges.next(false);
    this._drawMode.next('none');
  }
}