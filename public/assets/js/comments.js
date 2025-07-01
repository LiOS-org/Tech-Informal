import { db } from '/assets/firebase.js';
import {
  collection, addDoc, query, where, getDocs,
  orderBy, serverTimestamp, updateDoc, doc,
  arrayUnion, arrayRemove, deleteDoc, startAfter, limit,
  writeBatch
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
    dislikes: [],
    pinned: false
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
  snapshot.forEach(doc => {
    const data = doc.data();
    // Add pinned field if it doesn't exist (for backward compatibility)
    if (data.pinned === undefined) {
      data.pinned = false;
    }
    comments.push({ id: doc.id, ref: doc.ref, ...data });
  });

  // Separate pinned and non-pinned comments
  const pinnedComments = comments.filter(c => c.pinned === true);
  const regularComments = comments.filter(c => c.pinned !== true);
  
  // Combine with pinned comments first
  const sortedComments = [...pinnedComments, ...regularComments];

  const topLevel = sortedComments.filter(c => !c.parentId);
  const replies = sortedComments.filter(c => c.parentId);

  return {
    topLevel,
    replies,
    lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === limitCount
  };
}

export async function deleteComment(commentId, currentUser, userRole) {
  try {
    // First, check if this comment has any replies
    const repliesQuery = query(
      collection(db, "comments"),
      where("parentId", "==", commentId)
    );
    
    const repliesSnapshot = await getDocs(repliesQuery);
    
    // If there are replies, we need to handle them differently based on user permissions
    if (repliesSnapshot.size > 0) {
      // Mods and owners can delete any comment and all its replies
      if (userRole === "mod" || userRole === "owner") {
        const batch = writeBatch(db);
        
        // Delete the parent comment
        batch.delete(doc(db, "comments", commentId));
        
        // Delete all replies
        repliesSnapshot.forEach((replyDoc) => {
          batch.delete(replyDoc.ref);
        });
        
        await batch.commit();
        console.log(`Comment ${commentId} and ${repliesSnapshot.size} replies deleted successfully by ${userRole}`);
      } else {
        // Regular users: only delete replies they own, then delete parent
        const batch = writeBatch(db);
        
        // Delete the parent comment
        batch.delete(doc(db, "comments", commentId));
        
        // Only delete replies authored by the current user
        repliesSnapshot.forEach((replyDoc) => {
          const replyData = replyDoc.data();
          if (replyData.author.uid === currentUser.uid) {
            batch.delete(replyDoc.ref);
          }
        });
        
        await batch.commit();
        
        // Count remaining replies (authored by others)
        const remainingReplies = repliesSnapshot.docs.filter(
          doc => doc.data().author.uid !== currentUser.uid
        ).length;
        
        if (remainingReplies > 0) {
          console.log(`Comment ${commentId} deleted. ${remainingReplies} replies by other users remain orphaned.`);
        } else {
          console.log(`Comment ${commentId} and all replies deleted successfully`);
        }
      }
    } else {
      // No replies, just delete the comment
      await deleteDoc(doc(db, "comments", commentId));
      console.log(`Comment ${commentId} deleted successfully (no replies)`);
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error; // Re-throw so the UI can handle it
  }
}

// Pin a comment (only for admin/mod users)
export async function pinComment(commentId, currentUser, userRole) {
  if (userRole !== "owner" && userRole !== "mod") {
    throw new Error("Only admins and moderators can pin comments");
  }
  
  try {
    await updateDoc(doc(db, "comments", commentId), {
      pinned: true
    });
    console.log(`Comment ${commentId} pinned successfully`);
  } catch (error) {
    console.error("Error pinning comment:", error);
    throw error;
  }
}

// Unpin a comment (only for admin/mod users)
export async function unpinComment(commentId, currentUser, userRole) {
  if (userRole !== "owner" && userRole !== "mod") {
    throw new Error("Only admins and moderators can unpin comments");
  }
  
  try {
    await updateDoc(doc(db, "comments", commentId), {
      pinned: false
    });
    console.log(`Comment ${commentId} unpinned successfully`);
  } catch (error) {
    console.error("Error unpinning comment:", error);
    throw error;
  }
}

// Function to clean up orphaned replies (replies whose parent comments no longer exist)
// This is useful for database maintenance
export async function cleanupOrphanedReplies(postId) {
  try {
    // Get all comments for this post
    const allCommentsQuery = query(
      collection(db, "comments"),
      where("postId", "==", postId)
    );
    
    const allCommentsSnapshot = await getDocs(allCommentsQuery);
    const allComments = [];
    allCommentsSnapshot.forEach(doc => allComments.push({ id: doc.id, ref: doc.ref, ...doc.data() }));
    
    // Separate parent comments and replies
    const parentComments = allComments.filter(c => !c.parentId);
    const replies = allComments.filter(c => c.parentId);
    const parentIds = new Set(parentComments.map(p => p.id));
    
    // Find orphaned replies
    const orphanedReplies = replies.filter(r => !parentIds.has(r.parentId));
    
    if (orphanedReplies.length > 0) {
      const batch = writeBatch(db);
      orphanedReplies.forEach(reply => {
        batch.delete(reply.ref);
      });
      
      await batch.commit();
      console.log(`Cleaned up ${orphanedReplies.length} orphaned replies`);
      return orphanedReplies.length;
    }
    
    console.log("No orphaned replies found");
    return 0;
  } catch (error) {
    console.error("Error cleaning up orphaned replies:", error);
    throw error;
  }
}
