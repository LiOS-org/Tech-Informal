import { db } from '/assets/firebase.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where,
    writeBatch,
    doc
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

// This script should be run manually to sync your 11ty content to Firestore
// You can run this from the browser console on any authenticated page

// Function to scan and extract content from actual generated HTML files
async function scanAllPostsFromFileSystem() {
    const scannedPosts = [];
    
    try {
        console.log('🔍 Scanning markdown files from the file system...');
        
        // Get all blog posts from the generated pages
        const blogPages = [
            '/blog/2025-06-05-what-is-ai-its-functioning-misuses/',
            '/blog/2025-06-06-concept-of-generative-ai-in-creative-field/',
            '/blog/2025-06-06-custom-roms-explained-past-present-future/',
            '/blog/2025-06-06-upi-a-revolution-that-made-payment-easier/',
            '/blog/2025-06-07-an-opinion-on-pwas-progressive-web-apps/'
        ];
        
        // Fetch and parse each blog page to extract frontmatter data
        for (const pageUrl of blogPages) {
            try {
                console.log(`📄 Fetching: ${pageUrl}`);
                const response = await fetch(pageUrl);
                if (!response.ok) {
                    console.warn(`⚠️ Failed to fetch ${pageUrl}: ${response.status}`);
                    continue;
                }
                
                const html = await response.text();
                const post = extractPostDataFromHTML(html, pageUrl);
                
                if (post) {
                    scannedPosts.push(post);
                    console.log(`✅ Extracted: ${post.title}`);
                    console.log(`   📸 Featured Image: ${post.featured_image}`);
                } else {
                    console.warn(`⚠️ Could not extract data from ${pageUrl}`);
                }
            } catch (fetchError) {
                console.error(`❌ Error fetching ${pageUrl}:`, fetchError);
            }
        }
        
        console.log(`📁 Successfully scanned ${scannedPosts.length} posts from file system`);
        return scannedPosts;
        
    } catch (error) {
        console.error('Error scanning posts from file system:', error);
        return [];
    }
}

// Helper function to extract post data from HTML content
function extractPostDataFromHTML(html, url) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract basic metadata
        const title = doc.querySelector('title')?.textContent?.replace(' - Tech Informal', '') || 
                     doc.querySelector('h1')?.textContent || 'Unknown Title';
        
        const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 
                           doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || 
                           'No description available';
        
        // Extract featured image from the main article image
        const featuredImageElement = doc.querySelector('.main-article_figure img, .blog__image, article img');
        const featured_image = featuredImageElement?.getAttribute('src') || '/assets/images/image.webp';
        
        // Extract author (you might need to adjust this selector based on your HTML structure)
        const author = 'MD Saifullah'; // Default since it's consistent across posts
        
        // Determine post type from URL
        const type = url.includes('/blog/') ? 'blog' : 'article';
        
        // Extract tags if they're embedded in the HTML (adjust selector as needed)
        const tags = ['post']; // Default tags, you can enhance this to extract from HTML
        
        // Try to extract date from the URL pattern or content
        let date = new Date().toISOString();
        const dateMatch = url.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
            const [, year, month, day] = dateMatch;
            date = new Date(`${year}-${month}-${day}`).toISOString();
        }
        
        return {
            title: title.trim(),
            description: description.trim(),
            url: url,
            type: type,
            author: author,
            date: date,
            featured_image: featured_image,
            tags: tags
        };
        
    } catch (error) {
        console.error('Error extracting post data from HTML:', error);
        return null;
    }
}

// Get the scanned content (this replaces STATIC_CONTENT)
let STATIC_CONTENT = [];

// Function to sync all static content to Firestore
export async function syncAllContent() {
    try {
        console.log('Starting content sync to Firestore...');
        
        // First, scan all posts from file system
        STATIC_CONTENT = await scanAllPostsFromFileSystem();
        
        if (STATIC_CONTENT.length === 0) {
            console.log('⚠️ No content found to sync');
            return { addedCount: 0, skippedCount: 0, total: 0 };
        }
        
        let addedCount = 0;
        let skippedCount = 0;
        
        for (const post of STATIC_CONTENT) {
            try {
                // Check if post already exists
                const existingQuery = query(
                    collection(db, "posts"),
                    where("url", "==", post.url)
                );
                const existingDocs = await getDocs(existingQuery);
                
                if (existingDocs.empty) {
                    // Add the post to Firestore
                    await addDoc(collection(db, "posts"), {
                        ...post,
                        synced_at: new Date().toISOString(),
                        source: 'static_sync'
                    });
                    
                    console.log(`✅ Added: ${post.title}`);
                    addedCount++;
                } else {
                    console.log(`⏭️ Skipped (already exists): ${post.title}`);
                    skippedCount++;
                }
            } catch (postError) {
                console.error(`❌ Error adding ${post.title}:`, postError);
            }
        }
        
        console.log(`\n📊 Sync completed:`);
        console.log(`   Added: ${addedCount} posts`);
        console.log(`   Skipped: ${skippedCount} posts`);
        console.log(`   Total processed: ${STATIC_CONTENT.length} posts`);
        
        return { addedCount, skippedCount, total: STATIC_CONTENT.length };
        
    } catch (error) {
        console.error('❌ Error during content sync:', error);
        throw error;
    }
}

