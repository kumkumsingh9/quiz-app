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
   - The application will connect to MongoDB at `mongodb+srv://kumkumsinghrajput99:<db_password>@cluster0.janjf.mongodb.net/quiz-app?retryWrites=true&w=majority&appName=Cluster0`

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   MONGODB_URI=mongodb+srv://kumkumsinghrajput99:<db_password>@cluster0.janjf.mongodb.net/quiz-app?retryWrites=true&w=majority&appName=Cluster0
   SESSION_SECRET=your_session_secret
   PORT=3003
   ```

4. Start the server:
   ```
   npm start
   ```

5. Access the application:
   - Open your browser and go to `http://localhost:3003`

## Deployment

### GitHub
1. Create a new repository on GitHub
2. Initialize git and push your code:
   ```
   git init
   git add .
   
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your_github_repo_url
   git push -u origin main
   ```

### Render
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: npm install
   - Start Command: node server.js
   - Branch: main
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `SESSION_SECRET`: Your session secret
   - `NODE_ENV`: production

## Usage

1. Sign up for a new account or log in with existing credentials
2. Take quizzes and see your scores in real-time
3. View the leaderboard to see how you rank against others
4. Check analytics to see performance statistics

## License

MIT

## Author

kumkumsinghh9 