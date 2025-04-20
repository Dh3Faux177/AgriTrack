import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // Import ReactiveFormsModule

import { IonicModule } from '@ionic/angular';


import { AddTaskPage } from './add-task.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,  // Add this to enable ReactiveForms
    IonicModule
  ],
  declarations: [AddTaskPage]
})
export class AddTaskPageModule {}