import app from "../../firebase.js";
import { waitForUser,userData, readUserData, userId } from "./authentication.js";
import { getFirestore, doc, getDoc,setDoc,collection,getDocs,increment,updateDoc,arrayRemove,arrayUnion } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { initializeCommentsBox, renderComments } from "./comments.js";
import { navigationMap, contextualBottomNavigation, bottomNavigation } from "./navigation.js";
import { liosPopup } from "../../LiOS-Open/public/modules/JS/liosOpen.js";

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");
const db = getFirestore(app);
// Resource Saving Mode
let resourceSavingMode = false;
const checkCompatibility = async () => {
    const deviceMemory = navigator.deviceMemory;
    if (deviceMemory && deviceMemory <= 4) {
        resourceSavingMode = true;
    };
    if (resourceSavingMode == true) {
        const postContainer = document.querySelector(".post-container");
        postContainer.classList.remove("frosted_background");
        postContainer.style.background = "var(--gray)";
    };
};
await checkCompatibility();

let postData;
let getPostData;
// Fetch post details

getPostData = async () => {
    const postInfo = await getDoc(doc(db, "posts", postId));
    postData = postInfo.data();
};
async function displayPost() {
    const postContainer = document.querySelector(".post-container");

    await getPostData();

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


// Display Channel Info

    const channelLogo = document.querySelector(".channel-logo");
    const channelName = document.querySelector(".channel-name");

    channelLogo.src = channelData.channelImage;
    channelLogo.alt = channelData.channelName;
    channelName.textContent = channelData.channelName;
    channelName.href = `../channel?id=${channelId}`;
    channelLogo.addEventListener("click", () => {
        window.location.href = `../channel?id=${channelId}`;
    });

    // Bottom  Navigation Updates
    const updateNavigation = async () => {
        bottomNavigation.innerHTML = "";
        if (!("usersWhoLiked" in postData) || !("usersWhoDisliked" in postData)) {
            await setDoc(doc(db, "posts", postId), {
                usersWhoLiked: [""],
                usersWhoDisliked: [""]
            }, { merge: true });
        } else if (("usersWhoLiked" in postData) && ("usersWhoDisliked" in postData)) {
            const liked = postData.usersWhoLiked.includes(userId);
            const disliked = postData.usersWhoDisliked.includes(userId);
            if (liked && !disliked) {
                navigationMap["viewPost"].push(
                    {
                        label: "Liked",
                        action: async () => {
                            updateDoc(doc(db, "posts", postId), {
                                usersWhoLiked: arrayRemove(userId),
                                likes: increment(-1)
                            });
                            navigationMap["viewPost"].splice(2, 2);
                            await getPostData();
                            await contextualBottomNavigation();
                            updateNavigation();
                        },
                        icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-thumbs-up-icon lucide-thumbs-up\"><path d=\"M7 10v12\"/><path d=\"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z\"/></svg>"
                    },
                    {
                        label: "Dislike",
                        action: async () => {
                            updateDoc(doc(db, "posts", postId), {
                                usersWhoLiked: arrayRemove(userId),
                                usersWhoDisliked: arrayUnion(userId),
                                likes: increment(-1),
                                dislikes: increment(1)
                            });
                            navigationMap["viewPost"].splice(2, 2);
                            await getPostData();
                            await contextualBottomNavigation();
                            updateNavigation();
                        },
                        icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-thumbs-down-icon lucide-thumbs-down\"><path d=\"M17 14V2\"/><path d=\"M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z\"/></svg>"
                    }
                );
                contextualBottomNavigation();
            } else if (!liked && disliked) {
                navigationMap["viewPost"].push(
                    {
                        label: "Like",
                        action: async () => {
                            updateDoc(doc(db, "posts", postId), {
                                usersWhoLiked: arrayUnion(userId),
                                likes: increment(1),
                                usersWhoDisliked: arrayRemove(userId),
                                dislikes: increment(-1)
                            });
                            navigationMap["viewPost"].splice(2, 2);
                            await getPostData();
                            await contextualBottomNavigation();
                            updateNavigation();
                        },
                        icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-thumbs-up-icon lucide-thumbs-up\"><path d=\"M7 10v12\"/><path d=\"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z\"/></svg>"
                    },
                    {
                        label: "Disliked",
                        action: async () => {
                            updateDoc(doc(db, "posts", postId), {
                                usersWhoDisliked: arrayRemove(userId),
                                dislikes: increment(-1)
                            });
                            navigationMap["viewPost"].splice(2, 2);
                            await getPostData();
                            await contextualBottomNavigation();
                            updateNavigation();
                        },
                        icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-thumbs-down-icon lucide-thumbs-down\"><path d=\"M17 14V2\"/><path d=\"M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z\"/></svg>"
                    }
                );
                contextualBottomNavigation();
            } else if (!liked && !disliked) {
                console.log("User can take either action");
                navigationMap["viewPost"].push(
                    {
                        label: "Like",
                        action: async () => {
                            updateDoc(doc(db, "posts", postId), {
                                usersWhoLiked: arrayUnion(userId),
                                likes: increment(1)
                            });
                            navigationMap["viewPost"].splice(2, 2);
                            await getPostData();
                            await contextualBottomNavigation();
                            updateNavigation();
                        },
                        icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-thumbs-up-icon lucide-thumbs-up\"><path d=\"M7 10v12\"/><path d=\"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z\"/></svg>"
                    },
                    {
                        label: "Dislike",
                        action: async () => {
                            updateDoc(doc(db, "posts", postId), {
                                usersWhoDisliked: arrayUnion(userId),
                                dislikes: increment(1)
                            });
                            navigationMap["viewPost"].splice(2, 2);
                            await getPostData();
                            await contextualBottomNavigation();
                            updateNavigation();
                        },
                        icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-thumbs-down-icon lucide-thumbs-down\"><path d=\"M17 14V2\"/><path d=\"M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z\"/></svg>"
                    }
                );
                await contextualBottomNavigation();
            } else if (liked && disliked) {
                console.log("There is something wrong, Contact admin and report on GitHub\n Error: User has corrupted reaction data");
            } else {
                console.log("There is something wrong, Contact admin and report on GitHub\n Error: No condition satodfied for reactions");
            };
        };
    };
    updateNavigation();
};

async function loadDisplayPost() {
    await displayPost();
    const loader = document.querySelector(".view-post .lios-loader-3");
    const postContainer = document.querySelector(".view-post .post-container");
    const metaContainer = document.querySelector(".meta-container");

    loader.style.display = "none";
    metaContainer.style.display = "flex"
    postContainer.style.display = "block";

};
loadDisplayPost();
// Tag as canonical 



const link = document.createElement('link');
link.rel = 'canonical';
link.href = window.location.href;
document.head.appendChild(link);

// Comments
const userComments = (async () => {
    await readUserData();
    initializeCommentsBox();
    renderComments();

    const commentsLoader = document.querySelector(".post-comment > .lios-loader-3");

    commentsLoader.style.display = "none";
})();

export { postData, getPostData,resourceSavingMode };