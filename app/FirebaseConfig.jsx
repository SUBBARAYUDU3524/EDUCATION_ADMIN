import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore
import { getStorage } from "firebase/storage"; // Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyDnwP60QGNCcdPTdjbCky89Z5mxBNFs0gE",
  authDomain: "jnanasutra-91161.firebaseapp.com",
  projectId: "jnanasutra-91161",
  storageBucket: "jnanasutra-91161.firebasestorage.app",
  messagingSenderId: "220201658638",
  appId: "1:220201658638:web:565cbc88412eb9ee134f5f",
  measurementId: "G-06GPF4XZ33",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
