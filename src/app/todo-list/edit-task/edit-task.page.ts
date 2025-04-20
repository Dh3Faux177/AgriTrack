import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/service/firebase.service';
import { NavController, Platform } from '@ionic/angular';
import { Calendar, CalendarOptions } from '@ionic-native/calendar/ngx';

@Component({
  selector: 'app-edit-task',
  standalone: false,
  templateUrl: './edit-task.page.html',
  styleUrls: ['./edit-task.page.scss'],
})
export class EditTaskPage implements OnInit {
  taskForm: FormGroup;
  taskId: string | null = null;
  selectedFile: File | null = null; // ✅ Declare the selectedFile property

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private firestoreService: FirestoreService,
    private calendar: Calendar,               // ⬅️ Add this
    private platform: Platform   // ✅ Inject Firestore service
  ) {
    this.taskForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      dueTime: ['', Validators.required], // ✅ Add this line
      priority: ['', Validators.required],
      category: [''],
      status: ['Pending', Validators.required]
    });    
  }

  ngOnInit() {
    if (this.router.getCurrentNavigation()?.extras.state) {
      const navigation = this.router.getCurrentNavigation();
      const taskData = navigation?.extras.state?.['taskData'];
  
      if (taskData) {
        this.taskId = taskData.id;
  
        const dateISO = taskData.dueDate instanceof Date
          ? taskData.dueDate.toISOString()
          : taskData.dueDate?.toDate?.()?.toISOString?.() || '';
  
        const dateOnly = dateISO.split('T')[0]; // yyyy-mm-dd
        const timeOnly = dateISO.split('T')[1]?.substring(0, 5); // hh:mm
  
        this.taskForm.patchValue({
          ...taskData,
          dueDate: dateOnly,
          dueTime: timeOnly
        });
      }
    } else {
      this.taskId = this.route.snapshot.paramMap.get('id');
      console.log('Task ID:', this.taskId);
    }
  }

  // ✅ Update Firestore Task on Save
  async saveTask() {
    if (this.taskForm.valid && this.taskId) {
      const { dueDate, dueTime, title, description, priority, category, status } = this.taskForm.value;
      const combinedDateTime = new Date(`${dueDate}T${dueTime}`);

      try {
        // Retrieve the existing task from Firestore to compare the previous due date and time
        const oldTask = await this.firestoreService.getTaskById(this.taskId);
        if (!oldTask) {
          console.error('Old task not found');
          return;
        }

        const oldDueDate = oldTask.dueDate;
        const oldTitle = oldTask.title;

        // Check if the due date, time, or title has changed
        const hasChanged = oldTitle !== title || oldDueDate.getTime() !== combinedDateTime.getTime();

        // Update Firestore with new details
        await this.firestoreService.updateTask(this.taskId, {
          title,
          description,
          priority,
          category,
          status,
          dueDate: new Date(combinedDateTime)  // or ideally, use Firebase Timestamp
        });

        // 📅 Update calendar event only if the task has changed
        if (this.platform.is('cordova') && hasChanged) {
          const startDate = combinedDateTime;
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour event
          
          const options: CalendarOptions = {
            firstReminderMinutes: 60,
            secondReminderMinutes: 30,
            calendarName: 'AgriTrack Reminders',
          };

          // Delete the old calendar event (if necessary)
          try {
            await this.calendar.deleteEvent(oldTitle, 'AgriTrack Task', description, oldDueDate, endDate);
          } catch (err) {
            console.warn('⚠️ Could not delete old event:', err);
          }

          // Then create a new updated event
          await this.calendar.createEventWithOptions(
            title,
            'AgriTrack Task',
            description,
            startDate,
            endDate,
            options
          );

          console.log('✅ Updated calendar event!');
        }

        // Navigate back to the task list
        this.router.navigate(['/todo-list']);
      } catch (error) {
        console.error('❌ Error updating task:', error);
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; // ✅ Assign file to selectedFile
      console.log("Selected file:", file.name);
    }
  }

  cancel() {
    this.navCtrl.back();
  }
}
