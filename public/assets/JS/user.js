import  app  from "../../firebase.js";
import { waitForUser, userId, userData } from "./authentication.js";
import { getFirestore,doc, getDoc, } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const userUid = urlParams.get("id");
const db = getFirestore(app);

await waitForUser();
let userProfilePicture;
let profileData;
let profileName;
let profileEmail;
let profileBio;
let docSnap = await getDoc(doc(db, "users", userUid));
if (docSnap.exists()) {
    profileData = docSnap.data();
    userProfilePicture = profileData.PhotoURL;
    profileName = profileData.Name;
    profileEmail = profileData.Email;
    profileBio = profileData.Bio;
}
const profilePicture = document.querySelector(".user-profile-picture")
const userName = document.querySelector(".userName");
const userEmail = document.querySelector(".user-email")
const userBio = document.querySelector(".user-bio")
const viewAccount = document.querySelector(".viewAccount")

profilePicture.src = userProfilePicture;
userName.textContent = profileName;
userEmail.textContent = profileEmail;
userBio.textContent = profileBio;
// Display Channels
let channelData;
async function displayChannels() {
    const displayOwnedChannles = document.querySelector(".display-owned-channels");
    const ownedChannels = profileData.ownedChannels;
    ownedChannels.forEach(async (channels) => {
        docSnap = await getDoc(doc(db, "channels", channels));
        if (docSnap.exists()) {
            channelData = docSnap.data();
            displayOwnedChannles.innerHTML +=
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
if (userUid === userId) {
    viewAccount.innerHTML = `<div class = "lios-button visitAccount"><span>View Accounts Page</span></div>`
    document.querySelector(".visitAccount").addEventListener("click",()=> {
        window.location.href =`../account`;
    })
}