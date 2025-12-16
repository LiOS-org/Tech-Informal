import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  linkWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  collection,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import app from "../../firebase.js";
import { populateFragments } from './fragments.js';
import { updateAboutWindow } from "../JS/windows.js";

await populateFragments();
await updateAboutWindow();


const auth = getAuth(app);
const db = getFirestore(app);
const accountButton = document.querySelector(".account-button");
const signInButton = document.querySelector(".sign-in-button");


// Google Sign in
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
// Use event delegation to handle both existing and dynamically created sign-in buttons
document.addEventListener("click", (event) => {
  if (event.target.closest(".sign-in-button")) {
    event.preventDefault();
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
        window.location.reload();
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`Error signing in: ${errorCode} - ${errorMessage}`);
      });
  }
});
export { googleProvider };
// On auth state changed
const profilePicture = document.querySelector(".profile-picture");
const profileName = document.querySelector(".profile-name");
const userEmail = document.querySelector(".user-email");
let displayName;
let email;
let photoURL;
let emailVerified;
let userId;
let isLoggedIn;

const waitForUser =() => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        console.log("User is signed in");
        signInButton.style.display = "none";
        accountButton.style.display = "inline-flex";
        displayName = user.displayName;
        photoURL = user.photoURL;
        userId = user.uid;
        email = user.email;
        isLoggedIn = true;
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        try {
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                uid: uid,
                Name: displayName,
                PhotoURL: photoURL,
                role: "user",
                Email: email
              });
              console.log("User data written");
            } else {
              console.log("User already exists, skipping write");
            }
          resolve(user);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }
      else {
        signInButton.style.display = "inline-flex";
        accountButton.style.display = "none";
        resolve(null);
        isLoggedIn = false;

      }
    })
  }
  )
};
export { waitForUser,displayName };
// Read User from Firestore
let userData;
const readUserData = async () => {
  await waitForUser();
  if(isLoggedIn==true){
    const userDoc = await getDoc(doc(db, "users", userId));
    userData = userDoc.data();
  } else {
    console.log("User is not signed in");
  };
}
readUserData();
export { readUserData, userData };
export { userId };
export { isLoggedIn };
export { db };