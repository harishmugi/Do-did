import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase'; 
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Todo } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faCheck, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../index.css'; // Create this CSS file for custom styles

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
  const [permissionGranted, setPermissionGranted] = useState<boolean>(Notification.permission === 'granted');
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermissionGranted(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          setPermissionGranted(permission === 'granted');
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
        text: doc.data().text,
        uid: doc.data().uid,
        completed: doc.data().completed,
        dueDate: doc.data().dueDate,
        reminderHours: doc.data().reminderHours,
        createdAt: doc.data().createdAt?.toDate(),
      }));

      userTodos.sort((a, b) => Number(a.completed) - Number(b.completed));
      setTodos(userTodos);
    });

    return () => unsubscribe();
  }, [user.uid, permissionGranted]);

  const setReminder = (dueDate: string, reminderHours: number) => {
    const userPref = localStorage.getItem("notificationsEnabled");
    const notificationsEnabled = userPref === "true";
  
    if (!notificationsEnabled || !permissionGranted) return;
  
    const dueDateObj = new Date(dueDate);
    const reminderTime = new Date(dueDateObj.getTime() - reminderHours * 60 * 60 * 1000);
    const currentTime = new Date();
    const timeUntilReminder = reminderTime.getTime() - currentTime.getTime();
  
    if (timeUntilReminder > 0) {
      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Reminder: "${input}" is due in ${reminderHours} hour(s)!`, {
            body: `Due: ${formatDate(dueDate)}`
          });
        }
      }, timeUntilReminder);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newTodo = {
        text: input,
        uid: user.uid,
        completed: false,
        createdAt: new Date(),
        dueDate,
        reminderHours,
      };

      await addDoc(collection(db, 'todos'), newTodo);

      if (dueDate && reminderHours > 0) {
        setReminder(dueDate, reminderHours);
      }

      setInput('');
      setDueDate('');
      setReminderHours(1);
      setIsFormExpanded(false);
    }
  };

  const deleteTodo = async (id: string) => {
    await deleteDoc(doc(db, 'todos', id));
  };

  const toggleComplete = async (todo: Todo) => {
    const todoRef = doc(db, 'todos', todo.id);
    await updateDoc(todoRef, {
      completed: !todo.completed,
    });
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
    setDueDate(todo.dueDate || "");
    setReminderHours(todo.reminderHours || 1);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;
    const todoRef = doc(db, 'todos', editingTodo.id);
    await updateDoc(todoRef, { 
      text: editText, 
      dueDate, 
      reminderHours 
    });

    if (dueDate && reminderHours > 0) {
      setReminder(dueDate, reminderHours);
    }

    setEditingTodo(null);
  };

  const cancelEdit = () => {
    setEditingTodo(null);
  };

  const filteredTodos = todos.filter((todo) => {
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

  const isDueSoon = (dueDateStr: string) => {
    if (!dueDateStr) return false;
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000; // Due within 24 hours
  };

  const isOverdue = (dueDateStr: string, completed: boolean) => {
    if (!dueDateStr || completed) return false;
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    return now > dueDate;
  };

  return (
    <div className="task-container">
      <div className="task-header">
        <h2>Your Tasks</h2>
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFormExpanded ? (
          <motion.form
            className="task-form"
            onSubmit={addTodo}
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
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label>Due Date & Time</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
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
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                <FontAwesomeIcon icon={faPlus} /> Add Task
              </button>
              <button 
                type="button" 
                className="secondary-btn"
                onClick={() => setIsFormExpanded(false)}
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            className="add-task-btn"
            onClick={() => setIsFormExpanded(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FontAwesomeIcon icon={faPlus} /> Add New Task
          </motion.button>
        )}
      </AnimatePresence>

      <ul className="task-list">
        <AnimatePresence>
          {filteredTodos.map((todo) => (
            <motion.li
              key={todo.id}
              className={`task-item ${todo.completed ? 'completed' : ''} ${
                isDueSoon(todo.dueDate) ? 'due-soon' : ''
              } ${isOverdue(todo.dueDate, todo.completed) ? 'overdue' : ''}`}
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
                      {isOverdue(todo.dueDate, todo.completed) && (
                        <span className="overdue-badge">OVERDUE</span>
                      )}
                      {isDueSoon(todo.dueDate) && !todo.completed && (
                        <span className="due-soon-badge">DUE SOON</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="task-actions">
                <button 
                  onClick={() => startEditing(todo)}
                  aria-label="Edit task"
                >
                  <FontAwesomeIcon icon={faPencil} />
                </button>
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="Delete task"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <AnimatePresence>
        {editingTodo && (
          <motion.div 
            className="edit-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form 
              className="edit-form"
              onSubmit={saveEdit}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <h3>Edit Task</h3>
              <div className="form-group">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Due Date & Time</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
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
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="secondary-btn"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};