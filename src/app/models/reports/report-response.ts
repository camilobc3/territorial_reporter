import { ReportSeries } from "./report-series";

export interface ReportResponse {
    labels: string[];
    series: ReportSeries[];
    type: 'bar' | 'line' | 'pie' | 'donut';
}
