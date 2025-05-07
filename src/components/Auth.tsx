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

export const Auth :React.FC<Props>=({user,setUser})=>{
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
if(user){
    return(<div>
        <Header user={user} handleLogOut={handleLogOut} />
</div>)
}
return(<div className='form'>
    <h3>{isLogin?"Login":"Sign Up"}</h3>
    <input
    
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Email"

    />

<br />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <br />
      <button className='login_btn' onClick={handleAuth}>{isLogin ? 'Login' : 'Sign Up'}</button>
      <br />
      <button className='google_btn'onClick={handleGoogleSignIn}> <img src={google} height={'16px'} />Sign in with google   </button>
      <br />
      <button className='already_have_an _account' onClick={() => setLogin(!isLogin)}>
        {isLogin ? 'Need to sign up?' : 'Already have an account?'}
      </button>
   

</div>)


}