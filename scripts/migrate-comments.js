#!/usr/bin/env node

/**
 * Migration script to add 'pinned' field to existing comments
 * Run this script once to ensure all existing comments have the pinned field set to false
 */

import { db } from '../src/assets/firebase.js';
import {
  collection, getDocs, updateDoc, doc, writeBatch
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

async function migrateComments() {
  try {
    console.log("🔄 Starting comment migration...");
    
    // Get all comments
    const commentsQuery = collection(db, "comments");
    const snapshot = await getDocs(commentsQuery);
    
    if (snapshot.empty) {
      console.log("✅ No comments found. Migration not needed.");
      return;
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    const batch = writeBatch(db);
    
    snapshot.forEach((commentDoc) => {
      const data = commentDoc.data();
      
      // Check if the comment already has a pinned field
      if (data.pinned === undefined) {
        batch.update(commentDoc.ref, { pinned: false });
        migratedCount++;
      } else {
        skippedCount++;
      }
    });
    
    if (migratedCount > 0) {
      await batch.commit();
      console.log(`✅ Migration completed successfully!`);
      console.log(`   📝 Migrated: ${migratedCount} comments`);
      console.log(`   ⏭️  Skipped: ${skippedCount} comments (already had pinned field)`);
    } else {
      console.log("✅ All comments already have the pinned field. No migration needed.");
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run the migration
migrateComments().then(() => {
  console.log("🎉 Migration process completed!");
}).catch((error) => {
  console.error("💥 Migration failed:", error);
  process.exit(1);
});
