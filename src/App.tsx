import { useEffect, useState } from 'react'
import './App.css'
import { Auth } from './components/Auth'
import { Task } from './components/Tasks';

import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';


// function send(){
// Notification.requestPermission().then((permission)=>{console.log(permission)
//   new Notification("Hello!", {
//     body: "This is a notification from your React app.",
//     icon: "/logo192.png", // optional
// })});}

{/* <button onClick={()=>send()}> */}

// Notify!
// </button>



export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
    });
    return () => unsubscribe();
  }, []);


  return (
    <div className='page'>
      <Auth user={user} setUser={setUser} />
      {user ? <Task user={user} /> : <p>Please log in.</p>}
    </div>
  );
};





export default App
