import  app  from "../../firebase.js";
import { isLoggedIn, userData } from "./authentication.js";
import { getFirestore, doc, getDoc,addDoc,collection,setDoc,getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { postData } from "./view.js";

const db = getFirestore(app);

const commentsBox = document.querySelector("#Comments");

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
            newCommentInput.style.height = "auto"; // reset height
            newCommentInput.style.height = newCommentInput.scrollHeight + "px"; // set to content height
        });

        commentSubmitButton.addEventListener("click", async () => {
            let newCommentInputData = newCommentInput.value;
            const currentDate=  new Date();
            console.log(newCommentInputData);
            await addDoc(collection(db, "posts", postData.uid, "comments"), {
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
            <div class="comment-details">
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
            `;
            commentsBox.appendChild(commentBox);

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
    const comments = await getDocs(collection(db, "posts", postData.uid, "comments"));
    const commentsData = comments.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    commentsData.forEach(comment => {
        const commentBox = document.createElement("div");
        commentBox.classList.add("comment-box", "frosted_background", "lios-card");
        console.log(comment);
        const date = comment.date.toDate().toLocaleDateString();
        commentBox.innerHTML = //html
            `
            <div class = "comment-details">
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
            `;
        commentsBox.appendChild(commentBox);
    });
}