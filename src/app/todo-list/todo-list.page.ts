import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Firestore, collection, query, onSnapshot, doc, deleteDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { AddTaskService } from './add-task/add-task.service';  // Assuming you have the service
import { FirestoreService } from '../service/firebase.service';  // Assuming you have the service

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  status: string;
  attachments: string;
  category: string;
}

@Component({
  selector: 'app-todo-list',
  standalone: false,
  templateUrl: './todo-list.page.html',
  styleUrls: ['./todo-list.page.scss'],
})
export class TodoListPage implements OnInit {
  tasks: {
    pending: Task[];  // Array of Task objects for pending tasks
    completed: Task[];  // Array of Task objects for completed tasks
  } = {
    pending: [],
    completed: [],
  };

  private firestore = inject(Firestore);

  constructor(
    private router: Router,
    private alertController: AlertController,
    private taskService: AddTaskService,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  // Method to load tasks from Firestore
  loadTasks() {
    const tasksCollection = collection(this.firestore, 'ToDoList');
    const q = query(tasksCollection);
  
    onSnapshot(q, (querySnapshot) => {
      this.tasks.pending = [];
      this.tasks.completed = [];
  
      querySnapshot.forEach((docSnap) => {
        const raw = docSnap.data();
  
        const task: Task = {
          id: docSnap.id,
          title: raw['title'],
          description: raw['description'],
          dueDate: raw['dueDate']?.toDate?.() || new Date(),
          priority: raw['priority'],
          status: raw['status'],
          attachments: raw['attachments'],
          category: raw['category']
        };
  
        const taskStatus = (task.status || '').toLowerCase();
  
        console.log('📦 Task:', task);
        console.log('📌 Status:', taskStatus);
  
        if (taskStatus === 'pending') {
          this.tasks.pending.push(task);
        } else if (taskStatus === 'completed') {
          this.tasks.completed.push(task);
        } else {
          console.warn('⚠️ Task with unknown or missing status:', task);
        }
      });
  
      console.log("✅ Pending Tasks:", this.tasks.pending);
      console.log("✅ Completed Tasks:", this.tasks.completed);
    });
  }  

  // Navigate to the add task page
  addTask() {
    this.router.navigate(['/add-task']);
  }

  // View task details
  viewTask(task: Task) {
    this.router.navigate(['/view-task', task.id]);  // Correct way to pass ID
  }

  // Edit task details
  editTask(task: any) {
    this.router.navigate(['/edit-task', task.id], {
        state: { taskData: task } // Pass the task object through router state
    });
}

  // Delete task with confirmation prompt
  async deleteTask(task: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Delete',
          handler: async () => {
            // Call Firestore service to delete task from Firestore
            await this.firestoreService.deleteTask(task.id);
            this.loadTasks(); // Reload tasks after deletion
          },
        },
      ],
    });

    await alert.present();
  }

  // Remove the task from the local tasks array
  removeTask(task: any) {
    this.tasks.pending = this.tasks.pending.filter((t) => t.id !== task.id);
    this.tasks.completed = this.tasks.completed.filter((t) => t.id !== task.id);
  }
}