import  app  from "../../firebase.js";
import { waitForUser, userId, userData } from "./authentication.js";
import { getFirestore,doc, getDoc, } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const channelId = urlParams.get("id");
const db = getFirestore(app);

// Get channel details

await waitForUser();
let channelName;
let channelDesc;
let channelCreationDate;
let channelOwner;
let channelData;
let channelLogo;
let creatorId;
const docSnap = await getDoc(doc(db, "channels", channelId));
if (docSnap.exists()) {
    channelData = docSnap.data();
    channelName = channelData.channelName;
    channelDesc = channelData.channelDescription;
    channelCreationDate = channelData.createdOn.toDate();
    channelOwner = channelData.creatorName;
    channelLogo = channelData.channelImage;
    creatorId = channelData.creatorId;
    console.log(channelData);
}
const channelImage = document.querySelector(".channel-logo");
const channelDisplayName = document.querySelector(".channelName")
const createdOn = document.querySelector(".createdOn");
const createdBy = document.querySelector(".createdBy");
const channelDescription = document.querySelector(".channelDescription")
const newPost = document.querySelector(".newPost");

channelImage.src = channelLogo;
channelDisplayName.textContent = channelName;
createdOn.textContent = channelCreationDate;
createdBy.innerHTML = `<a href="../user?id=${creatorId}">${channelOwner}</a>`;
channelDescription.textContent = channelDesc

if (creatorId === userId) {
    newPost.innerHTML = `<div class = "lios-button addPost"><span>Create new post</span></div>`
}