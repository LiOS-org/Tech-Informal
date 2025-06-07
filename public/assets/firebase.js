// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCk5OleMaSHlp1_pFyvjU1wjMAcjB0Gn4M",
    authDomain: "tech-informal.web.app.com",
    projectId: "techinformal-blogs",
    storageBucket: "techinformal-blogs.firebasestorage.app",
    messagingSenderId: "285892133106",
    appId: "1:285892133106:web:76cc80f099fa84daf2906b",
    measurementId: "G-HTCTZT74YY"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);