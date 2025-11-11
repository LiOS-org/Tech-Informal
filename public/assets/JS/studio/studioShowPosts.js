import { virtualDom } from "./studio.js";
import { studioEditor } from "./studioTools.js"
import { studioShowComments } from "./studioShowComments.js";
import { db } from "../authentication.js";
import {doc, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function showChannelPosts(channelUid) {
    const postsQuery = await getDocs(collection(db, "channels", channelUid, "posts"));
    const posts = postsQuery.docs;
    const channelPostsPage = document.createElement("div");
    channelPostsPage.classList.add("channel-post-page", "page");
    channelPostsPage.innerHTML = //html
    `
        <div class = "lios-card-title"><span>All Posts</span></div>
        <div class = "studio-posts-container"></div>
    `;
    virtualDom.innerHTML = "";
    virtualDom.appendChild(channelPostsPage);

    // Displaying the posts

    posts.forEach(postDoc => {
        const post = postDoc.data();
        const postBox = document.createElement("div");
        postBox.classList.add("lios-card", "post-box", "frosted_background");
        postBox.innerHTML = //html
        `
            <div class = "studio-post-thumbnail-container">
                <img src = "${post.thumbnail}">
            </div>
            <div class = "studio-post-container">
                <div class = "lios-card-title"><span>${post.title}</span></div>
                <p>${post.description}</p>
                <div class = "studio-post-tags-container"></div>
            </div>
            <div class = "studio-post-actions">
                <div class="lios-action-button studio-edit-post-button"><span>Edit</span></div>
                <div class="lios-action-button studio-show-comments-button"><span>Comments</span></div>
            </div>
        `;
        postBox.querySelector(".studio-edit-post-button").addEventListener("click", () => {
            studioEditor("edit", post.postId, channelUid);
        });
        postBox.querySelector(".studio-show-comments-button").addEventListener("click", () => {
            studioShowComments(post.postId);
        });
        const tagsContainer = postBox.querySelector(".studio-post-tags-container");
        post.Tags.forEach(tag => {
            const tagElement = document.createElement("div");
            tagElement.className = "post-tag";
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
        virtualDom.querySelector(".studio-posts-container").appendChild(postBox);
    });
}