// Function to clear all synced content (use with caution!)
export async function clearAllSyncedContent() {
    if (!confirm('⚠️ This will delete ALL synced content from Firestore. Are you sure?')) {
        return;
    }
    
    if (!confirm('🚨 This action cannot be undone! Continue?')) {
        return;
    }
    
    try {
        console.log('Clearing all synced content...');
        
        const postsQuery = query(
            collection(db, "posts"),
            where("source", "==", "static_sync")
        );
        const querySnapshot = await getDocs(postsQuery);
        
        const batch = writeBatch(db);
        let deleteCount = 0;
        
        querySnapshot.forEach((docSnapshot) => {
            batch.delete(doc(db, "posts", docSnapshot.id));
            deleteCount++;
        });
        
        await batch.commit();
        
        console.log(`🗑️ Deleted ${deleteCount} synced posts`);
        return deleteCount;
        
    } catch (error) {
        console.error('❌ Error clearing content:', error);
        throw error;
    }
}

// Function to update featured status for existing posts
export async function updateFeaturedPosts(featuredUrls = []) {
    try {
        console.log('Updating featured status...');
        
        const batch = writeBatch(db);
        let updateCount = 0;
        
        for (const url of featuredUrls) {
            const postsQuery = query(
                collection(db, "posts"),
                where("url", "==", url)
            );
            const querySnapshot = await getDocs(postsQuery);
            
            querySnapshot.forEach((docSnapshot) => {
                batch.update(doc(db, "posts", docSnapshot.id), {
                    featured: true,
                    featured_updated_at: new Date().toISOString()
                });
                updateCount++;
            });
        }
        
        await batch.commit();
        
        console.log(`✨ Updated ${updateCount} posts to featured`);
        return updateCount;
        
    } catch (error) {
        console.error('❌ Error updating featured posts:', error);
        throw error;
    }
}

// Function to force sync all content (updates existing posts)
export async function forceSyncAllContent() {
    try {
        console.log('🔄 Force syncing all content (will update existing posts)...');
        
        // First, scan all posts from file system
        STATIC_CONTENT = await scanAllPostsFromFileSystem();
        
        if (STATIC_CONTENT.length === 0) {
            console.log('⚠️ No content found to sync');
            return { addedCount: 0, updatedCount: 0, total: 0 };
        }
        
        let addedCount = 0;
        let updatedCount = 0;
        
        for (const post of STATIC_CONTENT) {
            try {
                // Check if post already exists
                const existingQuery = query(
                    collection(db, "posts"),
                    where("url", "==", post.url)
                );
                const existingDocs = await getDocs(existingQuery);
                
                if (existingDocs.empty) {
                    // Add the post to Firestore
                    await addDoc(collection(db, "posts"), {
                        ...post,
                        featured: false, // Default to not featured
                        synced_at: new Date().toISOString(),
                        source: 'static_sync'
                    });
                    
                    console.log(`✅ Added: ${post.title}`);
                    addedCount++;
                } else {
                    // Update existing post (preserve featured status)
                    const existingDoc = existingDocs.docs[0];
                    const existingData = existingDoc.data();
                    
                    const batch = writeBatch(db);
                    batch.update(doc(db, "posts", existingDoc.id), {
                        ...post,
                        featured: existingData.featured || false, // Preserve existing featured status
                        synced_at: new Date().toISOString(),
                        source: 'static_sync'
                    });
                    await batch.commit();
                    
                    console.log(`🔄 Updated: ${post.title}`);
                    updatedCount++;
                }
            } catch (postError) {
                console.error(`❌ Error processing ${post.title}:`, postError);
            }
        }
        
        console.log(`\n📊 Force sync completed:`);
        console.log(`   Added: ${addedCount} posts`);
        console.log(`   Updated: ${updatedCount} posts`);
        console.log(`   Total processed: ${STATIC_CONTENT.length} posts`);
        
        return { addedCount, updatedCount, total: STATIC_CONTENT.length };
        
    } catch (error) {
        console.error('❌ Error during force sync:', error);
        throw error;
    }
}

// Make functions available globally for console usage
window.syncAllContent = syncAllContent;
window.forceSyncAllContent = forceSyncAllContent;
window.clearAllSyncedContent = clearAllSyncedContent;
window.updateFeaturedPosts = updateFeaturedPosts;

// Auto-run sync if URL parameter is present
if (window.location.search.includes('sync=true')) {
    window.addEventListener('load', () => {
        setTimeout(async () => {
            try {
                await syncAllContent();
                alert('Content sync completed! Check console for details.');
            } catch (error) {
                alert('Content sync failed! Check console for details.');
                console.error(error);
            }
        }, 2000);
    });
}

console.log('🔧 Content sync utilities loaded. Available functions:');
console.log('   - syncAllContent()          // Sync only new posts');
console.log('   - forceSyncAllContent()     // Sync + update existing posts');
console.log('   - clearAllSyncedContent()   // Delete all synced posts');
console.log('   - updateFeaturedPosts(["url1", "url2"])  // Set specific posts as featured');
console.log('');
console.log('💡 Tip: Add ?sync=true to the URL to auto-run sync on page load');
console.log('💡 If you only see 1 post, run: forceSyncAllContent()');
