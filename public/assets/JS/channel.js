import  app  from "../../firebase.js";
import { waitForUser, userId, userData } from "./authentication.js";
import { getFirestore,doc, getDoc,getDocs,collection } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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

// Display Posts

const allPostsSnapshot = await getDocs(collection(db, "channels", channelId, "posts"));
const allPosts = allPostsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
}));


allPosts.forEach(async post => {
    function displayPosts() {
        const postCard = document.createElement("div");
        postCard.className = "lios-card post-card frosted_background";
        console.log(post);
        const postDate = post.createdOn.toDate().toLocaleDateString();
        postCard.innerHTML =//html
            `
            <div class = "post-thumnail-container">
                <img class = "post-thumbnail" src = "${post.thumbnail}">
            </div>
            <h3>${post.title}</h3>
            <div class = "tags-container"></div>
            <p>${post.description}</p>
            <div class = "lios-button-group"><a class = "lios-action-button" href = "../view?id=${post.uid}"><span>View Post</span></a></div>
            <hr>
            <div class = "display-post-meta">
                <span> <a href = "../channel?id=${post.channelId}">${post.channelName}</a></span><span>${postDate}</span>
            </div>
            `;
        
        post.Tags.forEach(tag => {
            const newTag = document.createElement("div");
            newTag.className = "post-tag";
            newTag.textContent = tag;
            postCard.querySelector(".tags-container").appendChild(newTag);
        })
    
        document.querySelector(".posts-container").appendChild(postCard);
    };
    displayPosts();
})

if (creatorId === userId) {
    newPost.innerHTML = `<div class = "lios-button addPost"><span>Create new post</span></div>`
    const addPost = document.querySelector(".addPost");
    addPost.addEventListener("click",() => {
        window.location.href = `../new?onChannel=${channelData.uid}`
    })
}