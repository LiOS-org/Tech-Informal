import { db } from '../firebase.js';
import {
  collection, addDoc, query, where, getDocs,
  orderBy, serverTimestamp, updateDoc, doc,
  arrayUnion, arrayRemove, deleteDoc, startAfter, limit
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

// Fetch comments with pagination
export async function fetchComments(postId, limitCount = 10, startAfterDoc = null) {
  let baseQuery = query(
    collection(db, "comments"),
    where("postId", "==", postId),
    orderBy("createdAt", "asc"),
    limit(limitCount)
  );

  if (startAfterDoc) {
    baseQuery = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc"),
      startAfter(startAfterDoc),
      limit(limitCount)
    );
  }

  const snapshot = await getDocs(baseQuery);
  const comments = [];
  snapshot.forEach(doc => comments.push({ id: doc.id, ref: doc.ref, ...doc.data() }));

  const topLevel = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  return {
    topLevel,
    replies,
    lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === limitCount
  };
}

export async function deleteComment(commentId) {
  await deleteDoc(doc(db, "comments", commentId));
}