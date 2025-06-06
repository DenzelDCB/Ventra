import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBz2gEh1kVx0GsZ8oMJBufI6d3xkaGelZ8",
  authDomain: "ventra-3381c.firebaseapp.com",
  projectId: "ventra-3381c",
  storageBucket: "ventra-3381c.firebasestorage.app",
  messagingSenderId: "849720487539",
  appId: "1:849720487539:web:e517be9bc82c8fa489c406",
  measurementId: "G-QWRKHLD302"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
