import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, query, where, orderBy, updateDoc
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Todo } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencil, faTrash, faCheck,
  faPlus, faTimes, faBellSlash
} from '@fortawesome/free-solid-svg-icons';
import '../index.css';

interface Props {
  user: User;
}

export const Task: React.FC<Props> = ({ user }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [reminderHours, setReminderHours] = useState<number>(1);
  const [permissionGranted, setPermissionGranted] = useState(Notification.permission === 'granted');
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [errors, setErrors] = useState<{ text?: string, dueDate?: string, reminder?: string }>({});

  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermissionGranted(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          setPermissionGranted(perm === 'granted');
        });
      }
    }

    const q = query(
      collection(db, 'todos'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userTodos: Todo[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Todo[];

      userTodos.sort((a, b) => Number(a.completed) - Number(b.completed));
      setTodos(userTodos);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const validateTask = (text: string, due: string, reminder: number): boolean => {
    const newErrors: typeof errors = {};

    if (!text.trim()) newErrors.text = "Task cannot be empty.";
    if (due && new Date(due) <= new Date()) newErrors.dueDate = "Due date must be in the future.";
    if (reminder < 1 || reminder > 24) newErrors.reminder = "Reminder must be between 1 and 24 hours.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const setReminder = (title: string, dueDate: string, hoursBefore: number) => {
    const userPref = localStorage.getItem("notificationsEnabled");
    const notificationsEnabled = userPref === "true";

    if (!notificationsEnabled || !permissionGranted) return;

    const due = new Date(dueDate);
    const remindAt = new Date(due.getTime() - hoursBefore * 60 * 60 * 1000);
    const now = new Date();
    const delay = remindAt.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification(`Reminder: "${title}" is due soon!`, {
            body: `Due at: ${formatDate(dueDate)}`
          });
        }
      }, delay);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTask(input, dueDate, reminderHours)) return;

    const newTodo = {
      text: input.trim(),
      uid: user.uid,
      completed: false,
      createdAt: new Date(),
      dueDate,
      reminderHours,
    };

    await addDoc(collection(db, 'todos'), newTodo);

    if (dueDate && reminderHours > 0) {
      setReminder(input, dueDate, reminderHours);
    }

    setInput('');
    setDueDate('');
    setReminderHours(1);
    setErrors({});
    setIsFormExpanded(false);
  };

  const deleteTodo = async (id: string) => {
    await deleteDoc(doc(db, 'todos', id));
  };

  const toggleComplete = async (todo: Todo) => {
    await updateDoc(doc(db, 'todos', todo.id), {
      completed: !todo.completed,
    });
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
    setDueDate(todo.dueDate || '');
    setReminderHours(todo.reminderHours || 1);
    setErrors({});
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo || !validateTask(editText, dueDate, reminderHours)) return;

    await updateDoc(doc(db, 'todos', editingTodo.id), {
      text: editText.trim(),
      dueDate,
      reminderHours,
    });

    if (dueDate && reminderHours > 0) {
      setReminder(editText, dueDate, reminderHours);
    }

    setEditingTodo(null);
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setErrors({});
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isDueSoon = (dateStr: string) => {
    if (!dateStr) return false;
    const due = new Date(dateStr);
    return due.getTime() - Date.now() < 86400000 && due > new Date();
  };

  const isOverdue = (dateStr: string, completed: boolean) => {
    if (!dateStr || completed) return false;
    return new Date() > new Date(dateStr);
  };

  return (
    <div className="task-container">
      <div className="task-header">
        <h2>Your Tasks</h2>
        {!permissionGranted && (
          <p className="notification-warning">
            <FontAwesomeIcon icon={faBellSlash} /> Notifications are disabled.
          </p>
        )}
        <div className="filter-buttons">
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f as any)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isFormExpanded ? (
          <motion.form
            onSubmit={addTodo}
            className="task-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="form-group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What needs to be done?"
                required
              />
              {errors.text && <small className="error">{errors.text}</small>}
            </div>
            <div className="form-group">
              <label>Due Date & Time</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              {errors.dueDate && <small className="error">{errors.dueDate}</small>}
            </div>
            <div className="form-group">
              <label>Reminder (hours before due)</label>
              <input
                type="number"
                value={reminderHours}
                onChange={(e) => setReminderHours(Number(e.target.value))}
                min="1"
                max="24"
              />
              {errors.reminder && <small className="error">{errors.reminder}</small>}
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn">
                <FontAwesomeIcon icon={faPlus} /> Add Task
              </button>
              <button type="button" className="secondary-btn" onClick={() => setIsFormExpanded(false)}>
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            className="add-task-btn"
            onClick={() => setIsFormExpanded(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faPlus} /> Add New Task
          </motion.button>
        )}
      </AnimatePresence>

      <ul className="task-list">
        <AnimatePresence>
          {filteredTodos.map(todo => (
            <motion.li
              key={todo.id}
              className={`task-item ${todo.completed ? 'completed' : ''} ${isDueSoon(todo.dueDate) ? 'due-soon' : ''} ${isOverdue(todo.dueDate, todo.completed) ? 'overdue' : ''}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <div className="task-content">
                <div className="task-checkbox">
                  <input
                    type="checkbox"
                    id={`task-${todo.id}`}
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo)}
                  />
                  <label htmlFor={`task-${todo.id}`}>
                    {todo.completed && <FontAwesomeIcon icon={faCheck} />}
                  </label>
                </div>
                <div className="task-text">
                  <span>{todo.text}</span>
                  {todo.dueDate && (
                    <div className="task-due-date">
                      <span className="due-icon">⏰</span>
                      <span className={isOverdue(todo.dueDate, todo.completed) ? 'overdue-text' : ''}>
                        {formatDate(todo.dueDate)}
                      </span>
                      {isOverdue(todo.dueDate, todo.completed) && <span className="overdue-badge">OVERDUE</span>}
                      {isDueSoon(todo.dueDate) && !todo.completed && <span className="due-soon-badge">DUE SOON</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="task-actions">
                <button onClick={() => startEditing(todo)}><FontAwesomeIcon icon={faPencil} /></button>
                <button onClick={() => deleteTodo(todo.id)}><FontAwesomeIcon icon={faTrash} /></button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <AnimatePresence>
        {editingTodo && (
          <motion.div className="edit-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form onSubmit={saveEdit} className="edit-form" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <h3>Edit Task</h3>
              <div className="form-group">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  required
                />
                {errors.text && <small className="error">{errors.text}</small>}
              </div>
              <div className="form-group">
                <label>Due Date & Time</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                {errors.dueDate && <small className="error">{errors.dueDate}</small>}
              </div>
              <div className="form-group">
                <label>Reminder (hours before due)</label>
                <input
                  type="number"
                  value={reminderHours}
                  onChange={(e) => setReminderHours(Number(e.target.value))}
                  min="1"
                  max="24"
                />
                {errors.reminder && <small className="error">{errors.reminder}</small>}
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-btn">Save Changes</button>
                <button type="button" className="secondary-btn" onClick={cancelEdit}>Cancel</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
