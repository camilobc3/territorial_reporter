import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SidePanelMode = 'create' | 'edit';

export interface SidePanelState {
  isOpen: boolean;
  title: string;
  mode: SidePanelMode;
}

@Injectable({
  providedIn: 'root'
})
export class SidePanelUtils {

  private readonly _state = new BehaviorSubject<SidePanelState>({
    isOpen: false,
    title: '',
    mode: 'create',
  });

  readonly state$ = this._state.asObservable();

  get isOpen(): boolean  { return this._state.value.isOpen; }
  get title(): string    { return this._state.value.title;  }
  get mode(): SidePanelMode { return this._state.value.mode; }

  open(title: string, mode: SidePanelMode = 'create'): void {
    this._state.next({ isOpen: true, title, mode });
  }

  close(): void {
    this._state.next({ ...this._state.value, isOpen: false });
  }
}