import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAMxsX6Yv645lPmJ1YdA8GLuIBq0_LwN0Y",
  authDomain: "mentorship-project-153ff.firebaseapp.com",
  projectId: "mentorship-project-153ff",
  storageBucket: "mentorship-project-153ff.firebasestorage.app",
  messagingSenderId: "1071201569910",
  appId: "1:1071201569910:web:dcfbb7e6b94e319fd3e357",
  measurementId: "G-17JLECVVEQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
