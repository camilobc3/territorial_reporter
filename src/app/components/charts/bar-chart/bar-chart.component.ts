import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexGrid,
  ApexTooltip
} from 'ng-apexcharts';

import { ReportSeries } from 'src/app/models/reports/report-series';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnChanges {

  @Input() labels: string[] = [];
  @Input() series: ReportSeries[] = [];

  chartSeries: ApexAxisChartSeries = [];

  chart: ApexChart = {
    type: 'bar',
    height: 350,
    toolbar: {
      show: true
    }
  };

  xaxis: ApexXAxis = {
    categories: []
  };

  plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      borderRadius: 4
    }
  };

  dataLabels: ApexDataLabels = {
    enabled: false
  };

  grid: ApexGrid = {
    borderColor: '#e5e7eb'
  };

  tooltip: ApexTooltip = {
    enabled: true
  };

  ngOnChanges(): void {
    console.log('Labels recibidos en BarChart:', this.labels);
    console.log('Series recibidas en BarChart:', this.series);

    this.chartSeries = this.series.map(item => ({
      name: item.name,
      data: item.data
    }));

    this.xaxis = {
      ...this.xaxis,
      categories: this.labels
    };
  }
}