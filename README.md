# Snap Scheduli

Snap Scheduli is a cross-platform application designed to help students quickly and easily convert a picture of their class schedule into a downloadable `.ics` calendar file. Users can upload an image, review the auto-parsed events, make edits, and generate a calendar file compatible with Google Calendar, Apple Calendar, and other services.

## Project Status: Stable (August 2025)

This project has recently undergone a major refactoring to resolve critical bugs, modernize its architecture, and improve maintainability. The core functionality is now stable, and the most significant issues have been addressed.

---

## Major Architectural Changes

The application was fundamentally redesigned to improve reliability and enable cross-platform support.

- **Migration to React Native**: The entire frontend was rebuilt using **Expo and React Native**, replacing the original web-centric design. This enables a single codebase to target both web browsers and native mobile apps (via Expo Go).

- **Refined Backend Architecture**: A more robust, session-based process was implemented.
  1. The backend parses the image and generates events for a **single base week**.
  2. This "template" week is sent to the user for editing.
  3. The final, multi-week `.ics` file is generated on-demand from the user-edited base week, ensuring all corrections are accurately propagated across all recurring events.

- **Component Consolidation**: All duplicate and conflicting `EventBubble` components were deprecated and replaced with a single, stable component. This simplifies maintenance and resolves previous state management conflicts.

- **Centralized API Service**: All network `fetch` calls have been abstracted into a dedicated `apiService.ts` module, making configuration and debugging much easier.

---

## Key Bug Fixes and Improvements

- **✅ Corrected Event Day Spanning**: Fixed a critical bug where an event edited to end late in the evening (e.g., Thursday 8:50 PM) would incorrectly span into the next day (Friday). The logic now ensures the event's start and end times are always anchored to the same calendar day.

- **✅ Stabilized Date Editing**: Resolved an issue where manually changing an event's date in the UI would be reverted by the application. The component state logic was improved to respect user input during editing sessions.

- **✅ Enabled Mobile Testing**: Fixed the "Network Error" when running on the Expo Go mobile app by:
  - Configuring the backend server to accept network connections (`host='0.0.0.0'`).
  - Correcting the server's CORS policy to allow requests from mobile devices.
  - Standardizing network ports across the frontend and backend.

- **🧹 Code Cleanup**: Archived numerous old, duplicate, and test files into an `archive/` folder to declutter the project and create a single source of truth for all components.

---

## 🏃‍♀️ How to Run the Application

### 1. Start the Backend Server

```bash
# Navigate to the backend directory
cd backend

# Set up and activate a Python virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server (listens on all network interfaces for mobile testing)
python server.py
```

The backend will run on `http://localhost:3000`.

### 2. Start the Frontend Application

In a new terminal, navigate to the project root.

```bash
# Install dependencies
npm install

# Start the Expo development server
npm start
```

This will open a browser tab for web testing. You can also scan the QR code with the Expo Go app on your phone for mobile testing.

### 📱 Note for Mobile Testing

To connect from the Expo Go app on your phone, you must replace `localhost` with your computer's local network IP address in `app/utilities/apiService.ts`.
