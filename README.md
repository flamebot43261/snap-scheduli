# Snap Scheduli

Snap Scheduli is a web application designed to help students quickly and easily convert a picture of their class schedule into a downloadable `.ics` calendar file. Users can upload an image, review the auto-parsed events, make edits, and generate a calendar file compatible with Google Calendar, Apple Calendar, and other services.

## Recent Changes (August 2025)

This project has undergone significant updates to resolve critical bugs, improve debugging, and clean up the codebase.

### 🐛 Core Bug Fixes

- **Resolved Timezone Conversion Bug**: Fixed a major issue where event end times were being incorrectly converted due to a mismatch between JavaScript's local time (`setHours`) and UTC (`toISOString`) handling. This was the root cause of times like `20:50` (8:50 PM) being saved as `00:50` (12:50 AM).
- **Stabilized Event Editing**: Implemented logic to prevent the parent `EditPage` component from overriding user edits in the child `EventBubble` component during re-renders, making the editing process more reliable.

### ⚙️ Features & Improvements

- **Enhanced Debugging**: Added comprehensive logging on both the frontend (browser console) and backend (terminal) to trace the entire lifecycle of an event, from UI edit to ICS file creation.

- **Centralized Styling**: Migrated from CSS modules to a single `styles.js` file using React Native's `StyleSheet` API for more consistent and maintainable styling across all components.

### 🧹 Code Cleanup

- **Archived Unused Files**: Moved numerous old, duplicate, and test files (`EventBubble_OLD.tsx`, `time_debug_test.html`, etc.) into an `archive/` folder to declutter the project.
- **Streamlined Components**: Replaced the old `EventBubble.tsx` with a new, more stable `EventBubble_NEW.tsx` to contain the time-handling fixes.

---

## ⚠️ Known Issues

- **Persistent End Time Bug**: Despite the recent fixes, a stubborn bug remains where user-edited end times are not always reflected in the final `.ics` file.
  - **Symptom**: A user changes an event's end time to 8:50 PM in the UI. The frontend logs show the time is correctly processed. However, the final `.ics` file shows the event ending at an incorrect time (e.g., 7:00 PM).
  - **Current Status**: The data appears correct through the entire frontend data flow but seems to be lost or misinterpreted when the backend processes the data to generate the calendar file. This remains the highest priority issue to resolve.

---

## 🚀 Future Improvements

To improve the stability and functionality of Snap Scheduli, the following enhancements are recommended:

1. **Robust Time Handling Library**:
    - Integrate a dedicated date/time library like `date-fns` or `moment.js`. This would eliminate manual date-string parsing and timezone conversion errors, providing a single source of truth for time handling across the app.

2. **Refactor State Management**:
    - Replace the current `useState` and prop-drilling approach with a more robust state management solution like **Redux Toolkit** or **Zustand**. This would prevent race conditions and make the app state easier to manage and debug.

3. **Improve UI/UX**:
    - Add visual feedback (e.g., spinners, success messages) when an event is updated.
    - Implement a "Save Changes" button that is disabled until an actual change is made.
    - Improve the layout and responsiveness of the editing interface.

4. **Automated Testing**:
    - Introduce a testing framework like **Jest** and **React Testing Library**.
    - Write unit tests for critical functions, especially the time conversion and event parsing logic, to prevent future regressions.

5. **Backend Validation**:
    - Enhance the Flask backend to perform stricter validation on incoming data from the frontend, immediately rejecting any malformed event data.

---

## 🏃‍♀️ How to Run the Application

### 1. Start the Backend Server

```bash
cd backend
# Make sure you have a virtual environment set up and activated
source venv/bin/activate 
# Install dependencies
pip install -r requirements.txt
# Run the server
python server.py
```

The backend will run on `http://localhost:5000`.

### 2. Start the Frontend Application

In a new terminal, navigate to the project root.

```bash
# Install dependencies
npm install
# Start the Expo development server
npm start
```

This will open a browser tab where you can run the web version of the application, typically on `http://localhost:8081`.
