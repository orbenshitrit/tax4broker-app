import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDNXfngB96MZfCOxiZVXAoKY7FEca4QPks",
  authDomain: "tax4broker.firebaseapp.com",
  projectId: "tax4broker",
  storageBucket: "tax4broker.firebasestorage.app",
  messagingSenderId: "474688137818",
  appId: "1:474688137818:web:a8daf58ebd24b27eca8663",
  measurementId: "G-Y2PLGTKR0B",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;
