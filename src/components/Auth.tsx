import React, {  useState } from 'react';import google from '../assets/images/googleLogo.png'
// import { library } from '@fortawesome/fontawesome-svg-core';

import {

    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { auth, provider } from '../firebase';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { Header } from './Header';
interface Props { user: any; setUser: (user: any) => void; }

// ===========================================
export const Auth: React.FC<Props> = ({ user, setUser }) => {
  // ... existing code ...
const[email,setEmail]=useState("")
const[password,setPassword]=useState("")
const [isLogin,setLogin]=useState(true);

const handleGoogleSignIn=async()=>{
    try{
        const result=await signInWithPopup(auth,provider);
        setUser(result.user);

    }catch(err){
        console.error(err)
    }
}



const handleAuth=async()=>{
    try{
        if(isLogin){
const result=await signInWithEmailAndPassword(auth,email,password)
setUser(result.user)
        }else{
            const result=await createUserWithEmailAndPassword(auth,email,password)
            setUser(result.user)

        }
}catch(err){alert((err as Error).message)

}

}


const handleLogOut=()=>{
    signOut(auth);
    setUser(null);
}
  if (user) {
    return (
      <div>
        <Header user={user} handleLogOut={handleLogOut} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          {isLogin ? "Login" : "Sign Up"}
        </h3>
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <button 
          onClick={handleAuth}
          className="w-full py-3 px-4 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
        
        <div className="relative flex items-center justify-center mb-4">
          <div className="absolute inset-0 border-t border-gray-300 dark:border-gray-600"></div>
          <span className="relative px-2 bg-white dark:bg-gray-800 text-gray-500 text-sm">OR</span>
        </div>
        
        <button 
          onClick={handleGoogleSignIn} 
          className="w-full flex items-center justify-center gap-2 py-2 px-4 mb-4 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition duration-200"
        >
          <img src={google} alt="Google logo" className="h-5 w-5" />
          Sign in with Google
        </button>
        
        <button 
          onClick={() => setLogin(!isLogin)}
          className="w-full text-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          {isLogin ? 'Need to sign up?' : 'Already have an account?'}
        </button>
      </div>
    </div>
  )
}