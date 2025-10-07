import { waitForUser } from "./authentication.js";
import { doc, getDocs, collection, getFirestore, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import app from "../../firebase.js";

const db = getFirestore(app);

await waitForUser();

const allPostsSnapshot = await getDocs(collection(db, "postsIndex"));
const allPosts = allPostsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
}));


allPosts.forEach(async post => {
    function displayPosts() {
        const postCard = document.createElement("div");
        postCard.className = "lios-card post-card frosted_background";
        console.log(post);
        const postDate = post.CreatedOn.toDate().toLocaleDateString();
        postCard.innerHTML =//html
            `
            <div class = "post-thumnail-container">
                <img class = "post-thumbnail" src = "${post.thumbnail}">
            </div>
            <h3>${post.Title}</h3>
            <div class = "tags-container"></div>
            <p>${post.Description}</p>
            <div class = "lios-button-group"><a class = "lios-action-button" href = "view?id=${post.uid}"><span>View Post</span></a></div>
            <hr>
            <div class = "display-post-meta">
                <span> <a href = "channel?id=${post.ChannelId}">${post.ChannelName}</a></span><span>${postDate}</span>
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