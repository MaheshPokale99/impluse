# Impulse

A comprehensive full-stack web application built with React.js and Node.js, designed to provide an interactive learning experience with real-time features, user authentication, and mentorship capabilities.

## 📑 Table of Contents
1. [Features](#-features)
2. [Technology Stack](#️-technology-stack)
3. [Project Structure](#-project-structure)
4. [Pages & Components](#-pages--components)
5. [Setup Instructions](#-setup-instructions)
6. [API Documentation](#-api-documentation)
7. [Security Implementation](#-security-implementation)
8. [UI/UX Features](#-uiux-features)

## 🌟 Features

### User Management System
- **Authentication Flow**
  - JWT-based session management with token refresh
  - Email verification using nodemailer
  - Password reset with secure tokens
  - Remember me functionality
  - Session persistence using localStorage

### Test Management System
- **Test Creation**
  - Multiple question types support
  - Time limit configuration
  - Question bank management
  - Test preview functionality
  
- **Test Taking**
  - Real-time progress tracking
  - Auto-save functionality
  - Timer with visual indicators
  - Auto-submit on time expiry
  - Progress persistence

- **Submission Management**
  - Detailed submission history
  - Score calculation
  - Performance analytics
  - Review capabilities

### Real-time Features
- **WebSocket Integration**
  - Live chat functionality
  - Real-time notifications
  - Connection state management
  - Automatic reconnection
  - Message persistence

### File Management System
- **Image Upload**
  - Cloudinary integration
  - Multiple file upload
  - Progress tracking
  - File type validation
  - Size restrictions
  
- **Gallery Management**
  - Grid and list views
  - Lazy loading
  - Search functionality
  - Filter capabilities
  - Sorting options

## 🛠️ Technology Stack

### Frontend Architecture
- **Core Framework**
  ```json
  {
    "react": "18.3.1",
    "vite": "6.0.7",
    "react-router-dom": "7.1.1"
  }
  ```

- **State Management**
  - Context API implementation
  - Custom hooks for business logic
  - Local storage integration
  - Form state management

- **UI Components**
  ```json
  {
    "framer-motion": "12.4.3",
    "styled-components": "6.1.16",
    "react-icons": "5.4.0",
    "react-hot-toast": "2.5.2",
    "tailwindcss": "3.4.17"
  }
  ```

### Backend Architecture
- **Server Framework**
  ```json
  {
    "express": "4.21.2",
    "mongoose": "8.11.0",
    "socket.io": "4.8.1"
  }
  ```

- **Security Packages**
  ```json
  {
    "jsonwebtoken": "9.0.2",
    "bcryptjs": "3.0.2",
    "cors": "latest"
  }
  ```

- **File Handling**
  ```json
  {
    "multer": "1.4.5",
    "cloudinary": "2.5.1"
  }
  ```

## 📁 Project Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── pages/                 # Route components
│   │   ├── Home.jsx          # Landing page
│   │   ├── AuthForm.jsx      # Authentication forms
│   │   ├── CreateTest.jsx    # Test creation interface
│   │   ├── SubmitTest.jsx    # Test taking interface
│   │   ├── ImageGallery.jsx  # Image gallery view
│   │   └── UserSubmission.jsx # Submission review
│   │
│   ├── components/           # Reusable components
│   │   ├── Navbar.jsx       # Navigation component
│   │   ├── Features.jsx     # Features showcase
│   │   ├── ChatShow.jsx     # Chat interface
│   │   ├── QuerySection.jsx # Query handling
│   │   └── Work.jsx         # Portfolio section
│   │
│   ├── context/             # State management
│   │   ├── AuthContext.jsx  # Authentication state
│   │   └── ThemeContext.jsx # Theme management
│   │
│   └── styles/              # Styling files
```

### Backend Structure
```
backend/
├── models/                  # Database schemas
│   ├── User.js             # User model
│   ├── Test.js             # Test model
│   ├── TestSubmissions.js  # Submissions model
│   ├── Otp.js             # OTP verification
│   └── Image.js           # Image storage
│
├── controllers/            # Route controllers
├── middleware/            # Custom middleware
├── routes/               # API routes
├── utils/               # Helper functions
├── websocket/          # Socket.io setup
└── config/            # Configuration
```

## 📱 Pages & Components

### Key Pages Implementation

1. **Home Page (`Home.jsx`)**
   - Hero section with animated components
   - Feature showcase with Framer Motion animations
   - Responsive grid layout
   - Theme-aware styling

2. **Authentication (`AuthForm.jsx`)**
   - Form validation with custom hooks
   - Error handling and feedback
   - Social authentication integration
   - Responsive design

3. **Test Creation (`CreateTest.jsx`)**
   - Dynamic form generation
   - Question type templates
   - Preview functionality
   - Auto-save feature

4. **Test Taking (`SubmitTest.jsx`)**
   - Timer implementation
   - Progress tracking
   - Auto-submission
   - Answer persistence

### Core Components

1. **Navigation (`Navbar.jsx`)**
   ```jsx
   - Responsive design
   - Theme toggle
   - Authentication state
   - Dynamic routing
   ```

2. **Chat Interface (`ChatShow.jsx`)**
   ```jsx
   - Real-time messaging
   - Message persistence
   - Typing indicators
   - Read receipts
   ```

3. **Query Section (`QuerySection.jsx`)**
   ```jsx
   - Form validation
   - Error handling
   - Response formatting
   - Loading states
   ```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git

### Frontend Setup

1. Navigate to frontend:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. Start development:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to backend:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<your_mongodb_connection_string>
   JWT_SECRET=your_jwt_secret_key
   CLOUD_NAME=<your_cloudinary_cloud_name>
   CLOUD_API_KEY=<your_cloudinary_api_key>
   CLOUD_API_SECRET=<your_cloudinary_api_secret>

   EMAIL_USER=
   EMAIL_PASS=
   Admin_Email=
   ```

## 📝 API Documentation

### Authentication API
```javascript
POST /api/users/login
- Body: { email, password }
- Returns: { token, user }

POST /api/users/register
- Body: { name, email, password }
- Returns: { token, user }

GET /api/users/me
- Headers: { Authorization }
- Returns: { user }
```

### Test Management API
```javascript
POST /api/tests
- Body: { title, questions, timeLimit }
- Returns: { test }

GET /api/tests/:id
- Returns: { test }

POST /api/tests/submit
- Body: { testId, answers }
- Returns: { submission }
```

### File Management API
```javascript
POST /api/upload
- Body: FormData
- Returns: { urls }

GET /api/images
- Returns: { images }

DELETE /api/images/:id
- Returns: { success }
```

## 🔒 Security Implementation

### Authentication Flow
1. Password hashing with bcrypt
2. JWT token generation and validation
3. Protected route middleware
4. Session management

### Data Validation
1. Input sanitization
2. Request validation with Zod
3. Error handling middleware
4. XSS protection

### File Security
1. File type validation
2. Size restrictions
3. Secure storage
4. Access control

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Fluid typography
- Flexible layouts
- Breakpoint optimization

### Interactive Elements
- Loading states
- Error feedback
- Success animations
- Progress indicators

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance
