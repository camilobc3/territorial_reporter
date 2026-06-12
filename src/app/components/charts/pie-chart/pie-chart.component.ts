import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexLegend,
  ApexDataLabels,
  ApexTooltip,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnChanges {

  @Input() labels: string[] = [];
  @Input() series: number[] = [];

  public chartOptions: Partial<PieChartOptions> = {
    series: [],
    chart: {
      width: 380,
      type: 'pie',
    },
    labels: [],
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      enabled: true,
    },
    tooltip: {
      enabled: true,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 280,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  ngOnChanges(): void {
    console.log('Pie labels recibidos:', this.labels);
    console.log('Pie series recibidas:', this.series);

    const cleanSeries = this.series
      .map(value => Number(value))
      .filter(value => !isNaN(value));

    this.chartOptions = {
      ...this.chartOptions,
      series: cleanSeries,
      chart: {
        width: 380,
        type: 'pie',
      },
      labels: this.labels,
    };

    console.log('Pie chartOptions:', this.chartOptions);
  }
}