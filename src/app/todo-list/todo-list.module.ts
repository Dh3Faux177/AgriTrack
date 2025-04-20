import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TodoListPageRoutingModule } from './todo-list-routing.module';

import { TodoListPage } from './todo-list.page';
import { AddTaskPageModule } from './add-task/add-task.module';  // Import AddTaskPageModule
import { ViewTaskPageModule } from './view-task/view-task.module';  // Import ViewTaskPageModule
import { EditTaskPageModule } from './edit-task/edit-task.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TodoListPageRoutingModule,
    AddTaskPageModule,
    ViewTaskPageModule,
    EditTaskPageModule
  ],
  declarations: [TodoListPage]
})
export class TodoListPageModule {}
