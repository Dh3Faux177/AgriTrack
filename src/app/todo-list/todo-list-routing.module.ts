import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TodoListPage } from './todo-list.page';
import { AddTaskPage } from './add-task/add-task.page';
import { ViewTaskPage } from './view-task/view-task.page';
import { EditTaskPage } from './edit-task/edit-task.page';

const routes: Routes = [
  {
    path: '',
    component: TodoListPage
  },
  {
    path: 'add-task',
    component: AddTaskPage  
  },
  { path: 'view-task/:id', 
    component: ViewTaskPage 
  },
  { path: 'edit-task/:id', 
    component: EditTaskPage 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TodoListPageRoutingModule {}