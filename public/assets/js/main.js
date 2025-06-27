import { login, logout, watchUser, loginWith, loginWithEmail, registerWithEmail, getUserRole } from './auth.js';
import { postComment, fetchComments, deleteComment } from './comments.js';

let currentUser = null;
let currentUserRole = "user";
let lastVisibleComment = null;
let hasMoreComments = true;
const postId = window.location.pathname;

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("#loginBtn");
  const logoutBtn = document.querySelector("#logoutBtn");
  const commentInput = document.querySelector("#commentInput");
  const submitComment = document.querySelector("#submitComment");
  const commentForm = document.querySelector("#comment-form");
  const userInfo = document.querySelector("#user-info");
  const userName = document.querySelector("#user-name");
  const userPhoto = document.querySelector("#user-photo");
  const commentsContainer = document.querySelector("#comments-container");
  const sidebarLogin = document.getElementById("sidebar-login");
  const sidebarLogout = document.getElementById("sidebar-logout");
  const showMoreBtn = document.getElementById("showMoreBtn");

  watchUser(async (user) => {
    currentUser = user;

    if (user) {
      currentUserRole = await getUserRole(user.uid);
      loginBtn.style.display = "none";
      commentForm.style.display = "block";
      userInfo.style.display = "flex";
      userName.textContent = user.displayName;
      userPhoto.src = user.photoURL;
      sidebarLogin.style.display = "none";
      sidebarLogout.style.display = "block";
    } else {
      currentUserRole = "user";
      loginBtn.style.display = "inline-block";
      commentForm.style.display = "none";
      userInfo.style.display = "none";
      sidebarLogin.style.display = "block";
      sidebarLogout.style.display = "none";
    }

    // Reset pagination on auth change
    lastVisibleComment = null;
    hasMoreComments = true;
    renderComments();
  });

  logoutBtn.addEventListener("click", logout);
  sidebarLogout.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  submitComment.addEventListener("click", async () => {
    const content = commentInput.value.trim();
    if (!content) return;
    await postComment(postId, content, currentUser);
    commentInput.value = "";
    lastVisibleComment = null;
    hasMoreComments = true;
    renderComments();
  });

  showMoreBtn.addEventListener("click", () => {
    if (hasMoreComments) {
      renderComments(true);
    }
  });

  async function renderComments(isLoadMore = false) {
    const { topLevel, lastVisible, hasMore } = await fetchComments(postId, 10, isLoadMore ? lastVisibleComment : null);

    if (!isLoadMore) commentsContainer.innerHTML = "";

    topLevel.forEach(comment => {
      const canDelete = currentUser &&
        (
          currentUser.uid === comment.author.uid ||
          currentUserRole === "mod" ||
          currentUserRole === "owner"
        );

      const el = document.createElement("div");
      el.className = "comment frosted_background";
      el.innerHTML = `
        <div style="display:flex; gap: 8px; align-items:center;">
          <img src="${comment.author.photo}" width="28" style="border-radius: 100vh;">
          <strong>${comment.author.name}</strong>
          ${canDelete
            ? `<button class="delete-comment-btn button frosted_background" data-id="${comment.id}" style="margin-left:auto;">Delete</button>`
            : ""
          }
        </div>
        <p>${comment.content}</p>
      `;
      commentsContainer.appendChild(el);
    });

    document.querySelectorAll(".delete-comment-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const commentId = btn.getAttribute("data-id");
        if (confirm("Delete this comment?")) {
          await deleteComment(commentId);
          lastVisibleComment = null;
          hasMoreComments = true;
          renderComments();
        }
      });
    });

    lastVisibleComment = lastVisible;
    hasMoreComments = hasMore;
    showMoreBtn.style.display = hasMore ? "block" : "none";
  }

  // Google login
  const loginGoogleBtn = document.getElementById("login-google");
  if (loginGoogleBtn) {
    loginGoogleBtn.addEventListener("click", async () => {
      try {
        await loginWith("google");
        window.location.hash = "";
      } catch (e) {
        console.error("Google login failed:", e);
        alert("Google login failed. Please try again.");
      }
    });
  }

  // GitHub login
  const loginGitHubBtn = document.getElementById("login-github");
  if (loginGitHubBtn) {
    loginGitHubBtn.addEventListener("click", async () => {
      try {
        await loginWith("github");
        window.location.hash = "";
      } catch (err) {
        if (
          err.code === "auth/popup-closed-by-user" ||
          err.code === "auth/cancelled-popup-request"
        ) return;

        if (currentUser) {
          console.warn("GitHub login threw error, but user is signed in:", currentUser);
          window.location.hash = "";
          return;
        }

        console.error("GitHub login failed:", err);
        alert("GitHub login failed. Please try again.");
      }
    });
  }

  // Email login
  document.getElementById("login-email-btn")?.addEventListener("click", async () => {
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

  // Email register
  document.getElementById("register-email-btn")?.addEventListener("click", async () => {
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
});