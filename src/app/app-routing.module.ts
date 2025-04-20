import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TodoListPage } from './todo-list/todo-list.page';
import { HomePage } from './home/home.page';
import { ViewTaskPage } from './todo-list/view-task/view-task.page';
import { EditTaskPage } from './todo-list/edit-task/edit-task.page';
import { GardenDetailPage } from './home/garden-details/garden-details.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash-screen',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'todo-list',
    loadChildren: () => import('./todo-list/todo-list.module').then( m => m.TodoListPageModule)
  },
  { 
    path: 'view-task/:id', 
    component: ViewTaskPage 
  },
  { 
    path: 'edit-task/:id',  
    component: EditTaskPage 
  },
  {
    path: 'garden-details/:gardenName',  // Add this route for the Garden Details page
    loadChildren: () => import('./home/garden-details/garden-details.module').then(m => m.GardenDetailPageModule),  // Lazy load GardenDetailPage
  },
  {
    path: 'agribot',
    loadChildren: () => import('./agribot/agribot.module').then( m => m.AgribotPageModule)
  },
  {
    path: 'yield-calculator',
    loadChildren: () => import('./yield-calculator/yield-calculator.module').then( m => m.YieldCalculatorPageModule)
  },
  {
    path: 'splash-screen',
    loadChildren: () => import('./splash-screen/splash-screen.module').then( m => m.SplashScreenPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
