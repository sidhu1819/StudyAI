# StudyAI 🧠📚

StudyAI is a modern, AI-powered study companion and quiz generation platform designed to help students learn faster and smarter. Simply upload your study materials, and StudyAI will automatically generate comprehensive summaries, interactive flashcards, practice quizzes, and personalized study schedules.

## 🚀 Features

- **Document Upload**: Supports PDF, DOCX, and raw text paste.
- **AI Summaries**: Instantly extracts key concepts, definitions, and revision notes.
- **Interactive Flashcards**: 3D flipping flashcards with difficulty levels to test your knowledge.
- **Practice Quizzes**: Multiple-choice quizzes with instant grading and explanations.
- **Study Plans**: Generates personalized, multi-day study schedules.
- **Modern UI**: Built with React, Tailwind CSS V4, and Framer Motion for a stunning, responsive, glassmorphism design.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), React Router, Tailwind CSS, Framer Motion, Axios
- **Backend**: Python, Flask, Flask-CORS
- **Database**: Firebase Firestore (with local JSON fallback for local development)
- **AI Engine**: Groq API (`llama-3.3-70b-versatile`)
- **Processing**: PyPDF2, python-docx

## ⚙️ Local Setup

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` folder and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   # Optional: FIREBASE_CREDENTIALS=path/to/serviceAccountKey.json
   ```
5. Run the Flask server:
   ```bash
   python app.py
   ```
   *The backend will run on `http://127.0.0.1:5000`*

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`*

## 📚 API Documentation

### Authentication
- `POST /api/auth/register`: Register a new user (`name`, `email`, `password`)
- `POST /api/auth/login`: Login user (`email`, `password`)

### Materials
- `POST /api/upload`: Upload PDF/DOCX or raw text (`user_id`, `title`, `file` | `text`)
- `GET /api/materials/<user_id>`: Get all uploaded materials for a user
- `DELETE /api/materials/<material_id>`: Delete a specific material

### AI Tools
- `POST /api/summary`: Generate summary (`material_id`, `user_id`)
- `GET /api/summary/<material_id>`: Get summary for material
- `POST /api/flashcards`: Generate flashcards (`material_id`, `user_id`)
- `GET /api/flashcards/<material_id>`: Get flashcards for material
- `POST /api/quiz`: Generate a practice quiz (`material_id`, `user_id`)
- `GET /api/quiz/<material_id>`: Get quiz for material
- `POST /api/schedule`: Generate a study plan (`material_id`, `user_id`)
- `GET /api/schedule/<material_id>`: Get study plan for material

## 🛡️ Architecture & Security

- **Clean Architecture**: Backend routes are modularized using Flask Blueprints (`auth`, `materials`, `ai`).
- **Data Fallback**: Designed to seamlessly fallback to a local JSON database if Firebase credentials are omitted.
- **Frontend State**: Manages authentication persistence using React Context API and `localStorage`.

---
*Built with ❤️ using React and Flask.*
