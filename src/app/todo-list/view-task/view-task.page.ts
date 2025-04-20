import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, deleteDoc } from '@angular/fire/firestore'; // ✅ Added deleteDoc
import { inject } from '@angular/core';
import { Location } from '@angular/common';
import { AlertController } from '@ionic/angular'; // ✅ Added AlertController

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
  selector: 'app-view-task',
  standalone: false,
  templateUrl: './view-task.page.html',
  styleUrls: ['./view-task.page.scss'],
})
export class ViewTaskPage implements OnInit {
  taskId: string | null = null;
  task: Task | null = null;

  private firestore = inject(Firestore);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private alertCtrl: AlertController // ✅ Injected properly
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.taskId = params.get('id');
      if (this.taskId) {
        this.loadTask(this.taskId);
      }
    });
  }

  async loadTask(id: string) {
    try {
      const taskDocRef = doc(this.firestore, 'ToDoList', id);
      const taskSnap = await getDoc(taskDocRef);

      if (taskSnap.exists()) {
        const raw = taskSnap.data();

        this.task = {
          id: taskSnap.id,
          title: raw['title'],
          description: raw['description'],
          dueDate: raw['dueDate'] instanceof Date ? raw['dueDate'] : raw['dueDate']?.toDate?.(),
          priority: raw['priority'],
          status: raw['status'],
          attachments: raw['attachments'],
          category: raw['category']
        };

        console.log('✅ Task Loaded:', this.task);
      } else {
        console.error('❌ Task not found');
      }
    } catch (error) {
      console.error('❌ Error fetching task:', error);
    }
  }

  editTask() {
    if (this.task) {
      this.router.navigate(['/edit-task', this.task.id], {
        state: { taskData: this.task }
      });
    }
  }

  async deleteTask() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            if (this.taskId) {
              try {
                const taskRef = doc(this.firestore, 'ToDoList', this.taskId);
                await deleteDoc(taskRef);
                console.log('✅ Task deleted');
                this.router.navigate(['/todo-list']);
              } catch (error) {
                console.error('❌ Error deleting task:', error);
              }
            }
          },
        },
      ],
    });

    await alert.present();
  }

  goBack() {
    this.location.back();
  }
}