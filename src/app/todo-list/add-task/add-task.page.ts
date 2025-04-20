import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AddTaskService } from './add-task.service';

@Component({
  selector: 'app-add-task',
  standalone: false,
  templateUrl: './add-task.page.html',
  styleUrls: ['./add-task.page.scss'],
})
export class AddTaskPage implements OnInit {

  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private addTaskService: AddTaskService,
    private navCtrl: NavController
  ) {
    // Initialize form
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      dueTime: ['', Validators.required],  // ✅ Add this line
      priority: ['High', Validators.required],
      category: ['Gardening', Validators.required]
      //attachment: ['']
    });    
  }

  ngOnInit() {}

  saveTask() {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value; // Get the form data

      // Prepare data for the task
      const newTask = {
        id: new Date().getTime().toString(), // Generate a unique ID based on the timestamp
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        status: 'pending', // Default status
        attachments: taskData.attachFile || '',
        category: taskData.category,
      };

      // Use AddTaskService to add the task
      this.addTaskService.addTask(newTask);

      // Navigate back to the todo list page
      this.navCtrl.navigateBack('/todo-list');
    } else {
      console.log('Form is invalid');
    }
  }

  cancel() {
    this.navCtrl.back();
  }
}