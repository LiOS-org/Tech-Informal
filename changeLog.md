# Changelogs

## 1.0.0-alpha-4

- Fixed `License Section` for `Lucide Icons` in metadata.json
- Dropped `LiOS-InkWell` indefinately in favour of `Quill`, remenants of InkWell will remain and will use `LiOS-InkWell` once it reaches it stable state behind the scenes.
- Fixed backgrounds in `Comments Section`.
- Updated the `new-page` boilerplate.
- Added Sidebar Navigation: Currently only available in `Studio` page, will help navigate between `dashbard` and `channels` page.
- Added Studio page: Currently user can see info about their `latest post` under dashboard or `edit existing posts` under channels section. Studio can be accessed via `Accounts Page`.
- Updated `firestore.rules` to allow read and write on collection `channelIndex`.

## 1.0.0-alpha-3

- Added `changeLog.md` to keep track of every changes from now on.
- Fixed the scroll anchor for `Comments Section` : Now on clicking the `Comments` button, the page perfectly scrolls to it instead of cutting down the comments box.
- Fixed channel field in `#About` window.
- Added `Lucide Icons` entry in metdata.json.
- Added `Comment Deletion`: `Users` can delete their own comments while `Authors/Mods` can delete any comments.
