import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, getDoc, doc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { inject } from '@angular/core';

// Define the Task interface
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

@Injectable({
  providedIn: 'root', // Make the service available app-wide
})
export class AddTaskService {
  private firestore = inject(Firestore); // Inject Firestore instance

  constructor() {}

  // Add a new task to Firestore
  async addTask(task: Task): Promise<string | undefined> {
    const tasksCollection = collection(this.firestore, 'ToDoList'); // Reference to the 'ToDoList' collection
    try {
      // Add a new document to the collection
      const docRef = await addDoc(tasksCollection, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        attachments: task.attachments,
        category: task.category,
      });
      console.log("Task added with ID: ", docRef.id);
      return docRef.id; // Return the document ID on success
    } catch (e) {
      console.error("Error adding task: ", e);
      return undefined; // Return undefined if there is an error
    }
  }

  // Fetch all tasks from Firestore
  async getTasks(): Promise<Task[]> {
    const tasksCollection = collection(this.firestore, 'ToDoList');
    const taskSnapshot = await getDocs(tasksCollection);
    const tasksList: Task[] = [];
    taskSnapshot.forEach((doc) => {
      tasksList.push({ id: doc.id, ...doc.data() } as Task); // Add document ID and data
    });
    return tasksList;
  }

  // Fetch a specific task by ID
  async getTaskById(id: string): Promise<Task | null> {
    const taskDoc = doc(this.firestore, 'ToDoList', id); // Use doc() to get a specific document reference
    try {
      const docSnap = await getDoc(taskDoc); // Use getDoc() to retrieve a single document
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Task; // Return task with ID and data
      } else {
        console.log("No such task!");
        return null;
      }
    } catch (e) {
      console.error("Error fetching task: ", e);
      return null;
    }
  }

  // Update an existing task in Firestore
  async updateTask(updatedTask: Task) {
    const taskDoc = doc(this.firestore, 'ToDoList', updatedTask.id);
    try {
      await setDoc(taskDoc, {
        title: updatedTask.title,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate,
        priority: updatedTask.priority,
        status: updatedTask.status,
        
        category: updatedTask.category,
      });
      console.log("Task updated: ", updatedTask.id);
    } catch (e) {
      console.error("Error updating task: ", e);
    }
  }

  // Delete a task by ID from Firestore
  async deleteTask(id: string) {
    const taskDoc = doc(this.firestore, 'ToDoList', id);
    try {
      await deleteDoc(taskDoc);
      console.log("Task deleted with ID: ", id);
    } catch (e) {
      console.error("Error deleting task: ", e);
    }
  }
}