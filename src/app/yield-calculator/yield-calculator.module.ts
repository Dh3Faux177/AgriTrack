import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { YieldCalculatorPageRoutingModule } from './yield-calculator-routing.module';

import { YieldCalculatorPage } from './yield-calculator.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    YieldCalculatorPageRoutingModule
  ],
  declarations: [YieldCalculatorPage]
})
export class YieldCalculatorPageModule {}
