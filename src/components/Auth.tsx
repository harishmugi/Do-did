import React, { useState } from 'react';
import google from '../assets/images/googleLogo.png';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, provider } from '../firebase';
import { Header } from './Header';
import '../index.css'; // Make sure this includes the styles shown below

interface Props {
  user: any;
  setUser: (user: any) => void;
}

export const Auth: React.FC<Props> = ({ user, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setLogin] = useState(true);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async () => {
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        setUser(result.user);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        setUser(result.user);
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleLogOut = () => {
    signOut(auth);
    setUser(null);
  };

  if (user) {
    return (
      <div>
        <Header user={user} handleLogOut={handleLogOut} />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h3 className="auth-title">{isLogin ? 'Login' : 'Sign Up'}</h3>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="auth-input"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="auth-input"
        />

        <button onClick={handleAuth} className="auth-button primary">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>

        <div className="auth-divider">OR</div>

        <button onClick={handleGoogleSignIn} className="auth-button google">
          <img src={google} alt="Google logo" className="google-icon" />
          Sign in with Google
        </button>

        <button onClick={() => setLogin(!isLogin)} className="auth-toggle">
          {isLogin ? 'Need to sign up?' : 'Already have an account?'}
        </button>
      </div>
    </div>
  );
};
