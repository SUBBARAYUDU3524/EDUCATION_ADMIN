import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore
import { getStorage } from "firebase/storage"; // Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyCkggt-c1rP7gXZpy1E4ZMYEOSxgSdkAsE",
  authDomain: "brainbeauty-97662.firebaseapp.com",
  projectId: "brainbeauty-97662",
  storageBucket: "brainbeauty-97662.appspot.com",
  messagingSenderId: "668072198189",
  appId: "1:668072198189:web:fb1ac8f89622fb94bcf8a4",
  measurementId: "G-T0FKFQN8JH",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
