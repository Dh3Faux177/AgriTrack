import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgribotPageRoutingModule } from './agribot-routing.module';

import { AgriBotPage } from './agribot.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgribotPageRoutingModule
  ],
  declarations: [AgriBotPage]
})
export class AgribotPageModule {}
