import { virtualDom } from "./studio.js";
import { db } from "../authentication.js";
import { doc, collection, getDocs,deleteDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function studioShowComments(postId) {
    const channelCommentsPage = document.createElement("div");
    channelCommentsPage.classList.add("channel-comments-page", "page");
    channelCommentsPage.innerHTML = //html
    `
        <div class = "lios-card-title"><span>All Comments</span></div>
        <div class = "lios-card-container studio-comments-container"></div>

    `
    virtualDom.innerHTML = "";
    virtualDom.appendChild(channelCommentsPage);

    const comments = await getDocs(collection(db, "posts", postId, "comments"));
    const commentsContainer = channelCommentsPage.querySelector(".studio-comments-container");
    
    comments.forEach(comment => {
        const commentData = comment.data();
        console.log(commentData);
        const date = commentData.date.toDate().toLocaleDateString();
        const commentBox = document.createElement("div");
        commentBox.classList.add("comment-box", "frosted_background", "lios-card");
        commentBox.innerHTML =//html
            `
            <div id = "${comment.id}" class="comment-details">
                <div class="user-info">
                    <span class="user-profile-picture">
                        <div class="profile-picture-container">
                            <img src="${commentData.userProfilePicture}" class="profile-picture" alt="profile picture">
                        </div>
                    </span>
                    <span class="user-profile-name">${commentData.userName}</span>
                </div>
                <div class="comment-meta">
                    <span class="comment-date">${date}</span>
                </div>
            </div>
            <br>
            <p>${commentData.comment}</p>
            <div class = "comment-buttons">
                <div class = "reply-button"></div>
                <div class = "special-buttons"></div>
            </div>

        `;
        commentsContainer.appendChild(commentBox);
        const specialButtons = commentBox.querySelector(".special-buttons");

        const deleteButton = document.createElement("span");
        deleteButton.classList.add("lios-action-button", "delete-button");


        deleteButton.innerHTML = //html 
            `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            `;
        deleteButton.addEventListener("click", async () => {
            try {
                await deleteDoc(doc(db, "posts", postId, "comments", comment.id));
                commentBox.style.display = "none";
            } catch (error) {
                console.error("Failed to delete comment:", error);
            };
        });
            
        specialButtons.appendChild(deleteButton);
    });
};