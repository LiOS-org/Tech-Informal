import app from "../../firebase.js";
import { waitForUser,userData } from "./authentication.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { initializeCommentsBox,renderComments } from "./comments.js";

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");
const db = getFirestore(app);

await waitForUser();

const postContainer = document.querySelector(".post-container");

// Fetch post details
const postInfo = await getDoc(doc(db, "posts", postId));
const postData = postInfo.data();
export { postData };

// Display Posts

document.querySelector(".post-title").textContent = postData.Title;
document.querySelector(".post-description").textContent = postData.Description;
document.querySelector(".post-body").innerHTML = postData.Contents;

// Display Metadata

const tags = postData.Tags;
const channelId = postData.ChannelId;
const tagsContainer = document.querySelector(".tags-container");
tags.forEach(tag => {
    const tagElement = document.createElement("div");
    tagElement.className = "post-tag";
    tagElement.textContent = tag;
    tagsContainer.appendChild(tagElement);
});
const channelInfo = await getDoc(doc(db, "channels", channelId));
const channelData = channelInfo.data();

document.querySelector(".posted-on-date").textContent = postData.CreatedOn.toDate().toLocaleDateString();

console.log(postData);

// Display Channel Info

const channelLogo = document.querySelector(".channel-logo");
const channelName = document.querySelector(".channel-name");

channelLogo.src = channelData.channelImage;
channelLogo.alt = channelData.channelName;
channelName.textContent = channelData.channelName;
channelName.href = `../channel?id=${channelId}`;
channelLogo.addEventListener("click", () => {
    window.location.href = `../channel?id=${channelId}`;
})

// Tag as canonical 

const link = document.createElement('link');
link.rel = 'canonical';
link.href = window.location.href;
document.head.appendChild(link);

// Comments
console.log(userData);
initializeCommentsBox();
renderComments();