import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore
import { getStorage } from "firebase/storage"; // Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyBDyjBB7SyrW86qqoP-1mEL9D70SSPTGAA",
  authDomain: "stocks-bf38f.firebaseapp.com",
  databaseURL: "https://stocks-bf38f-default-rtdb.firebaseio.com",
  projectId: "stocks-bf38f",
  storageBucket: "stocks-bf38f.appspot.com",
  messagingSenderId: "465489834542",
  appId: "1:465489834542:web:2920c2fd23af169485a5bf",
  measurementId: "G-5C8HRJKRT3",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
