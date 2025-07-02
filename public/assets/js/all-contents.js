import { watchUser, getUserRole } from './auth.js';
import { db } from '/assets/firebase.js';
import { 
    doc, 
    updateDoc, 
    collection, 
    getDocs, 
    query, 
    where,
    setDoc,
    addDoc
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

let currentUser = null;
let currentUserRole = "user";
let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
const postsPerPage = 10;

// Authentication and role check
function checkAuthentication() {
    watchUser(async (user) => {
        currentUser = user;
        
        if (user) {
            currentUserRole = await getUserRole(user.uid);
            
            if (currentUserRole === "mod" || currentUserRole === "owner") {
                document.getElementById('auth-check').style.display = 'none';
                document.getElementById('all-contents-content').style.display = 'block';
                await initializeAllContents();
            } else {
                document.getElementById('auth-check').style.display = 'block';
                document.getElementById('all-contents-content').style.display = 'none';
            }
        } else {
            document.getElementById('auth-check').style.display = 'block';
            document.getElementById('all-contents-content').style.display = 'none';
        }
    });
}

// Initialize all contents page
async function initializeAllContents() {
    try {
        await loadAllContent();
        await syncStaticContentToFirestore();
        setupEventListeners();
        applyFiltersAndRender();
    } catch (error) {
        console.error('Error initializing all contents:', error);
        showError('Failed to initialize content management');
    }
}

// Load all content from Firestore and sync with static content
async function loadAllContent() {
    try {
        // First, get content from Firestore
        const postsQuery = query(collection(db, "posts"));
        const querySnapshot = await getDocs(postsQuery);
        
        const firestorePosts = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            firestorePosts.push({
                id: doc.id,
                ...data
            });
        });

        // If Firestore is empty, we'll populate it with static content
        if (firestorePosts.length === 0) {
            console.log('No posts found in Firestore. Consider syncing static content.');
        }

        allPosts = firestorePosts;
        console.log(`Loaded ${allPosts.length} posts from Firestore`);
        
    } catch (error) {
        console.error('Error loading content:', error);
        allPosts = [];
    }
}

// Sync static content to Firestore (to be called manually or on first load)
async function syncStaticContentToFirestore() {
    try {
        // This is a placeholder for syncing your 11ty static content
        // You would implement this based on your needs
        
        // Example of how you might add a post manually:
        // const examplePost = {
        //     title: "Example Post",
        //     description: "Example description",
        //     url: "/blog/example-post/",
        //     type: "blog",
        //     author: "Author Name",
        //     date: new Date().toISOString(),
        //     featured: false,
        //     tags: ["post", "blog"]
        // };
        
        // await addDoc(collection(db, "posts"), examplePost);
        
    } catch (error) {
        console.error('Error syncing static content:', error);
    }
}

// Apply filters and render content
function applyFiltersAndRender() {
    const searchTerm = document.getElementById('content-search').value.toLowerCase();
    const typeFilter = document.getElementById('type-filter').value;
    const featuredFilter = document.getElementById('featured-filter').value;

    filteredPosts = allPosts.filter(post => {
        // Search filter
        const matchesSearch = !searchTerm || 
            (post.title && post.title.toLowerCase().includes(searchTerm)) ||
            (post.description && post.description.toLowerCase().includes(searchTerm));
        
        // Type filter
        const matchesType = !typeFilter || (post.type && post.type.includes(typeFilter));
        
        // Featured filter
        const matchesFeatured = !featuredFilter || 
            (featuredFilter === 'featured' && post.featured === true) ||
            (featuredFilter === 'not-featured' && post.featured !== true);
        
        return matchesSearch && matchesType && matchesFeatured;
    });

    currentPage = 1;
    renderContent();
    updateStats();
    updatePagination();
}

