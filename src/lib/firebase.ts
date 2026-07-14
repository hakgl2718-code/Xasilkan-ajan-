import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCrsJJTGLE9p3rFFuNQNRzjG8wiOdTpLpA",
  authDomain: "reflected-catwalk-7n56p.firebaseapp.com",
  projectId: "reflected-catwalk-7n56p",
  storageBucket: "reflected-catwalk-7n56p.firebasestorage.app",
  messagingSenderId: "81906784984",
  appId: "1:81906784984:web:a1a19dda6fad169631d5ad"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-xasilajan-abcf0d3f-98fc-4152-a8c0-f80bb6011348");

export interface CustomUser {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  photoURL?: string;
}

// Custom SHA-256 password hashing helper
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<CustomUser> => {
  const cleanedEmail = email.trim().toLowerCase();
  if (!cleanedEmail.endsWith('@gmail.com')) {
    throw new Error('Sadece @gmail.com uzantılı e-posta adresleri ile kayıt olabilirsiniz.');
  }

  // En az 6 karakterlik şifre kontrolü
  if (password.length < 6) {
    throw new Error('Şifreniz en az 6 karakter uzunluğunda olmalıdır.');
  }

  // Kullanıcı adı benzersiz olmalı
  const usernameQuery = query(collection(db, 'custom_users'), where('displayName', '==', displayName.trim()));
  const usernameSnap = await getDocs(usernameQuery);
  if (!usernameSnap.empty) {
    throw new Error('Bu kullanıcı adı zaten alınmış. Lütfen başka bir kullanıcı adı seçin.');
  }

  // E-posta benzersiz olmalı
  const emailQuery = query(collection(db, 'custom_users'), where('email', '==', cleanedEmail));
  const emailSnap = await getDocs(emailQuery);
  if (!emailSnap.empty) {
    throw new Error('Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.');
  }

  const passwordHash = await hashPassword(password);
  const uid = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const createdAt = new Date().toISOString();

  const userDocRef = doc(db, 'custom_users', uid);
  await setDoc(userDocRef, {
    uid,
    email: cleanedEmail,
    displayName: displayName.trim(),
    passwordHash,
    createdAt,
    failedAttempts: 0,
    blockedUntil: null
  });

  return {
    uid,
    email: cleanedEmail,
    displayName: displayName.trim(),
    createdAt
  };
};

export const signInWithEmail = async (email: string, password: string): Promise<CustomUser> => {
  const cleanedEmail = email.trim().toLowerCase();

  const emailQuery = query(collection(db, 'custom_users'), where('email', '==', cleanedEmail));
  const emailSnap = await getDocs(emailQuery);

  if (emailSnap.empty) {
    throw new Error('Kullanıcı veya şifre hatalı.');
  }

  const userDoc = emailSnap.docs[0];
  const userData = userDoc.data();
  const userRef = doc(db, 'custom_users', userDoc.id);

  // Bloke/Dondurma Kontrolü
  if (userData.blockedUntil) {
    const blockedUntilDate = new Date(userData.blockedUntil);
    const now = new Date();
    if (blockedUntilDate > now) {
      const minutesLeft = Math.ceil((blockedUntilDate.getTime() - now.getTime()) / 60000);
      throw new Error(`Çok fazla başarısız deneme nedeniyle hesabınız geçici olarak donduruldu. Kalan süre: ${minutesLeft} dakika.`);
    } else {
      // Bloke süresi dolmuş, sıfırla
      await updateDoc(userRef, {
        blockedUntil: null,
        failedAttempts: 0
      });
      userData.failedAttempts = 0;
    }
  }

  const inputHash = await hashPassword(password);
  if (userData.passwordHash === inputHash) {
    // Başarılı giriş
    await updateDoc(userRef, {
      failedAttempts: 0,
      blockedUntil: null,
      lastLogin: new Date().toISOString()
    });

    return {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      createdAt: userData.createdAt
    };
  } else {
    // Hatalı şifre denemesi
    const newFailedAttempts = (userData.failedAttempts || 0) + 1;
    
    if (newFailedAttempts >= 5) {
      // 5 dakika dondur
      const blockedUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      await updateDoc(userRef, {
        failedAttempts: newFailedAttempts,
        blockedUntil
      });
      throw new Error('Hesabınız 5 kez hatalı giriş denemesi nedeniyle 5 dakikalığına dondurulmuştur.');
    } else {
      await updateDoc(userRef, {
        failedAttempts: newFailedAttempts
      });
      const remaining = 5 - newFailedAttempts;
      throw new Error(`E-posta veya şifre hatalı. Kalan deneme hakkı: ${remaining}`);
    }
  }
};

export const logout = async () => {
  // custom session utilizes localStorage, which is cleared in frontend App.tsx
};

