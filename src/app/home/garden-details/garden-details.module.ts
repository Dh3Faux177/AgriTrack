import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GardenDetailPage } from './garden-details.page';
import { GardenDetailPageRoutingModule } from './garden-details-routing.module';  // Import GardenDetailPageRoutingModule
import { NgxGaugeModule } from 'ngx-gauge'; // Import NgxGaugeModule
import { GardenReportModule } from '../components/garden-report/garden-report.module'; // ✅ Import GardenReportComponent 

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NgxGaugeModule,  // Make sure the NgxGaugeModule is imported
    GardenDetailPageRoutingModule,
    GardenReportModule
  ],
  declarations: [GardenDetailPage],  // Add GardenReportComponent to the declarations
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add CUSTOM_ELEMENTS_SCHEMA to handle custom elements
})
export class GardenDetailPageModule {}