// Render content list
function renderContent() {
    const contentList = document.getElementById('content-list');
    
    if (filteredPosts.length === 0) {
        contentList.innerHTML = `
            <div class="no-content" style="text-align: center; padding: 3rem; opacity: 0.7;">
                <h3>📝 No content found</h3>
                <p>Try adjusting your search or filters, or check if content needs to be synced to Firestore.</p>
                <button onclick="syncManualContent()" class="button frosted_background" style="margin-top: 1rem;">
                    🔄 Sync Static Content
                </button>
            </div>
        `;
        return;
    }

    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);

    const contentHTML = postsToShow.map(post => {
        const isFeatured = post.featured === true;
        const featuredClass = isFeatured ? 'featured' : '';
        const featuredBadge = isFeatured ? '<span class="featured-badge">✨ Featured</span>' : '';
        
        return `
            <div class="content-item ${featuredClass}" data-post-id="${post.id}">
                <div class="content-item-content">
                    <div class="content-item-title">
                        <a href="${post.url || '#'}" target="_blank">${post.title || 'Untitled'}</a>
                        ${featuredBadge}
                    </div>
                    <div class="content-item-meta">
                        <span>Type: ${post.type || 'Unknown'}</span>
                        <span>Date: ${post.date ? new Date(post.date).toLocaleDateString() : 'No date'}</span>
                        <span>Author: ${post.author || 'Unknown'}</span>
                        ${post.tags ? `<span>Tags: ${Array.isArray(post.tags) ? post.tags.join(', ') : post.tags}</span>` : ''}
                    </div>
                    ${post.description ? `<div class="content-item-description" style="margin-top: 0.5rem; font-size: 0.9rem; opacity: 0.8;">${post.description}</div>` : ''}
                </div>
                <div class="content-item-actions">
                    ${isFeatured ? 
                        `<button class="remove-featured-btn" onclick="toggleFeatured('${post.id}', false)">
                            ❌ Remove Featured
                        </button>` :
                        `<button class="add-featured-btn" onclick="toggleFeatured('${post.id}', true)">
                            ✨ Add to Featured
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');

    contentList.innerHTML = contentHTML;
}

// Toggle featured status
window.toggleFeatured = async function(postId, makeFeatured) {
    const action = makeFeatured ? 'add to' : 'remove from';
    
    if (!confirm(`Are you sure you want to ${action} featured collection?`)) {
        return;
    }

    try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
            featured: makeFeatured
        });
        
        // Update local data
        const postIndex = allPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            allPosts[postIndex].featured = makeFeatured;
        }
        
        showSuccess(`Content ${makeFeatured ? 'added to' : 'removed from'} featured successfully`);
        applyFiltersAndRender();
        
    } catch (error) {
        console.error('Error updating featured status:', error);
        showError(`Failed to ${action} featured collection`);
    }
};

// Manual sync function (for demo purposes)
window.syncManualContent = async function() {
    try {
        // Example static content - replace with your actual content structure
        const samplePosts = [
            {
                title: "What is AI? its functioning & misuses.",
                description: "AI is a program with capabilities such as language understanding, image recognition, and self improves itself. It lacks consciousness.",
                url: "/blog/2025-06-05-what-is-ai-its-functioning-misuses/",
                type: "blog",
                author: "MD Saifullah",
                date: "2024-04-10T00:00:00.000Z",
                featured: true,
                tags: ["post", "featured", "ai"]
            }
            // Add more posts as needed
        ];

        for (const post of samplePosts) {
            // Check if post already exists
            const existingQuery = query(
                collection(db, "posts"),
                where("url", "==", post.url)
            );
            const existingDocs = await getDocs(existingQuery);
            
            if (existingDocs.empty) {
                await addDoc(collection(db, "posts"), post);
                console.log(`Added post: ${post.title}`);
            }
        }

        showSuccess('Static content synced successfully');
        await loadAllContent();
        applyFiltersAndRender();
        
    } catch (error) {
        console.error('Error syncing content:', error);
        showError('Failed to sync static content');
    }
};

// Update statistics
function updateStats() {
    const totalVisible = filteredPosts.length;
    const featuredVisible = filteredPosts.filter(post => post.featured === true).length;
    const notFeaturedVisible = totalVisible - featuredVisible;

    document.getElementById('total-visible').textContent = totalVisible;
    document.getElementById('featured-visible').textContent = featuredVisible;
    document.getElementById('not-featured-visible').textContent = notFeaturedVisible;
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const paginationDiv = document.getElementById('pagination');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    if (totalPages <= 1) {
        paginationDiv.style.display = 'none';
        return;
    }

    paginationDiv.style.display = 'block';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('content-search');
    searchInput.addEventListener('input', debounce(applyFiltersAndRender, 300));

    // Filter selects
    document.getElementById('type-filter').addEventListener('change', applyFiltersAndRender);
    document.getElementById('featured-filter').addEventListener('change', applyFiltersAndRender);

    // Clear filters
    document.getElementById('clear-filters').addEventListener('click', () => {
        document.getElementById('content-search').value = '';
        document.getElementById('type-filter').value = '';
        document.getElementById('featured-filter').value = '';
        applyFiltersAndRender();
    });

    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderContent();
            updatePagination();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderContent();
            updatePagination();
        }
    });
    
    // Force sync button
    const forceSyncAllBtn = document.getElementById('force-sync-all-btn');
    if (forceSyncAllBtn) {
        forceSyncAllBtn.addEventListener('click', async () => {
            if (!confirm('🔄 This will force sync all content and update existing posts with latest metadata. Continue?')) {
                return;
            }
            
            // Disable button and show loading state
            forceSyncAllBtn.disabled = true;
            forceSyncAllBtn.textContent = '⏳ Syncing...';
            
            try {
                // Call the force sync function from the sync script
                if (window.forceSyncAllContent) {
                    const result = await window.forceSyncAllContent();
                    
                    if (result) {
                        showSuccess(`Sync completed! Added: ${result.addedCount}, Updated: ${result.updatedCount}`);
                        
                        // Refresh the data
                        await loadAllContent();
                        applyFiltersAndRender();
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
                forceSyncAllBtn.disabled = false;
                forceSyncAllBtn.textContent = '🔄 Force Sync All Content';
            }
        });
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

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
