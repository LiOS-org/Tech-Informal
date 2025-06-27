import { auth } from '../firebase.js';
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

// Default login: Google
const defaultProvider = new GoogleAuthProvider();
export function login() {
  return signInWithPopup(auth, defaultProvider);
}

// Flexible login (used in #login window)
export function loginWith(providerName) {
  let provider;
  switch (providerName) {
    case 'google':
      provider = new GoogleAuthProvider();
      break;
    case 'github':
      provider = new GithubAuthProvider();
      break;
    default:
      throw new Error("Unsupported provider: " + providerName);
  }
  return signInWithPopup(auth, provider);
}

// Logout
export function logout() {
  return signOut(auth);
}

// Auth state listener
export function watchUser(callback) {
  onAuthStateChanged(auth, callback);
}

// Sign in with Email
export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Register with Email and set displayName
export async function registerWithEmail(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, {
    displayName: displayName
  });
  return userCredential;
}