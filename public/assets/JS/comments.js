import  app  from "../../firebase.js";
import { isLoggedIn, userData } from "./authentication.js";
import { getFirestore, doc, getDoc,addDoc,collection,deleteDoc,getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getPostData, postData } from "./view.js";

const db = getFirestore(app);

const commentsBox = document.querySelector(".post-comment");

export function initializeCommentsBox(){
    if (isLoggedIn === true) {
        const newCommentBox = document.createElement("div");
        newCommentBox.classList.add("new-comment-box", "frosted_background", "lios-card");
        newCommentBox.innerHTML = //html
            `<div class = "comments-user-info">
                <span class = "profile-picture-container">
                    <img class = "profile-picture" src = "${userData.PhotoURL}" alt = "user profile picture">
                </span>
                <span class = "user-name">${userData.Name}</span>
             </div>
             <textarea class = "new-comment-input" placeholder = "Add a Comment....."  ></textarea><br>
             <div class = "lios-action-button submit-new-comment"><span>Submit Comment</span></div>
            `;
        commentsBox.appendChild(newCommentBox);

        const commentSubmitButton = document.querySelector(".submit-new-comment");
        const newCommentInput = document.querySelector(".new-comment-input");

        newCommentInput.addEventListener("input", () => {
            newCommentInput.style.height = "auto";
            newCommentInput.style.height = newCommentInput.scrollHeight + "px"; 
        });

        commentSubmitButton.addEventListener("click", async () => {
            let newCommentInputData = newCommentInput.value;
            const currentDate=  new Date();
            console.log(newCommentInputData);
            const commentRef = await addDoc(collection(db, "posts", postData.uid, "comments"), {
                comment: newCommentInputData,
                userName: userData.Name,
                userId: userData.uid,
                roles: userData.role,
                userProfilePicture: userData.PhotoURL,
                date: currentDate,
            });
            const commentBox = document.createElement("div");
            commentBox.classList.add("comment-box", "frosted_background", "lios-card");
            const date = currentDate.toLocaleDateString();
            commentBox.innerHTML =//html
            `
            <div id = "${commentRef.id}" class="comment-details">
                <div class="user-info">
                    <span class="user-profile-picture">
                        <div class="profile-picture-container">
                            <img src="${userData.PhotoURL}" class="profile-picture" alt="profile picture">
                        </div>
                    </span>
                    <span class="user-profile-name">${userData.Name}</span>
                </div>
                <div class="comment-meta">
                    <span class="comment-date">${date}</span>
                </div>
            </div>
            <br>
            <p>${newCommentInputData}</p>
            <div class = "comment-buttons">
                <div class = "reply-button"></div>
                <div class = "special-buttons"></div>
            </div>

            `;
            commentsBox.appendChild(commentBox);
            
            window.location.href = `#${commentRef.id}`;

            const specialButtons = commentBox.querySelector(".special-buttons");

            const deleteButton = document.createElement("span");
            deleteButton.classList.add("lios-action-button", "delete-button");


            deleteButton.innerHTML = //html 
                `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                `;
            deleteButton.addEventListener("click", async () => {
                try {
                    await deleteDoc(doc(db, "posts", postData.uid, "comments", commentRef.id));
                    commentBox.style.display = "none";
                } catch (error) {
                    console.error("Failed to delete comment:", error);
                }
            });
            
            specialButtons.appendChild(deleteButton);

            newCommentInput.value = "";
        });

    } else if (isLoggedIn === false) {
        const newCommentBox = document.createElement("div");
        newCommentBox.classList.add("new-comment-box", "frosted_background", "lios-card");
        newCommentBox.innerHTML = //html
            `<div class = "lios-action-button sign-in-button"><span> Sign In to Comment</span></div>`;


        commentsBox.prepend(newCommentBox);
    } else {
        console.log(`Failed to got login status`);
    };
};
export async function renderComments() {
    await getPostData();
    const comments = await getDocs(collection(db, "posts", postData.uid, "comments"));
    const commentsData = comments.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    commentsData.forEach(comment => {
        const commentBox = document.createElement("div");
        commentBox.classList.add("comment-box", "frosted_background", "lios-card");
        // console.log(comment);
        const date = comment.date.toDate().toLocaleDateString();
        commentBox.innerHTML = //html
            `
            <div id = "${comment.id}" class = "comment-details">
                <div class = "user-info">
                    <span class = "user-profile-picture">
                        <div class = "profile-picture-container">
                            <img src = "${comment.userProfilePicture}" class = "profile-picture" alt = "profile picture">
                        </div>
                    </span>
                    <span class = "user-profile-name">${comment.userName}</span>
                </div>
                <div class = "comment-meta">
                    <span class = "comment-date">${date}</span>
                </div>
            </div>
            <br>
            <p>${comment.comment}</p>
            <div class = "comment-buttons">
                <div class = "reply-button"></div>
                <div class = "special-buttons"></div>
            </div>
            `;
        commentsBox.appendChild(commentBox);


        if (userData) {
            if (comment.userId === userData.uid || userData.role === "owner") {
                const specialButtons = commentBox.querySelector(".special-buttons");

                const deleteButton = document.createElement("span");
                deleteButton.classList.add("lios-action-button", "delete-button");


                deleteButton.innerHTML = //html 
                    `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                `;
                deleteButton.addEventListener("click", async () => {
                    try {
                        await deleteDoc(doc(db, "posts", postData.uid, "comments", comment.id));
                        commentBox.style.display = "none";
                    } catch (error) {
                        console.error("Failed to delete comment:", error);
                    }
                });
            
                specialButtons.appendChild(deleteButton);
            };
        };
    });
}