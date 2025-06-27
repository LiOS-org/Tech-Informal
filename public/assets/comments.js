import { db } from './firebase.js';
import {
  collection, addDoc, query, where, getDocs,
  orderBy, serverTimestamp, updateDoc, doc,
  arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

// Post a comment or reply
export async function postComment(postId, content, user, parentId = null) {
  await addDoc(collection(db, "comments"), {
    postId,
    content,
    parentId,
    createdAt: serverTimestamp(),
    author: {
      uid: user.uid,
      name: user.displayName,
      photo: user.photoURL
    },
    likes: [],
    dislikes: []
  });
}

// Fetch all comments for a post
export async function fetchComments(postId) {
  const q = query(
    collection(db, "comments"),
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);
  const comments = [];
  snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));

  const topLevel = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  return { topLevel, replies };
}

// Toggle like/dislike
export async function toggleReaction(commentId, userId, type) {
  const ref = doc(db, "comments", commentId);

  if (type === "like") {
    await updateDoc(ref, {
      likes: arrayUnion(userId),
      dislikes: arrayRemove(userId)
    });
  } else {
    await updateDoc(ref, {
      dislikes: arrayUnion(userId),
      likes: arrayRemove(userId)
    });
  }
}