// Firebase initialization (modular SDK)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCqVUg5M0fd2mJRCXNjDjjPFFHqLBDdUqg",
  authDomain: "angelito-859c5.firebaseapp.com",
  projectId: "angelito-859c5",
  storageBucket: "angelito-859c5.firebasestorage.app",
  messagingSenderId: "973897844623",
  appId: "1:973897844623:web:63046cc92dcc755141adfa"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
