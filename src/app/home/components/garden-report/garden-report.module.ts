import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GardenReportComponent } from './garden-report.component';

@NgModule({
  declarations: [GardenReportComponent],  // ✅ Declare Component Here
  imports: [CommonModule, IonicModule], 
  exports: [GardenReportComponent]  // ✅ Export it so other modules can use it
})
export class GardenReportModule {}