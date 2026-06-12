import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BarChartComponent } from 'src/app/components/charts/bar-chart/bar-chart.component';
import { LineChartComponent } from 'src/app/components/charts/line-chart/line-chart.component';
import { PieChartComponent } from 'src/app/components/charts/pie-chart/pie-chart.component';
import { ReportSeries } from 'src/app/models/reports/report-series';

import {
  ReportChatComponent,
  ChatMessage
} from 'src/app/components/report-chat/report-chat.component';

import { ReportService } from 'src/app/services/report.service';
import { ReportResponse } from 'src/app/models/reports/report-response';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReportChatComponent,
    BarChartComponent,
    LineChartComponent,
    PieChartComponent
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  messages: ChatMessage[] = [];

  reportData: ReportResponse | null = null;

  loading: boolean = false;
  error: string = '';

  constructor(private reportService: ReportService) {}

  onQuerySubmitted(query: string): void {
    console.log('Consulta recibida desde el chat:', query);

    this.messages.push({
      role: 'user',
      text: query
    });

    this.loading = true;
    this.error = '';
    this.reportData = null;

    this.reportService.generateReport(query).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);

        this.reportData = response;

        this.messages.push({
          role: 'bot',
          text: 'He generado el reporte solicitado.'
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error generando reporte:', error);

        this.error = 'Ocurrió un error al generar el reporte.';

        this.messages.push({
          role: 'bot',
          text: 'No pude generar el reporte. Intenta nuevamente.'
        });

        this.loading = false;
      }
    });
  }

  get axisSeries(): ReportSeries[] {
    if (!this.reportData) {
      return [];
    }

    if (this.isNumberArray(this.reportData.series)) {
      return [];
    }

    return this.reportData.series;
  }

  get pieSeries(): number[] {
    if (!this.reportData) {
      return [];
    }

    if (this.isNumberArray(this.reportData.series)) {
      return this.reportData.series;
    }

    return this.reportData.series[0]?.data ?? [];
  }

  private isNumberArray(series: ReportSeries[] | number[]): series is number[] {
    return Array.isArray(series) &&
      (series.length === 0 || typeof series[0] === 'number');
  }
}