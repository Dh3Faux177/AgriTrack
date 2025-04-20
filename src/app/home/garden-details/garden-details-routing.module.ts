import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GardenDetailPage } from './garden-details.page'; // Import GardenDetailPage
import { GardenReportComponent } from 'src/app/home/components/garden-report/garden-report.component' // ✅ Import GardenReportComponent

const routes: Routes = [
  {
    path: '',
    component: GardenDetailPage, // ✅ Default route for garden details
  },
  {
    path: 'report',  // ✅ Route for GardenReportComponent
    component: GardenReportComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GardenDetailPageRoutingModule {}