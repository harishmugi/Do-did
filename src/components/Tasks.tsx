import React, { useEffect, useState } from 'react';
import{db} from '../firebase'; 
import { collection,addDoc,deleteDoc,doc,onSnapshot,query,where,orderBy,updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Todo } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Props {
    user: User;
  }
  
export const Task:React.FC<Props>=({user})=>{
    const [todos, setTodos] = useState<Todo[]>([]);
    const [input, setInput] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [editText, setEditText] = useState('');
   

  useEffect(() => {
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
      }));


      // Sort: incomplete first
      userTodos.sort((a, b) => Number(a.completed) - Number(b.completed));


      setTodos(userTodos);    });

    

      return () => unsubscribe();
    }, [user.uid]);
  

    const addTodo = async () => {
        if (input.trim()) {
          await addDoc(collection(db, 'todos'), {
            text: input,
            uid: user.uid,
            completed: false,
            createdAt: new Date(),
          });
          setInput('');
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
  };


  const saveEdit = async () => {
    if (!editingTodo) return;
    const todoRef = doc(db, 'todos', editingTodo.id);
    await updateDoc(todoRef, { text: editText });
    setEditingTodo(null);
    setEditText('');
  };


  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });

    


  return (
    <div className='task_page'>
      <h2>Your Todos</h2>


      <div className='filters'>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>


      <input className='input_task'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter task"
      />
      <button  className='task_add_btn'onClick={addTodo}>Add</button>


      <ul className='tasks'>
        {filteredTodos.map((todo) => (
          <li className='task' key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo)}
            />
            {todo.completed ? (
              <s>{todo.text}</s>
            ) : (
              <span>{todo.text}</span>
            )}<div className='task_options'>
            <button onClick={() => startEditing(todo)}><FontAwesomeIcon icon={faPencil} style={{color:"#00b4d8"}}/></button>
            <button onClick={() => deleteTodo(todo.id)}><FontAwesomeIcon icon={faTrash} style={{color:"#00b4d8"}}/></button>
            </div></li>
        ))}
      </ul>


      {editingTodo && (
        <div className='editing'>
          <h4>Editing: <span>{editingTodo.text}</span></h4>
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <button onClick={saveEdit}>Save</button>
          <button onClick={() => setEditingTodo(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};


