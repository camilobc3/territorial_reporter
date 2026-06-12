import { ReportSeries } from './report-series';

export type ReportChartType = 'bar' | 'line' | 'pie';

export interface ReportResponse {
  labels: string[];
  series: ReportSeries[] | number[];
  type: ReportChartType;
}