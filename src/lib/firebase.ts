import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCrsJJTGLE9p3rFFuNQNRzjG8wiOdTpLpA",
  authDomain: "reflected-catwalk-7n56p.firebaseapp.com",
  projectId: "reflected-catwalk-7n56p",
  storageBucket: "reflected-catwalk-7n56p.firebasestorage.app",
  messagingSenderId: "81906784984",
  appId: "1:81906784984:web:a1a19dda6fad169631d5ad"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, "ai-studio-xasilajan-abcf0d3f-98fc-4152-a8c0-f80bb6011348");

export interface CustomUser {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  photoURL?: string;
}

// Pure JS SHA-256 fallback for environments without crypto.subtle (e.g. older Android WebViews, non-secure origins)
function sha256Fallback(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i, j;
  let result = '';

  const words: number[] = [];
  const asciiLength = ascii.length * 8;
  
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let asciiBitLength = asciiLength;
  const wordsLength = ((asciiBitLength + 64 >>> 9) << 4) + 16;
  for (i = 0; i < wordsLength; i++) words[i] = 0;
  for (i = 0; i < ascii.length; i++) {
    words[i >>> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }
  words[ascii.length >>> 2] |= 0x80 << (24 - (ascii.length % 4) * 8);
  words[wordsLength - 1] = asciiBitLength;

  for (i = 0; i < wordsLength; i += 16) {
    const w = [];
    for (j = 0; j < 16; j++) w[j] = words[i + j];
    for (j = 16; j < 64; j++) {
      const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;

    for (j = 0; j < 64; j++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    const word = hash[i] < 0 ? maxWord + hash[i] : hash[i];
    result += word.toString(16).padStart(8, '0');
  }

  return result;
}

// Custom SHA-256 password hashing helper with secure crypto fallback
async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Crypto.subtle failed, using pure JS fallback:', e);
    }
  }
  return sha256Fallback(password);
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
      createdAt: userData.createdAt,
      photoURL: userData.photoURL || ''
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

export const updateUserProfile = async (uid: string, newDisplayName: string, newPhotoURL: string): Promise<CustomUser> => {
  const userRef = doc(db, 'custom_users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error('Kullanıcı bulunamadı.');
  }
  
  const userData = userSnap.data();
  const trimmedName = newDisplayName.trim();
  
  if (!trimmedName) {
    throw new Error('Kullanıcı adı boş olamaz.');
  }

  // If display name is changed, check for uniqueness among OTHER users
  if (userData.displayName !== trimmedName) {
    const usernameQuery = query(collection(db, 'custom_users'), where('displayName', '==', trimmedName));
    const usernameSnap = await getDocs(usernameQuery);
    const otherUsers = usernameSnap.docs.filter(doc => doc.id !== uid);
    if (otherUsers.length > 0) {
      throw new Error('Bu kullanıcı adı zaten başka bir üye tarafından kullanılıyor. Lütfen farklı bir ad seçin.');
    }
  }

  await updateDoc(userRef, {
    displayName: trimmedName,
    photoURL: newPhotoURL.trim()
  });

  return {
    uid,
    email: userData.email,
    displayName: trimmedName,
    createdAt: userData.createdAt,
    photoURL: newPhotoURL.trim()
  };
};

