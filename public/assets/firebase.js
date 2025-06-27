import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCk5OleMaSHlp1_pFyvjU1wjMAcjB0Gn4M",
  authDomain: "tech-informal.web.app",
  projectId: "techinformal-blogs",
  storageBucket: "techinformal-blogs.firebasestorage.app",
  messagingSenderId: "285892133106",
  appId: "1:285892133106:web:76cc80f099fa84daf2906b",
  measurementId: "G-HTCTZT74YY"
};

// Initialize
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };