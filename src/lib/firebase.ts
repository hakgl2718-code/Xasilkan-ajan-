import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  updateProfile 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, serverTimestamp, addDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCrsJJTGLE9p3rFFuNQNRzjG8wiOdTpLpA",
  authDomain: "reflected-catwalk-7n56p.firebaseapp.com",
  projectId: "reflected-catwalk-7n56p",
  storageBucket: "reflected-catwalk-7n56p.firebasestorage.app",
  messagingSenderId: "81906784984",
  appId: "1:81906784984:web:a1a19dda6fad169631d5ad"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = getFirestore(app, "ai-studio-xasilajan-abcf0d3f-98fc-4152-a8c0-f80bb6011348");

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  if (!email.toLowerCase().endsWith('@gmail.com')) {
    throw new Error('Sadece @gmail.com uzantılı e-posta adresleri ile kayıt olabilirsiniz.');
  }
  
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;
  
  await updateProfile(user, { displayName });
  await sendEmailVerification(user);
  
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    email: user.email,
    displayName: displayName,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  });
  
  // Sign out immediately so they have to verify their email before logging in, 
  // or they can stay logged in but we check emailVerified in the UI.
  // We'll let the UI handle if they are verified.
  return user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;
  
  if (!user.emailVerified) {
    throw new Error('Lütfen giriş yapmadan önce e-posta adresinizi doğrulayın.');
  }

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    lastLogin: serverTimestamp()
  });
  
  return user;
};

export const logout = () => signOut(auth);

