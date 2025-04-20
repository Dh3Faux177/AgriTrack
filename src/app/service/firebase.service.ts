import { Injectable } from '@angular/core';
import { Firestore, collection, query, getDocs, doc, deleteDoc, getDoc, updateDoc, setDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  status: string;
  //attachments: string;
  category: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore = inject(Firestore);

  // ✅ Fetch all tasks from Firestore
  async getTasks() {
    const tasksCollection = collection(this.firestore, 'ToDoList'); // Corrected collection name
    const q = query(tasksCollection);
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        title: data['title'] || '',
        description: data['description'] || '',
        dueDate: data['dueDate']?.toDate?.() || new Date(),
        priority: data['priority'] || '',
        status: data['status'] || '',
        //attachments: data['attachments'] || '',
        category: data['category'] || '',
      });
    });

    return tasks;
  }

  // ✅ Delete a task by ID
  async deleteTask(taskId: string) {
    const taskDocRef = doc(this.firestore, 'ToDoList', taskId); // Reference to task
    try {
      await deleteDoc(taskDocRef);
      console.log('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task: ', error);
    }
  }

  // ✅ Fetch a single task by ID
  async getTaskById(id: string): Promise<Task | null> {
    const taskDocRef = doc(this.firestore, 'ToDoList', id);
    try {
      const taskSnapshot = await getDoc(taskDocRef);

      if (taskSnapshot.exists()) {
        const data = taskSnapshot.data();
        return {
          id: taskSnapshot.id,
          title: data['title'] || '',
          description: data['description'] || '',
          dueDate: data['dueDate'] ? new Date(data['dueDate']) : new Date(),
          priority: data['priority'] || '',
          status: data['status'] || '',
          //attachments: data['attachments'] || '',
          category: data['category'] || '',
        };
      } else {
        console.warn(`No task found with ID: ${id}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      return null;
    }
  }

  // ✅ Update an existing task
  async updateTask(id: string, updatedData: Partial<Task>) {
    const taskDocRef = doc(this.firestore, 'ToDoList', id); // Reference to task

    try {
      await updateDoc(taskDocRef, updatedData);
      console.log(`Task ${id} updated successfully!`);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }
}