# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Tech-Informal is a Firebase-based web application that implements a comment and reaction system with role-based permissions. The project features Google OAuth authentication, Firestore database operations, and a moderation system with user roles (user, mod, owner).

## Architecture

### Core Components
- **Frontend**: Vanilla JavaScript with ES6 modules served via Firebase Hosting
- **Backend**: Firebase services (Authentication, Firestore, Storage, Hosting)
- **UI Framework**: LiOS-Open (Git submodule) - provides consistent styling
- **Database**: Firestore with security rules for role-based access control

### Key Collections
- `comments` - User comments with author info, timestamps, and pinning capability
- `reactions` - Like/dislike reactions linked to comments and users  
- `roles` - User role assignments (user/mod/owner) for permission management
- `posts` - Content management restricted to mods/owners

### Authentication Flow
- Google OAuth using Firebase Auth with redirect flow
- Role-based permissions enforced through Firestore security rules
- User roles determine moderation capabilities (pin/unpin, delete comments)

## Development Commands

### Firebase Operations
```bash
# Deploy all Firebase services
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules and indexes
firebase deploy --only firestore

# Start local Firebase emulators
firebase emulators:start

# Initialize new Firebase features
firebase init
```

### Local Development
```bash
# Install dependencies
npm install

# Serve locally (Firebase hosting)
firebase serve

# Update LiOS-Open submodule
git submodule update --init --recursive

# Pull latest changes from LiOS-Open
git submodule update --remote public/LiOS-Open
```

## Project Structure

```
├── public/                    # Static web assets
│   ├── assets/JS/            # JavaScript modules
│   │   ├── authentication.js # Google OAuth implementation
│   │   └── main.js           # Main application logic
│   ├── LiOS-Open/            # Git submodule for UI components
│   └── index.html            # Entry point
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Database indexes configuration
├── storage.rules             # Storage security rules  
├── firebase.json             # Firebase project configuration
└── firebase.js               # Firebase SDK initialization (gitignored)
```

## Security Configuration

### Firestore Rules Key Points
- Public read access for comments, reactions, roles, and posts
- Authenticated users can create comments and reactions
- Users can modify their own content
- Mods/owners can moderate any content (pin, unpin, delete)
- Role-based permission checks using document existence queries

### Important Security Notes
- `firebase.js` contains configuration and is gitignored for security
- Storage rules currently deny all access (`allow read, write: if false`)
- Role assignments should be carefully managed in production

## Firebase Configuration

The project uses Firebase services in the `asia-south2` region:
- Firestore database with custom rules and indexes
- Firebase Hosting for static asset serving
- Firebase Storage (currently restricted)
- Firebase Authentication with Google provider

## Development Guidelines

### Working with Roles
- User roles are stored in `/roles/{userId}` documents
- Role checks in security rules use `exists()` and `get()` functions
- Pagination should use 20 items consistently per user preference

### Modifying Security Rules
- Test rules locally with Firebase emulators before deployment
- Role-based permissions are enforced at the database level
- Comment pinning is restricted to mods/owners through security rules

### Submodule Management
- LiOS-Open provides the design system and UI components
- Keep submodule updated but test UI changes thoroughly
- CSS is loaded from `LiOS-Open/public/LiOS_Open.css`

## Common Issues

### Missing firebase.js
If you encounter errors about missing `firebase.js`:
1. Create `public/firebase.js` with your Firebase configuration
2. Initialize Firebase app and export it as default
3. Never commit this file (it's gitignored)

### Firestore Permission Errors
- Ensure user roles are properly set in `/roles/{userId}` collection
- Verify security rules match your intended permission model
- Use Firebase console or emulators to debug rule evaluation
