import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBr85PZ3KWQke1EVAlmtRrv_xRDdaN95Ow",
  authDomain: "instahomeo-cd340.firebaseapp.com",
  projectId: "instahomeo-cd340",
  storageBucket: "instahomeo-cd340.firebasestorage.app",
  messagingSenderId: "395766947174",
  appId: "1:395766947174:web:be22236a147f29ce86bca7",
  measurementId: "G-0EXM3L11X1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Google Provider
export const googleProvider = new GoogleAuthProvider();
