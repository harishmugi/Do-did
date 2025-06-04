export interface Todo {
  id: string;
  text: string;
  uid: string;
  completed: boolean;
  dueDate: string;  // Optional: Store the due date for the task (in ISO format)
  reminderHours?: number;  // Optional: Number of hours before the due date for the reminder
}
