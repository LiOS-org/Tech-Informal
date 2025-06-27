import { auth, provider } from './firebase.js';
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

// Login
export function login() {
  return signInWithPopup(auth, provider);
}

// Logout
export function logout() {
  return signOut(auth);
}

// Monitor auth changes
export function watchUser(callback) {
  onAuthStateChanged(auth, callback);
}