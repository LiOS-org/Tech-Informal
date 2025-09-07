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
const auth = getAuth(app);
const db = getFirestore(app);
const accountButton = document.querySelector(".account-button");
const signInButton = document.querySelector(".sign-in-button");


// Google Sign in
const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = document.querySelector(".sign-in-button");
signInWithGoogle.addEventListener("click", () => {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;
      console.log("User signed in:");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(`Error signing in: ${errorCode} - ${errorMessage}`);
    });
  window.location.reload();
});

// On auth state changed
const profilePicture = document.querySelector(".profile-picture");
const profileName = document.querySelector(".profile-name");
const userEmail = document.querySelector(".user-email");
let displayName;
let email;
let photoURL;
let emailVerified;
let userId;

const waitForUser =() => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        console.log("User is signed in");
        signInButton.style.display = "none";
        accountButton.style.display = "inline-flex";
        displayName = user.displayName;
        email = user.email;
        photoURL = user.photoURL;
        emailVerified = user.emailVerified;
        userId = user.uid;
        try {
          await setDoc(doc(db, "users", uid), {
            uid: uid,
            Name: displayName,
            Email: email,
            PhotoURL: photoURL,
          }, { merge: true });
          console.log("User data written");
          resolve(user)
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }
      else {
        signInButton.style.display = "inline-flex";
        accountButton.style.display = "none";
        resolve(null);
      }
    })
  }
  )
};
export default waitForUser;
// Read User from Firestore
let userData;
const readUserData = () => {
  return new Promise(async(resolve) => {
    await waitForUser();
    const userDoc = await getDoc(doc(db, "users", userId));
    userData = userDoc.data();
    resolve(userData);
  })
}
readUserData();
// Display User Info
async  function displayUser() {
  await waitForUser();
  await readUserData();

  profilePicture.src = userData.PhotoURL;
    profileName.innerHTML = `<span>${userData.Name}</span>`;
}
displayUser();
// Sign Out
document.querySelector("#signOut").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      console.log("User signed out");
      window.location.reload();
    })
    .catch((error) => {
      // An error happened.
      console.log(`Error signing out: ${error.code} - ${error.message}`);
    });
});
