# TaskApp - Field Task Manager

**Candidate Code:** SA-RN-2026

---

##  Overview

TaskApp is a mobile-first productivity tool for field employees. It helps technicians create, plan, track, and review daily work tasks with offline support, location tracking, attachments, and real-time sync.

The UI is inspired by the classic Notepad.app aesthetic - clean, minimal, and distraction-free. Every element is designed for quick glance readability and one-handed operation in the field.

---

##  Features

- **Task Management** - Create, edit, delete, and bulk clear tasks
- **Statuses** - New, In Progress, Completed, Cancelled (with history logging)
- **Attachments** - Add images from gallery, view in task details
- **Location** - Manual address input + GPS geolocation with reverse geocoding
- **Map View** - All tasks displayed as colored markers (color-coded by status)
- **Push Notifications** - Reminder 30 min before due date, demo mode (30 sec)
- **Offline First** - Full CRUD works without internet, syncs automatically
- **Sync** - Manual and auto-sync with json-server (last-write-wins)
- **History Log** - Full audit trail: creation, edits, status changes, sync events
- **Dark/Light Theme** - Toggle in settings, persists across restarts
- **Search & Filter** - By title, description, status
- **Sorting** - By date created, due date, status

---

##  Architecture
<img width="350" height="347" alt="image" src="https://github.com/user-attachments/assets/bb3c0464-8b02-496e-aa07-aabcae8b4574" />


<img width="484" height="422" alt="image" src="https://github.com/user-attachments/assets/ab11cc41-e74e-4352-967d-5c32dbd5f3d4" />


## Component Design Philosophy

- **Components are self-contained** - each file owns its styles, types, and sub-components
- **StatusBadge is embedded in TaskCard** - no unnecessary prop drilling
- **TaskForm contains its own validation, inputs, and buttons** - no extra Button/Input components
- **All logic is extracted to services** - screens only render UI and call hooks

The component structure follows a **"keep it simple"** approach: small, focused files with clear responsibilities.
---

##  Installation

``


##  Key Design Decisions
Decision	Rationale
Context API over Redux	No need for complex state management
Embedded components	Reduces file count, keeps related code together
Single appService.ts	All storage/sync/notif logic in one place
syncStatus: 'pending' always	Forces explicit sync flow
DELETE + POST sync strategy	Works around json-server limitations
Manual address input + GPS	Falls back to TZ requirement + real-world UX

##  Known Limitations
Images stored as local URIs	Attachments may break if device storage is cleared
Sync conflict: last-write-wins	Simple strategy, documented
Notifications require foreground	May need additional setup for background
Code quality compromises | Some files could be more DRY | Time-boxed delivery (48h) - prioritizing working features over perfect code
| Build method | First production build took ~20-30 min | Used `eas build -p android` (Free Tier queue). 


##  AI/Tooling Disclosure
This project was developed with assistance from AI tools for:

Debugging and error resolution

assistance in learning new libraries

All AI-generated code was reviewed, tested, and adapted to fit the specific requirements of this assignment.

## links
HH: https://rabota.by/resume/9a303116ff03e3bcd90039ed1f306a4e316c76
LINK: https://www.linkedin.com/in/alexander-davydov-21172b22b/
VIDEO:
APK:
```
#  
# Clone the repo

# Install dependencies
npm install

# Start the app
npx expo start

Mock Server Setup

# Create db.json in project root
echo '{"tasks": [], "history": []}' > db.json

# Start the server
npx json-server --watch db.json --port 3000 --host 0.0.0.0
Note: Use your local IP address in app settings (e.g., http://xxx.xxx.xxx.xxx:3000).

 APK Build

# Build Android APK
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
npx expo login

# 3. Build APK directly
eas build -p android
#
