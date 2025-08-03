# Snap Scheduli

Effortlessly convert your schedule images into a digital calendar format. Snap a picture of your class or work schedule, and let Snap Scheduli generate a standard `.ics` file that you can import into Google Calendar, Apple Calendar, Outlook, and more.

## ✨ Core Features

- **Image to Calendar:** Upload a schedule image (PNG, JPG) and let our AI-powered backend parse it.
- **Dynamic Event Editing:** Review, modify, add, or delete events on a user-friendly editing page.
- **Date Range Selection:** Specify the start and end dates for your semester or schedule period.
- **ICS File Export:** Download your final schedule as a universal `.ics` file.
- **Cross-Platform:** Built with React Native and Expo, with a web-first approach.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Expo (for web and mobile)
- **Backend:** Python, Flask
- **Key Libraries:**
  - **OCR:** AI-powered text recognition to parse schedule details from images.
  - **`ics.py`:** For robust `.ics` calendar file generation.
  - **`Flask-CORS`:** To handle cross-origin requests between the frontend and backend.

## 📂 Project Structure

```
snap-scheduli/
├── app/                # React Native/Expo frontend source code
│   ├── Components/     # Reusable React components
│   ├── utilities/      # Helper functions (e.g., apiService.ts)
│   └── ...
├── backend/            # Python/Flask backend server
│   ├── server.py       # Main Flask application
│   ├── OCRService.py   # Handles image processing and text extraction
│   ├── ScheduleParser.py # Parses extracted text into structured events
│   ├── ICSExporter.py  # Generates the .ics file
│   └── requirements.txt# Python dependencies
├── assets/             # Static assets like images and icons
└── README.md           # You are here!
```

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Python](https://www.python.org/downloads/) (3.10+) and `pip`

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run the Flask server
# It will run on http://localhost:3000
python server.py
```

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to the project root
cd ..

# Install Node.js dependencies
npm install

# Start the development server
npm start
```

This will open the Expo development server. You can then:

- Press `w` to open the application in your web browser.
- Scan the QR code with the Expo Go app on your phone to view the mobile version.

## 📝 How to Use

1. Ensure both the backend and frontend servers are running.
2. Open the application in your browser or on your phone.
3. On the "Upload" screen, select your schedule image.
4. You will be taken to the "Edit" page. Here you can review the events parsed from your image. Make any necessary changes, add new events, or delete incorrect ones.
5. Once you are satisfied, click **"Get Downloadable ICS File"**.
6. On the "Download" page, click the download link to save your `schedule.ics` file.
7. Import this file into your preferred calendar application (Google Calendar, Apple Calendar, etc.).

## 🔮 Future Improvements

- **Recurring Events Support:** Enhance the `ScheduleParser` to intelligently detect recurring patterns (e.g., "Mon, Wed, Fri") and generate the appropriate recurrence rules (`RRULE`) in the `.ics` file.
- **User Accounts & Cloud Sync:** Implement user authentication to allow users to save their schedules and access them across multiple devices.
- **Direct Calendar Integration:** Add functionality to directly add events to a user's Google Calendar, Outlook, or Apple Calendar via their respective APIs (using OAuth for authorization), bypassing the need for manual `.ics` file import.
- **UI/UX Overhaul:** Redesign the interface with a focus on mobile-first principles, including native date/time pickers and a more intuitive event editing experience.
- **Broader Format Support:** Improve the OCR and parsing logic to handle a wider variety of schedule formats, including different layouts and handwritten text.
