import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';
import { ReportResponse } from '../models/reports/report-response';
import { ReportRequest } from '../models/reports/report-request';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  generateReport(query: string): Observable<ReportResponse> {
    const body: ReportRequest = { query };
    return this.http.post<ReportResponse>(this.apiUrl, body);
  }
}
