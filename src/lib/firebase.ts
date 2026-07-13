import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
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

// Use a specific database id if needed: getFirestore(app, "ai-studio-xasilajan-abcf0d3f-98fc-4152-a8c0-f80bb6011348")
// Oh wait, the config in firebase-applet-config.json specifies:
// "firestoreDatabaseId": "ai-studio-xasilajan-abcf0d3f-98fc-4152-a8c0-f80bb6011348"
export const db = getFirestore(app, "ai-studio-xasilajan-abcf0d3f-98fc-4152-a8c0-f80bb6011348");

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Optionally create user doc in firestore
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    }
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = () => signOut(auth);
