import {
  fetchSignInMethodsForEmail,
  linkWithCredential,

} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import {
  getDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { auth, db } from '../firebase.js';
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
export async function loginWith(providerName) {
  let provider;
  switch (providerName) {
    case 'google':
      provider = new GoogleAuthProvider();
      break;
    case 'github':
      provider = new GithubAuthProvider();
      provider.addScope('user:email'); // ensures email is received from GitHub
      break;
    default:
      throw new Error("Unsupported provider: " + providerName);
  }

  try {
    return await signInWithPopup(auth, provider);
  } catch (err) {
    // Handle account-exists error by linking accounts
    if (err.code === 'auth/account-exists-with-different-credential') {
      const pendingCred = err.credential;
      const email = err.customData.email;

      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.includes('google.com')) {
        // Sign in with Google first
        const googleUser = await signInWithPopup(auth, new GoogleAuthProvider());
        // Then link GitHub to Google account
        await linkWithCredential(googleUser.user, pendingCred);
        return { user: googleUser.user };
      }
    }

    throw err;
  }
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
// Get roles
export async function getUserRole(uid) {
  try {
    const roleDoc = await getDoc(doc(db, "roles", uid));
    return roleDoc.exists() ? roleDoc.data().role : "user";
  } catch (err) {
    console.error("Error fetching user role:", err);
    return "user";
  }
}