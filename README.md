# Quiz Application

An interactive quiz platform built with Node.js, Express, and MongoDB.

## Features

- User authentication (signup/login)
- Interactive quiz interface
- Real-time scoring
- Leaderboard
- Analytics dashboard
- Mobile-responsive design

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Frontend**: HTML, CSS, JavaScript, EJS
- **Authentication**: Express Session

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Set up MongoDB:
   - Make sure MongoDB is installed and running on your system
   - The application will connect to MongoDB at `mongodb+srv://kumkumsinghrajput99:vy7B0NYhP1K7CJ3w@cluster0.janjf.mongodb.net/quiz-app?retryWrites=true&w=majority&appName=Cluster0`

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   MONGODB_URI=mongodb+srv://kumkumsinghrajput99:vy7B0NYhP1K7CJ3w@cluster0.janjf.mongodb.net/quiz-app?retryWrites=true&w=majority&appName=Cluster0
   SESSION_SECRET=quiz_app_secret_key_123
   PORT=3003
   NODE_ENV=production
   ```

4. Start the server:
   ```