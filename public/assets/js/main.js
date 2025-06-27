import { login, logout, watchUser, loginWith, loginWithEmail, registerWithEmail, getUserRole } from './auth.js';
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
import { postComment, fetchComments, deleteComment } from './comments.js';
import { db } from '../firebase.js';

let currentUser = null;
let currentUserRole = "user";
let userRoleMap = {};
let lastVisibleComment = null;
let hasMoreComments = true;
const postId = window.location.pathname;

async function preloadRoles(comments) {
  const uids = new Set();
  comments.forEach(c => uids.add(c.author.uid));

  const promises = Array.from(uids).map(async uid => {
    if (!userRoleMap[uid]) {
      const docSnap = await getDoc(doc(db, "roles", uid));
      userRoleMap[uid] = docSnap.exists() ? docSnap.data().role : "user";
    }
  });

  await Promise.all(promises);
}

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
  const { topLevel, replies, lastVisible, hasMore } = await fetchComments(postId, 10, isLoadMore ? lastVisibleComment : null);

  // 🔁 Cache roles for all authors in this batch
  await preloadRoles([...topLevel, ...replies]);

  if (!isLoadMore) commentsContainer.innerHTML = "";

  topLevel.forEach(parent => {
    const role = userRoleMap[parent.author.uid];
    const badge = role === "mod" ? `<span class="badge">[mod]</span>` :
                  role === "owner" ? `<span class="badge">[owner]</span>` : "";

    const canDelete = currentUser &&
      (currentUser.uid === parent.author.uid || currentUserRole === "mod" || currentUserRole === "owner");

    const parentEl = document.createElement("div");
    parentEl.className = "comment frosted_background";
    parentEl.innerHTML = `
      <div style="display:flex; gap: 8px; align-items:center;">
        <img src="${parent.author.photo}" width="28" style="border-radius: 100vh;">
        <strong>${parent.author.name}</strong> ${badge}
        ${canDelete ? `<button class="delete-comment-btn button frosted_background" data-id="${parent.id}" style="margin-left:auto;">Delete</button>` : ""}
      </div>
      <p>${parent.content}</p>
      <button class="reply-btn button frosted_background" data-id="${parent.id}">Reply</button>
      <div class="replies" style="margin-left:20px; margin-top:8px; display:none;"></div>
    `;

    if (replies.some(r => r.parentId === parent.id)) {
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = "Show Replies";
      toggleBtn.className = "toggle-replies-btn button frosted_background";
      toggleBtn.dataset.id = parent.id;
      toggleBtn.style.marginTop = "6px";
      parentEl.appendChild(toggleBtn);
    }

    commentsContainer.appendChild(parentEl);

    // Add replies
    const replyContainer = parentEl.querySelector(".replies");
    replies
      .filter(r => r.parentId === parent.id)
      .forEach(reply => {
        const replyRole = userRoleMap[reply.author.uid];
        const replyBadge = replyRole === "mod" ? `<span class="badge">[mod]</span>` :
                           replyRole === "owner" ? `<span class="badge">[owner]</span>` : "";

        const canDeleteReply = currentUser &&
          (currentUser.uid === reply.author.uid || currentUserRole === "mod" || currentUserRole === "owner");

        const replyEl = document.createElement("div");
        replyEl.className = "comment frosted_background";
        replyEl.innerHTML = `
          <div style="display:flex; gap: 8px; align-items:center;">
            <img src="${reply.author.photo}" width="24" style="border-radius: 100vh;">
            <strong>${reply.author.name}</strong> ${replyBadge}
            ${canDeleteReply ? `<button class="delete-comment-btn button frosted_background" data-id="${reply.id}" style="margin-left:auto;">Delete</button>` : ""}
          </div>
          <p>${reply.content}</p>
        `;
        replyContainer.appendChild(replyEl);
      });
  });

  // Delete button logic
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

  // Toggle replies button logic
  document.querySelectorAll(".toggle-replies-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const parentId = btn.getAttribute("data-id");
      const repliesContainer = btn.parentElement.querySelector(".replies");
      const isVisible = repliesContainer.style.display === "block";

      repliesContainer.style.display = isVisible ? "none" : "block";
      btn.textContent = isVisible ? "Show Replies" : "Hide Replies";
    });
  });

  // Reply button logic
  document.querySelectorAll(".reply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const parentId = btn.getAttribute("data-id");
      const container = btn.parentElement.querySelector(".replies");

      if (container.querySelector("textarea")) return; // prevent multiple boxes

      const input = document.createElement("textarea");
      input.placeholder = "Write a reply...";
      input.style = "width:100%; margin-top:6px; padding:6px;";
      const submit = document.createElement("button");
      submit.textContent = "Post Reply";
      submit.className = "button frosted_background";
      submit.style = "margin-top:6px;";

      container.appendChild(input);
      container.appendChild(submit);

      submit.addEventListener("click", async () => {
        const content = input.value.trim();
        if (!content) return;
        await postComment(postId, content, currentUser, parentId);
        renderComments();
      });
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