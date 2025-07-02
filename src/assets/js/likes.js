import { db } from '/assets/firebase.js';
import { watchUser } from '/assets/js/auth.js';
import {
  collection, doc, getDoc, setDoc, updateDoc, deleteDoc, 
  query, where, getDocs, increment
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

let currentUser = null;
let likeBtn, dislikeBtn, likeCount, dislikeCount;
const postId = window.location.pathname;

// Wait for DOM to load before initializing
document.addEventListener('DOMContentLoaded', () => {
  likeBtn = document.querySelector("#like-btn");
  dislikeBtn = document.querySelector("#dislike-btn");
  likeCount = document.querySelector("#like-count");
  dislikeCount = document.querySelector("#dislike-count");
  
  console.log('Likes.js loaded, elements found:', {
    likeBtn: !!likeBtn,
    dislikeBtn: !!dislikeBtn,
    likeCount: !!likeCount,
    dislikeCount: !!dislikeCount
  });
  
  initializeLikeSystem();
});

// Get current user's reaction for a post
async function getReaction(postId, userId) {
  try {
    const reactionDoc = await getDoc(doc(db, "reactions", `${postId}_${userId}`));
    return reactionDoc.exists() ? reactionDoc.data().type : null;
  } catch (error) {
    console.error("Error getting reaction:", error);
    return null;
  }
}

// Set a reaction (like or dislike)
async function setReaction(postId, userId, reactionType) {
  try {
    const reactionDocId = `${postId}_${userId}`;
    const currentReaction = await getReaction(postId, userId);
    
    // If user already has a reaction, remove the old count first
    if (currentReaction) {
      await updatePageMetadata(postId, currentReaction, -1);
    }
    
    // Set the new reaction
    await setDoc(doc(db, "reactions", reactionDocId), {
      postId,
      userId,
      type: reactionType,
      createdAt: new Date()
    });
    
    // Update the page metadata count
    await updatePageMetadata(postId, reactionType, 1);
    
  } catch (error) {
    console.error("Error setting reaction:", error);
    throw error;
  }
}

// Remove a reaction
async function removeReaction(postId, userId) {
  try {
    const reactionDocId = `${postId}_${userId}`;
    const currentReaction = await getReaction(postId, userId);
    
    if (currentReaction) {
      await deleteDoc(doc(db, "reactions", reactionDocId));
      await updatePageMetadata(postId, currentReaction, -1);
    }
  } catch (error) {
    console.error("Error removing reaction:", error);
    throw error;
  }
}

// Get reaction counts for a post
async function getReactionCounts(postId) {
  try {
    // Get from page metadata first
    const pageDoc = await getPageMetadata(postId);
    if (pageDoc) {
      return {
        likes: pageDoc.likes || 0,
        dislikes: pageDoc.dislikes || 0
      };
    }
    
    // Fallback: count reactions directly (slower)
    const likesQuery = query(
      collection(db, "reactions"),
      where("postId", "==", postId),
      where("type", "==", "like")
    );
    const dislikesQuery = query(
      collection(db, "reactions"),
      where("postId", "==", postId),
      where("type", "==", "dislike")
    );
    
    const [likesSnapshot, dislikesSnapshot] = await Promise.all([
      getDocs(likesQuery),
      getDocs(dislikesQuery)
    ]);
    
    return {
      likes: likesSnapshot.size,
      dislikes: dislikesSnapshot.size
    };
  } catch (error) {
    console.error("Error getting reaction counts:", error);
    return { likes: 0, dislikes: 0 };
  }
}

// Helper function to get page metadata
async function getPageMetadata(postId) {
  try {
    // Try to get using the global UID if available
    if (window.globalDocId) {
      const docRef = doc(db, "pageMeta", window.globalDocId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    }
    
    // Fallback: query by path
    const pageQuery = query(
      collection(db, "pageMeta"),
      where("path", "==", postId)
    );
    const snapshot = await getDocs(pageQuery);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
    
    return null;
  } catch (error) {
    console.error("Error getting page metadata:", error);
    return null;
  }
}

// Helper function to update page metadata counts
async function updatePageMetadata(postId, reactionType, increment_value) {
  try {
    console.log('Updating page metadata:', {
      postId,
      reactionType,
      increment_value,
      globalDocId: window.globalDocId
    });
    
    if (window.globalDocId) {
      const docRef = doc(db, "pageMeta", window.globalDocId);
      const field = reactionType === "like" ? "likes" : "dislikes";
      
      // First check if document exists
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          [field]: increment(increment_value)
        });
        console.log(`Successfully updated ${field} by ${increment_value}`);
      } else {
        console.error('Page metadata document not found:', window.globalDocId);
        // Don't create a new document, this should be handled by main.js
      }
    } else {
      console.error('No globalDocId available for page metadata update');
    }
  } catch (error) {
    console.error("Error updating page metadata:", error);
  }
}

