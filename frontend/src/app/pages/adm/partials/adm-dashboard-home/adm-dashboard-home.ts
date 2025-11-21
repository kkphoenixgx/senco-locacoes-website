import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, IDashboardStats } from '../../../../services/dashboard.service';
import { SectionHeader } from '../../../../components/section-header/section-header';

@Component({
  selector: 'app-adm-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    SectionHeader
  ],
  templateUrl: './adm-dashboard-home.html',
  styleUrls: ['./adm-dashboard-home.scss']
})
export class AdmDashboardHomeComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  public stats = signal<IDashboardStats | null>(null);
  public isLoading = signal(true);

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe(data => {
      this.stats.set(data);
      this.isLoading.set(false);
    });
  }
}