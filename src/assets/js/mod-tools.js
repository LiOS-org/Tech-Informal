import { watchUser, getUserRole } from './auth.js';
import { db } from '/assets/firebase.js';
import { 
    doc, 
    updateDoc, 
    collection, 
    getDocs, 
    query, 
    where,
    arrayRemove,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

let currentUser = null;
let currentUserRole = "user";
let allPosts = [];

// Authentication and role check
function checkAuthentication() {
    watchUser(async (user) => {
        currentUser = user;
        
        if (user) {
            currentUserRole = await getUserRole(user.uid);
            
            if (currentUserRole === "mod" || currentUserRole === "owner") {
                document.getElementById('auth-check').style.display = 'none';
                document.getElementById('mod-tools-content').style.display = 'block';
                await initializeModTools();
            } else {
                document.getElementById('auth-check').style.display = 'block';
                document.getElementById('mod-tools-content').style.display = 'none';
            }
        } else {
            document.getElementById('auth-check').style.display = 'block';
            document.getElementById('mod-tools-content').style.display = 'none';
        }
    });
}

// Initialize mod tools
async function initializeModTools() {
    try {
        await loadAllPosts();
        await loadFeaturedContent();
        updateStatistics();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing mod tools:', error);
        showError('Failed to initialize mod tools');
    }
}

// Load all posts from Firestore
async function loadAllPosts() {
    try {
        const postsQuery = query(collection(db, "posts"));
        const querySnapshot = await getDocs(postsQuery);
        
        allPosts = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            allPosts.push({
                id: doc.id,
                ...data
            });
        });
        
        console.log(`Loaded ${allPosts.length} posts from Firestore`);
    } catch (error) {
        console.error('Error loading posts:', error);
        // For now, we'll work with static content only
        allPosts = [];
    }
}

// Load featured content
async function loadFeaturedContent() {
    const featuredList = document.getElementById('featured-list');
    
    try {
        // Get featured posts from Firestore
        const featuredQuery = query(
            collection(db, "posts"),
            where("featured", "==", true)
        );
        const querySnapshot = await getDocs(featuredQuery);
        
        const featuredPosts = [];
        querySnapshot.forEach((doc) => {
            featuredPosts.push({
                id: doc.id,
                ...doc.data()
            });
        });

        if (featuredPosts.length === 0) {
            featuredList.innerHTML = `
                <div class="no-content" style="text-align: center; padding: 2rem; opacity: 0.7;">
                    <p>📝 No featured content found.</p>
                    <p>Add some content to the featured collection from the <a href="/mod-tools/all-contents/">All Contents</a> page.</p>
                </div>
            `;
            return;
        }

        const featuredHTML = featuredPosts.map(post => `
            <div class="featured-item" data-post-id="${post.id}">
                <div class="featured-item-content">
                    <div class="featured-item-title">
                        <a href="${post.url || '#'}" target="_blank">${post.title || 'Untitled'}</a>
                    </div>
                    <div class="featured-item-meta">
                        <span>Type: ${post.type || 'Unknown'}</span>
                        <span>Date: ${post.date ? new Date(post.date).toLocaleDateString() : 'No date'}</span>
                        <span>Author: ${post.author || 'Unknown'}</span>
                    </div>
                </div>
                <div class="featured-item-actions">
                    <button class="remove-featured-btn" onclick="removeFeatured('${post.id}')">
                        ❌ Remove from Featured
                    </button>
                </div>
            </div>
        `).join('');

        featuredList.innerHTML = featuredHTML;
        
    } catch (error) {
        console.error('Error loading featured content:', error);
        featuredList.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 2rem; color: #dc3545;">
                <p>❌ Error loading featured content</p>
                <p style="font-size: 0.9rem; opacity: 0.8;">${error.message}</p>
            </div>
        `;
    }
}

// Remove content from featured
window.removeFeatured = async function(postId) {
    if (!confirm('Are you sure you want to remove this content from featured?')) {
        return;
    }

    try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
            featured: false
        });
        
        showSuccess('Content removed from featured successfully');
        await loadFeaturedContent();
        updateStatistics();
        
    } catch (error) {
        console.error('Error removing from featured:', error);
        showError('Failed to remove content from featured');
    }
};

// Update statistics
function updateStatistics() {
    try {
        const featuredPosts = allPosts.filter(post => post.featured === true);
        const blogPosts = allPosts.filter(post => post.type === 'blog');
        const articlePosts = allPosts.filter(post => post.type === 'article');
        
        document.getElementById('total-posts').textContent = allPosts.length;
        document.getElementById('featured-count').textContent = featuredPosts.length;
        document.getElementById('blog-count').textContent = blogPosts.length;
        document.getElementById('article-count').textContent = articlePosts.length;
        
    } catch (error) {
        console.error('Error updating statistics:', error);
        // Set default values
        document.getElementById('total-posts').textContent = '0';
        document.getElementById('featured-count').textContent = '0';
        document.getElementById('blog-count').textContent = '0';
        document.getElementById('article-count').textContent = '0';
    }
}

// Setup event listeners
function setupEventListeners() {
    const refreshBtn = document.getElementById('refresh-featured');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await loadAllPosts();
            await loadFeaturedContent();
            updateStatistics();
            showSuccess('Featured content refreshed');
        });
    }
    
    const forceSyncBtn = document.getElementById('force-sync-btn');
    if (forceSyncBtn) {
        forceSyncBtn.addEventListener('click', async () => {
            if (!confirm('🔄 This will force sync all content and update existing posts with latest metadata. Continue?')) {
                return;
            }
            
            // Disable button and show loading state
            forceSyncBtn.disabled = true;
            forceSyncBtn.textContent = '⏳ Syncing...';
            
            try {
                // Call the force sync function from the sync script
                if (window.forceSyncAllContent) {
                    const result = await window.forceSyncAllContent();
                    
                    if (result) {
                        showSuccess(`Sync completed! Added: ${result.addedCount}, Updated: ${result.updatedCount}`);
                        
                        // Refresh the data
                        await loadAllPosts();
                        await loadFeaturedContent();
                        updateStatistics();
                    } else {
                        showError('Sync completed but no results returned');
                    }
                } else {
                    showError('Force sync function not available. Please refresh the page.');
                }
            } catch (error) {
                console.error('Error during force sync:', error);
                showError('Force sync failed. Check console for details.');
            } finally {
                // Re-enable button
                forceSyncBtn.disabled = false;
                forceSyncBtn.textContent = '🔄 Force Sync All Content';
            }
        });
    }
}

// Utility functions
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #28a745;' : 
          type === 'error' ? 'background: #dc3545;' : 
          'background: #007bff;'}
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
});
