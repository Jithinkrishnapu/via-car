// src/firebase.ts
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCpNo_pyV0h0NzKo4Unw3EeeWZLMv38Tpo",
    authDomain: "via-car-1c79a.firebaseapp.com",
    projectId: "via-car-1c79a",
    storageBucket: "via-car-1c79a.firebasestorage.app",
    messagingSenderId: "64611881269",
    appId: "1:64611881269:web:88a907af414fdcff73bc7c",
    measurementId: "G-Z827C6WKDL"
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  export const db = getFirestore(app);

// Note: IndexedDB persistence is web-only; in RN it might not work.
// enableIndexedDbPersistence(db).catch(err => console.warn('persistence not enabled', err));
