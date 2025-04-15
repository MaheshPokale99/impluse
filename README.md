# Impulse

A comprehensive full-stack web application built with React.js and Node.js, designed to provide an interactive learning experience with real-time features, user authentication, and mentorship capabilities.

## 🌟 Features

### User Management
- **Advanced Authentication System**
  - JWT-based authentication
  - Secure password handling with bcryptjs
  - Email verification system
  - Password reset functionality
  - Persistent session management

### Real-time Features
- **Live Interactive Sessions**
  - WebSocket integration for real-time communication
  - One-on-one mentorship sessions
  - Real-time messaging capabilities
  - Live progress tracking

### Learning Management
- **Test and Assessment System**
  - Timed assessments with auto-submission
  - Progress tracking and analytics
  - Multiple question types support
  - Real-time score calculation
  - Detailed submission history

### User Interface
- **Modern Design**
  - Responsive layout for all devices
  - Dark/Light theme support
  - Smooth animations with Framer Motion
  - Interactive components
  - Toast notifications for user feedback

### File Management
- **Media Handling**
  - Image upload and storage
  - File type validation
  - Cloud storage integration (Cloudinary)
  - Secure file access control

## 🛠️ Technology Stack

### Frontend
- **Core**
  - React.js 18.3.1
  - Vite 6.0.7 (Build tool)
  - React Router DOM 7.1.1

- **State Management & Effects**
  - React Context API
  - React Hooks
  - Custom hooks for business logic

- **UI/UX**
  - TailwindCSS 3.4.17
  - Framer Motion 12.4.3
  - Styled Components 6.1.16
  - React Icons 5.4.0
  - React Hot Toast 2.5.2

- **HTTP Client**
  - Axios 1.8.1

### Backend
- **Core**
  - Node.js
  - Express.js 4.21.2
  - MongoDB with Mongoose 8.11.0

- **Authentication & Security**
  - JSON Web Tokens (jsonwebtoken 9.0.2)
  - bcryptjs 3.0.2
  - CORS support

- **File Handling**
  - Multer 1.4.5
  - Cloudinary 2.5.1

- **Communication**
  - Socket.io 4.8.1
  - Nodemailer 6.10.0
  - Twilio 5.5.2

- **Validation**
  - Zod 3.24.2

## 📁 Project Structure

```
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── assets/         # Static assets
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # React context providers
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS and style files
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Application entry point
│   
├── backend/                # Node.js backend server
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   │   ├── User.js       # User model
│   │   ├── Test.js       # Test model
│   │   ├── TestSubmissions.js # Test submissions
│   │   ├── Otp.js        # OTP verification
│   │   └── Image.js      # Image storage
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── websocket/        # WebSocket functionality
│   └── server.js         # Server entry point
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.sample`:
   ```bash
   cp .env.sample .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```

5. Start the server:
   ```bash
   npm start
   ```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user info
- `POST /api/users/register` - Register new user
- `POST /api/users/verify` - Verify email
- `POST /api/users/reset-password` - Reset password

### Test Management Endpoints
- `GET /api/tests` - Get all tests
- `POST /api/tests` - Create new test
- `GET /api/tests/:id` - Get test by ID
- `POST /api/tests/submit` - Submit test

### File Management Endpoints
- `POST /api/upload` - Upload files
- `GET /api/images` - Get all images
- `DELETE /api/images/:id` - Delete image

## 🔒 Security Features

1. **JWT Authentication**
   - Secure token-based authentication
   - Token expiration and refresh mechanism
   - Protected route middleware

2. **Data Validation**
   - Input validation using Zod
   - Request sanitization
   - Error handling middleware

3. **File Upload Security**
   - File type validation
   - Size limits
   - Secure storage with Cloudinary

4. **API Security**
   - CORS configuration
   - Rate limiting
   - Request validation

## 🎨 UI/UX Features

1. **Responsive Design**
   - Mobile-first approach
   - Fluid layouts
   - Breakpoint optimization

2. **Interactive Elements**
   - Smooth animations
   - Loading states
   - Error handling
   - Toast notifications

3. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
