import {initializeApp} from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {getAuth,GoogleAuthProvider} from 'firebase/auth';
// import { getAnalytics } from "firebase/analytics";
// import { initializeAuth } from 'firebase/auth/cordova';
const firebaseConfig={
    apiKey: "AIzaSyCquAc-pO96GNmlhEv5lWg7VfOjQj17bj8",
    authDomain: "do-did-11941.firebaseapp.com",
    projectId: "do-did-11941",
    storageBucket: "do-did-11941.firebasestorage.app",
    messagingSenderId: "420291473671",
    appId: "1:420291473671:web:bc3c6a92ba3e839b2255a2",
    measurementId: "G-9HG2NEM2CC"
}
const app=initializeApp(firebaseConfig);

export const db=getFirestore(app);
export const auth =getAuth(app);
export const provider=new GoogleAuthProvider();
