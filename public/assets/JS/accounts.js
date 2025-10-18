import { waitForUser } from "./authentication.js";
import { readUserData, userData, userId, isLoggedIn,googleProvider,displayName } from "./authentication.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  arrayUnion,
  updateDoc,
  collection,
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

//   userLoginStatus();

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
  userEmail.textContent = userData.Email || "";
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
      Email: updatedEmail || userData.Email,
      Bio: updatedBio || userData.Bio,
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
async function  hasAbilityToCreateChannels() {
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
};
hasAbilityToCreateChannels();
// Finally create channel
const createChannelButton = document.querySelector("#createChannelButton");
let docRef;
async function  createChannelFunction(){
  await hasAbilityToCreateChannels();
  const createDate = new Date();
  const newChannelName = document.querySelector("#channelName").value.trim();
  const newChannelDesc = document.querySelector("#channelDescription").value.trim();
  const newChannelLogoUrl = document.querySelector("#profilePictureUrl").value.trim();
  try {
    docRef = await addDoc(collection(db, "channels"), {
      uid: "",
      creatorId: userData.uid,
      creatorName: userData.Name,
      creatorEmail: userData.Email,
      createdOn: createDate,
      channelName: newChannelName,
      channelDescription: newChannelDesc,
      channelImage: newChannelLogoUrl,
    });
  } catch (e) {
    console.log("Error Creating the Channel: ", e)
  }
  // update UID
  if (docRef) {
    await setDoc(doc(db, "channels", docRef.id), { uid: docRef.id }, { merge: true });
    await setDoc(doc(db, "channelIndex", docRef.id), {
      uid: docRef.id,
      name: newChannelName,
      description: newChannelDesc,
    })
    await updateDoc(doc(db, "users", userData.uid),{
      ownedChannels: arrayUnion(docRef.id),
    })
  }
};
createChannelButton.addEventListener("click", async() => {
  await createChannelFunction();
  window.location.replace(`../channel?id=${docRef.id}`);
})
// Display User Channels
let channelData;
let docSnap;
async function displayChannels() {
  await readUserData();
    const displayOwnedChannles = document.querySelector(".display-owned-channels");
    const ownedChannels = userData.ownedChannels;
    ownedChannels.forEach(async (channels) => {
        docSnap = await getDoc(doc(db, "channels", channels));
        if (docSnap.exists()) {
            channelData = docSnap.data();
            displayOwnedChannles.innerHTML =
                `<div class = "channel-card lios-card frosted_background">
                    <div class = "profile-picture-container"><img src = "${channelData.channelImage}" alt = "Channel Logo"></img></div>
                    <div class = "lios-card-title">${channelData.channelName}</div>
                    <hr>
                    <p>${channelData.channelDescription}</p>
                    <div><span>Created On: </span><span>${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(channelData.createdOn.toDate())}</span></div>
                    <br>

                    <br>
                    <div class = "lios-button-group"><a href = "../channel?id=${channelData.uid}" class = "lios-button"><span>View Channel</span></a></div>
                </div>`;
        }
    })
}
displayChannels();