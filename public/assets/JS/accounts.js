import { waitForUser } from "./authentication.js";
import { readUserData } from "./authentication.js";

// Display User Info
const profilePicture = document.querySelector(".profile-picture");
const profileName = document.querySelector(".profile-name");
const userEmail = document.querySelector(".user-email");
let displayName;
let email;
let photoURL;
let emailVerified;
let userId;
let userData;
let userEmailEditInputValue;
let userBioEditInputValue;
async  function displayUser() {
  await waitForUser();
  await readUserData();
  const userEmail = document.querySelector(".user-email");
  const editUserEmail = document.querySelector(".edit-user-email");
  const userEmailEditButton = document.querySelector(".user-email-edit-button");
  const editUserEmailInput = document.querySelector(".edit-user-email-input");
  const userEmailEditSubmit = document.querySelector(".user-email-edit-submit");
  const userEmailContainer = document.querySelector(".user-email-container");

  // Email
  userEmail.textContent = userData.Email;
  console.log(userEmail.textContent);

  editUserEmailInput.addEventListener("input", () => {
    userEmailEditInputValue = editUserEmailInput.value;
  });

  editUserEmail.addEventListener("submit", async () => {
    userEmailContainer.style.display = "flex";
    editUserEmail.style.display = "none";
    userEmailEditButton.style.display = "flex"; 
    try {
    const docRef = await setDoc(doc(db, "users",userId), {
      Email: userEmailEditInputValue
    }, { merge: true });
    window.location.reload();
  } catch (e) {
    console.log(e);
  };
  })

  userEmailEditButton.addEventListener("click",async () => {
    userEmailContainer.style.display = "none";
    editUserEmail.style.display = "flex";
    userEmailEditButton.style.display = "none";
    editUserEmailInput.value = userData.Email;
    console.log(editUserEmailInput.value);
  })


  // Bio
  const userBio = document.querySelector(".user-bio");
  const editUserBio = document.querySelector(".edit-user-bio");
  const userBioEditButton = document.querySelector(".user-bio-edit-button");
  const editUserBioInput = document.querySelector(".edit-user-bio-input");
  const userBioEditSubmit = document.querySelector(".user-bio-edit-submit");
  const userBioContainer = document.querySelector(".user-bio-container");

  userBio.textContent = userData.Bio;
  console.log(userBio.textContent);

  editUserBioInput.addEventListener("input", () => {
    userBioEditInputValue = editUserBioInput.value;
  });

  editUserBio.addEventListener("submit", async () => {
    userBioContainer.style.display = "flex";
    editUserBio.style.display = "none";
    userBioEditButton.style.display = "flex"; 
    try {
    const docRef = await setDoc(doc(db, "users",userId), {
      Bio: userBioEditInputValue
    },{ merge: true});
    window.location.reload();
  } catch (e) {
    console.log(e);
  };
  })

  userBioEditButton.addEventListener("click",async () => {
    userBioContainer.style.display = "none";
    editUserBio.style.display = "flex";
    userBioEditButton.style.display = "none";
    editUserBioInput.value = userData.Bio;
    console.log(editUserBioInput.value);
  })


  // Profile Picture and Name
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
