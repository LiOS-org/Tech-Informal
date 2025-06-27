const postId = window.location.pathname;
const likeBtn = document.querySelector("#like-btn");
const dislikeBtn = document.querySelector("#dislike-btn");
const likeCount = document.querySelector("#like-count");
const dislikeCount = document.querySelector("#dislike-count");

async function updateReactionUI() {
  if (!currentUser || !likeBtn || !dislikeBtn) return;
  const reaction = await getReaction(postId, currentUser.uid);
  likeBtn.classList.toggle("selected", reaction === "like");
  dislikeBtn.classList.toggle("selected", reaction === "dislike");
  updateCountsUI();
}

async function updateCountsUI() {
  const { likes, dislikes } = await getReactionCounts(postId);
  likeCount.textContent = likes;
  dislikeCount.textContent = dislikes;
}

if (likeBtn && dislikeBtn) {
  likeBtn.addEventListener("click", async () => {
    if (!currentUser) return alert("Login required!");
    const current = await getReaction(postId, currentUser.uid);
    if (current === "like") {
      await removeReaction(postId, currentUser.uid);
    } else {
      await setReaction(postId, currentUser.uid, "like");
    }
    updateReactionUI();
  });

  dislikeBtn.addEventListener("click", async () => {
    if (!currentUser) return alert("Login required!");
    const current = await getReaction(postId, currentUser.uid);
    if (current === "dislike") {
      await removeReaction(postId, currentUser.uid);
    } else {
      await setReaction(postId, currentUser.uid, "dislike");
    }
    updateReactionUI();
  });
}

watchUser(user => {
  currentUser = user;
  if (likeBtn && dislikeBtn) updateReactionUI();
});