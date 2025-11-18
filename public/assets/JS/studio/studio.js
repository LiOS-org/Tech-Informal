import { isLoggedIn, readUserData, userData,userId, waitForUser } from "../authentication.js";
import { getFirestore, collection, query, where, orderBy, limit, getDocs,getDoc,doc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { showChannelPosts } from "./studioShowPosts.js";
import {userManagementPage} from "./userManagementPage.js"
import app from "../../../firebase.js";
import { loadSidebar, sidebarMap,constructSidebarButtons, updateSidebarButtonStatus } from "../sidebar.js";

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
// Studio Sidebar
const constructStudioSidebar = (async() => {
    await loadSidebar();
    sidebarMap.buttons.push(
        {
            "label": "Dashboard",
            "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-gauge-icon lucide-gauge\"><path d=\"m12 14 4-4\"/><path d=\"M3.34 19a10 10 0 1 1 17.32 0\"/></svg>",
            "action": () => {
                virtualDom.innerHTML = "";
                virtualDom.appendChild(dashboard);
            }
        }
        
    );
    if (userData.role == "owner" || "mod") {
        sidebarMap.buttons.push(
            {
                "label": "Channels",
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-rss-icon lucide-rss\"><path d=\"M4 11a9 9 0 0 1 9 9\"/><path d=\"M4 4a16 16 0 0 1 16 16\"/><circle cx=\"5\" cy=\"19\" r=\"1\"/></svg>",
                "action": () => {
                    virtualDom.innerHTML = "";
                    virtualDom.appendChild(channels);
                }
            },
            {
                "label": "User Management",
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-user-cog-icon lucide-user-cog\"><path d=\"M10 15H6a4 4 0 0 0-4 4v2\"/><path d=\"m14.305 16.53.923-.382\"/><path d=\"m15.228 13.852-.923-.383\"/><path d=\"m16.852 12.228-.383-.923\"/><path d=\"m16.852 17.772-.383.924\"/><path d=\"m19.148 12.228.383-.923\"/><path d=\"m19.53 18.696-.382-.924\"/><path d=\"m20.772 13.852.924-.383\"/><path d=\"m20.772 16.148.924.383\"/><circle cx=\"18\" cy=\"15\" r=\"3\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/></svg>",
                "action": () => {
                    userManagementPage()
                }
            }
        );
    };
    updateSidebarButtonStatus();
})();
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