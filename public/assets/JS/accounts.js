import { waitForUser } from "./authentication.js";
import { readUserData, userData, userId, isLoggedIn,googleProvider,displayName } from "./authentication.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {
  getAuth,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import app from "../../firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);


// Check If user is logged in 

// async function userLoginStatus() {
//   await waitForUser();
//   if (isLoggedIn === true) {
//     console.log(`Welcome Back ${displayName}`);
//   }
//   else {
//     signInWithPopup(auth, googleProvider)
//       .then((result) => {
//         const credential = GoogleAuthProvider.credentialFromResult(result);
//         const user = result.user;
//         console.log("User signed in:");
//         window.location.reload();
//       })
//       .catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         console.log(`Error signing in: ${errorCode} - ${errorMessage}`);
//       });
//   }
// }
// userLoginStatus();
// Display User Info
const profilePicture = document.querySelector(".profile-picture");
const profileName = document.querySelector(".profile-name");
const userEmail = document.querySelector(".user-email");
let email;
let photoURL;
let emailVerified;
let updatedEmail;
let updatedBio;
async  function displayUser() {
  await waitForUser();
  await readUserData();
  const userEmail = document.querySelector(".user-email");
  const profileDetails = document.querySelector(".profile-details");
  const editProflieDetails = document.querySelector(".edit-profile-details");
  const editButton = document.querySelector("#editProfile");
  const cancelEdit = document.querySelector("#cancelEdit");
  // Change Mode
  editButton.addEventListener("click", () => {
    profileDetails.style.display = "none";
    editProflieDetails.style.display = "unset";
  })
  cancelEdit.addEventListener("click", () => {
    editProflieDetails.style.display = "none";
    profileDetails.style.display = "unset";
  })
  // Display Email
  userEmail.textContent = userData?.Email || "";
  console.log(userEmail.textContent);
  // Display Bio
  const userBio = document.querySelector(".user-bio");
  // Edit Email and Bio
  const userEmailInput = document.querySelector(".edit-user-email-input")
  const userBioInput = document.querySelector(".edit-user-bio-input");

  userEmailInput.value = userData.Email;
  userBioInput.value = userData.Bio;
  userEmailInput.addEventListener("input", (value) => {
    updatedEmail = value.target.value;
  })
  userBioInput.addEventListener("input", (value) => {
    updatedBio = value.target.value;
  })
  // Save Edits
  const saveEdits = document.querySelector("#saveEdit");
  saveEdits.addEventListener("click", async () => {
    await setDoc(
      doc(db, "users", userId), {
      Email: updatedEmail,
      Bio: updatedBio,
    }, { merge: true }
    );
    window.location.reload();
  });
  userBio.textContent = userData.Bio;
  console.log(userBio.textContent);
  // Profile Picture and Name
  profilePicture.src = userData?.PhotoURL || profilePicture.src;
  profileName.innerHTML = `<span>${userData?.Name || ""}</span>`;
  
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

// Get user ability to create channels
let canCreateChannels;
const createChannel = document.querySelector("#createChannel");
const hasAbilityToCreateChannels = (async () => {
  await waitForUser();
  await readUserData();

  canCreateChannels = userData.canCreateChannels;
  console.log(canCreateChannels);
  if (canCreateChannels === true) {
    createChannel.style.display = "unset";
  }
  else {
    document.querySelector("#create-channel").style.display = "none";
  }
});
hasAbilityToCreateChannels();