async function updateReactionUI() {
  if (!currentUser || !likeBtn || !dislikeBtn) return;
  const reaction = await getReaction(postId, currentUser.uid);
  likeBtn.classList.toggle("selected", reaction === "like");
  dislikeBtn.classList.toggle("selected", reaction === "dislike");
  updateCountsUI();
}

async function updateCountsUI() {
  const { likes, dislikes } = await getReactionCounts(postId);
  if (likeCount) likeCount.textContent = likes;
  if (dislikeCount) dislikeCount.textContent = dislikes;
}

async function initializeLikeSystem() {
  console.log('Initializing like system...');
  
  // Only proceed if we have the necessary elements
  if (!likeBtn || !dislikeBtn || !likeCount || !dislikeCount) {
    console.log('Like/dislike elements not found on this page');
    return;
  }
  
  // Wait for page metadata to be initialized
  if (window.initPageMetadata) {
    try {
      await window.initPageMetadata();
      console.log('Page metadata initialized for like system');
    } catch (error) {
      console.error('Failed to initialize page metadata for like system:', error);
    }
  } else {
    console.warn('initPageMetadata not available, waiting for it...');
    // Poll for the function to become available
    let attempts = 0;
    while (!window.initPageMetadata && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (window.initPageMetadata) {
      try {
        await window.initPageMetadata();
        console.log('Page metadata initialized for like system (after waiting)');
      } catch (error) {
        console.error('Failed to initialize page metadata for like system (after waiting):', error);
      }
    } else {
      console.error('initPageMetadata still not available after waiting');
    }
  }
  
  // Add event listeners
  likeBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log('Like button clicked', { currentUser });
    
    if (!currentUser) {
      alert("Please log in to like this post!");
      return;
    }
    
    try {
      likeBtn.classList.add('updating');
      const current = await getReaction(postId, currentUser.uid);
      
      if (current === "like") {
        await removeReaction(postId, currentUser.uid);
        console.log('Removed like');
      } else {
        await setReaction(postId, currentUser.uid, "like");
        console.log('Added like');
      }
      
      await updateReactionUI();
    } catch (error) {
      console.error('Error handling like:', error);
      alert('Failed to update like. Please try again.');
    } finally {
      likeBtn.classList.remove('updating');
    }
  });

  dislikeBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log('Dislike button clicked', { currentUser });
    
    if (!currentUser) {
      alert("Please log in to dislike this post!");
      return;
    }
    
    try {
      dislikeBtn.classList.add('updating');
      const current = await getReaction(postId, currentUser.uid);
      
      if (current === "dislike") {
        await removeReaction(postId, currentUser.uid);
        console.log('Removed dislike');
      } else {
        await setReaction(postId, currentUser.uid, "dislike");
        console.log('Added dislike');
      }
      
      await updateReactionUI();
    } catch (error) {
      console.error('Error handling dislike:', error);
      alert('Failed to update dislike. Please try again.');
    } finally {
      dislikeBtn.classList.remove('updating');
    }
  });
  
  // Watch for authentication changes
  watchUser(async (user) => {
    console.log('User auth changed in likes.js:', user?.displayName || 'No user');
    currentUser = user;
    
    // Update button states based on auth
    if (likeBtn && dislikeBtn) {
      likeBtn.disabled = !user;
      dislikeBtn.disabled = !user;
      
      if (user) {
        await updateReactionUI();
      } else {
        // Reset UI for logged out user
        likeBtn.classList.remove('selected');
        dislikeBtn.classList.remove('selected');
        await updateCountsUI();
      }
    }
  });
  
  // Initial load of counts
  updateCountsUI();
  
  console.log('Like system initialized successfully');
}
