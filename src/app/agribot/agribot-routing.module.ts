import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgriBotPage } from './agribot.page';

const routes: Routes = [
  {
    path: '',
    component: AgriBotPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgribotPageRoutingModule {}
