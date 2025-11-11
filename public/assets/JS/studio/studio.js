import { isLoggedIn, readUserData, userData,userId, waitForUser } from "../authentication.js";
import { getFirestore, collection, query, where, orderBy, limit, getDocs,getDoc,doc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { showChannelPosts } from "./studioShowPosts.js";
import {userManagementPage} from "./userManagementPage.js"
import app from "../../../firebase.js";

const urlParams = new URLSearchParams(window.location.search);
const currentPage = urlParams.get("currentPage");

await readUserData();

const db = getFirestore(app);

if (isLoggedIn === !true) {
    window.location.href = "../account";
}
const virtualDom = document.querySelector(".virtual-dom-container");

// Dashboard
let latestPostData
async function getLatestPost(userId) {
    const latestPost = await getDocs(query(collection(db, "posts"), where("AuthorId", "==", userId), orderBy("CreatedOn", "desc"), limit(1)));
    latestPostData = latestPost.docs[0].data();
}
await getLatestPost(userId);
// Dashboard
const dashboard = document.createElement("div");
dashboard.classList.add("studio-dashboard","page");
dashboard.innerHTML = //html
    `
    <div class = "lios-card-title"><span>Dashboard</span></div>
    <div class = "lios-card-container">
        <div class = lios-card>
            <h3> Latest Post Data</h3>
            <div class = "key-value">
                <span>Post Title: </span>
                <span>${latestPostData.Title}</span>
            </div>
            <div class = "key-value">
                <span>Tags Used: </span>
                <span>${latestPostData.Tags}</span>
            </div>
            <div class = "key-value">
                <span>Date of Creation: </span>
                <span>${latestPostData.CreatedOn.toDate().toLocaleString()}</span>
            </div>
            <div class = "key-value">
                <span>Post Id: </span>
                <span>${latestPostData.uid}</span>
            </div>
        </div>
    </div>
    `;
// Channls Page
let channels = document.createElement("div");
let channelInfo;
channels.classList.add("studio-all-posts", "page");
userData.ownedChannels.forEach(channel => {
    const getChannelInfo = (async () => {
        const channelInfoFetch = await getDoc(doc(db, "channelIndex", channel));
        channelInfo = channelInfoFetch.data();
        const displayChannel = document.createElement("div");
        displayChannel.innerHTML = //html
            `
            <div class = "channel-card lios-card frosted_background">
                    <div class = "profile-picture-container"><img src = "${channelInfo.channelImage}" alt = "Channel Logo"></img></div>
                    <div class = "lios-card-title">${channelInfo.name}</div>
                    <hr>
                    <p>${channelInfo.description}</p>
                    <br>

                    <br>
                    <div class = "lios-action-button studio-action-view-channel-posts"><span>View Posts</span></div>
            </div>
        `;
        channels.appendChild(displayChannel);
        displayChannel.querySelector(".studio-action-view-channel-posts").addEventListener("click", () => {
            showChannelPosts(channelInfo.uid);
        });
    })();
});

channels.innerHTML = //html
    `
    <div class = "lios-card-title"><span>Channels</span></div>
    `
;
// Load default view
if (!currentPage) {
    const displayDefaultDom = (() => {
        virtualDom.appendChild(dashboard);
    })();
} else if (currentPage === "dashboard") {
    const displayDefaultDom = (() => {
        virtualDom.appendChild(dashboard);
    })();
} else if (currentPage === "channels") {
    const displayDefaultDom = (() => {
        virtualDom.appendChild(channels);
    })();
} else if (currentPage == "user-management") {
    const displayDefaultDom = (() => {
        userManagementPage();
    })();
} else {
    const displayDefaultDom = (() => {
        virtualDom.appendChild(dashboard);
    })();
};

export { dashboard, channels,virtualDom};