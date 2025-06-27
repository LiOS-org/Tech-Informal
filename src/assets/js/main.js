
import { login, logout, watchUser } from './auth.js';
import { postComment, fetchComments } from './comments.js';

const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const commentInput = document.querySelector("#commentInput");
const submitComment = document.querySelector("#submitComment");
const commentForm = document.querySelector("#comment-form");
const userInfo = document.querySelector("#user-info");
const userName = document.querySelector("#user-name");
const userPhoto = document.querySelector("#user-photo");
const commentsContainer = document.querySelector("#comments-container");

let currentUser = null;
const postId = window.location.pathname; // use URL as post ID

// Auth status
watchUser(user => {
  currentUser = user;
  if (user) {
    loginBtn.style.display = "none";
    commentForm.style.display = "block";
    userInfo.style.display = "flex";
    userName.textContent = user.displayName;
    userPhoto.src = user.photoURL;
  } else {
    loginBtn.style.display = "inline-block";
    commentForm.style.display = "none";
    userInfo.style.display = "none";
  }
});

// Login in sidebar
const sidebarLogin = document.getElementById("sidebar-login");
const sidebarLogout = document.getElementById("sidebar-logout");

watchUser(user => {
  currentUser = user;
  const isLoggedIn = !!user;

  // Comment visibility
  loginBtn.style.display = isLoggedIn ? "none" : "inline-block";
  commentForm.style.display = isLoggedIn ? "block" : "none";
  userInfo.style.display = isLoggedIn ? "flex" : "none";

  // Sidebar button toggle
  sidebarLogin.style.display = isLoggedIn ? "none" : "block";
  sidebarLogout.style.display = isLoggedIn ? "block" : "none";

  // Show user name and photo
  if (isLoggedIn) {
    userName.textContent = user.displayName;
    userPhoto.src = user.photoURL;
  }
});

sidebarLogout.addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

// Events
// loginBtn.addEventListener("click", login);, commented out because not uusing it but works
logoutBtn.addEventListener("click", logout);
submitComment.addEventListener("click", async () => {
  const content = commentInput.value.trim();
  if (!content) return;
  await postComment(postId, content, currentUser);
  commentInput.value = "";
  renderComments();
});

// Render Comments
async function renderComments() {
  const { topLevel, replies } = await fetchComments(postId);

  commentsContainer.innerHTML = "";

  topLevel.forEach(comment => {
    const el = document.createElement("div");
    el.className = "comment frosted_background";
    el.innerHTML = `
      <div style="display:flex; gap: 8px; align-items:center;">
        <img src="${comment.author.photo}" width="28" style="border-radius: 100vh;">
        <strong>${comment.author.name}</strong>
      </div>
      <p>${comment.content}</p>
    `;
    commentsContainer.appendChild(el);
  });
}

renderComments();
import { loginWith } from './auth.js';
// Google
const loginGoogleBtn = document.getElementById("login-google");
if (loginGoogleBtn) {
  loginGoogleBtn.addEventListener("click", async () => {
    try {
      await loginWith("google");
      window.location.hash = ""; // Close login window
    } catch (e) {
      console.error("Google login failed:", e);
      alert("Google login failed. Please try again.");
    }
  });
}
// Github
document.getElementById("login-github")?.addEventListener("click", async () => {
  try {
    await loginWith("github");
    window.location.hash = "";
  } catch (err) {
    // Ignore harmless errors like popup closed or canceled request
    if (
      err.code === "auth/popup-closed-by-user" ||
      err.code === "auth/cancelled-popup-request"
    ) return;

    // Check if user is already signed in despite the error
    if (currentUser) {
      console.warn("GitHub login threw error, but user is signed in:", currentUser);
      window.location.hash = "";
      return;
    }

    console.error("GitHub login failed:", err);
    alert("GitHub login failed. Please try again.");
  }
});
// Email
import { loginWithEmail, registerWithEmail } from './auth.js';

document.getElementById("login-email-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) return alert("Enter both email and password");

  try {
    await loginWithEmail(email, password);
    window.location.hash = "";
  } catch (err) {
    console.error(err);
    alert("Login failed: " + err.message);
  }
});

document.getElementById("register-email-btn").addEventListener("click", async () => {
  const name = document.getElementById("login-name").value.trim();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!name || !email || !password) {
    return alert("Please enter name, email, and password");
  }

  try {
    await registerWithEmail(email, password, name);
    window.location.hash = "";
  } catch (err) {
    console.error(err);
    alert("Registration failed: " + err.message);
  }
});
