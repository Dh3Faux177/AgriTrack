import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EditTaskPage } from './edit-task.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    IonicModule
  ],
  declarations: [EditTaskPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class EditTaskPageModule { }