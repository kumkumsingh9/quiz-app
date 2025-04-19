const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // Session TTL (1 day)
    }),
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    college: { type: String, required: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Score Schema
const scoreSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', scoreSchema);

// Option Selection Schema
const optionSelectionSchema = new mongoose.Schema({
    questionIndex: { type: Number, required: true },
    selectedOption: { type: Number, required: true, min: -1 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now }
});

const OptionSelection = mongoose.model('OptionSelection', optionSelectionSchema);

// Sample quiz questions
const quizQuestions = [
    {
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
        correctAnswer: 0
    },
    {
        question: "Which HTML tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correctAnswer: 1
    },
    {
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"],
        correctAnswer: 1
    },
    {
        question: "Which CSS property is used to change the text color?",
        options: ["text-color", "font-color", "color", "text-style"],
        correctAnswer: 2
    },
    {
        question: "Which HTML tag is used for the largest heading?",
        options: ["<h6>", "<h1>", "<heading>", "<head>"],
        correctAnswer: 1
    },
    {
        question: "If 2 + 2 = 4, what is 4 + 4?",
        options: ["6", "8", "10", "12"],
        correctAnswer: 1
    },
    {
        question: "Which CSS property is used to add space between elements?",
        options: ["spacing", "margin", "padding", "gap"],
        correctAnswer: 1
    },
    {
        question: "What is the next number in the sequence: 2, 4, 6, 8, __?",
        options: ["9", "10", "11", "12"],
        correctAnswer: 1
    },
    {
        question: "Which HTML tag is used to create a paragraph?",
        options: ["<para>", "<p>", "<paragraph>", "<text>"],
        correctAnswer: 1
    },
    {
        question: "If a rectangle has a width of 5 and a height of 3, what is its area?",
        options: ["8", "15", "16", "20"],
        correctAnswer: 1
    }
];

// Authentication middleware
const requireAuth = (req, res, next) => {
    console.log('Auth check - Session:', req.session);
    console.log('Auth check - User ID:', req.session.userId);
    console.log('Auth check - Session ID:', req.session.id);
    console.log('Auth check - Cookie:', req.session.cookie);
    
    if (!req.session.userId) {
        console.log('Auth check - No user ID, redirecting to login');
        return res.redirect('/login');
    }
    
    console.log('Auth check - User authenticated, proceeding');
    next();
};

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/quiz', requireAuth, (req, res) => {
    res.render('quiz');
});

app.get('/leaderboard', requireAuth, (req, res) => {
    res.render('leaderboard');
});

app.get('/home', requireAuth, (req, res) => {
    res.render('home');
});

// API Routes
app.post('/signup', async (req, res) => {
    try {
        console.log('Signup attempt for username:', req.body.username);
        const { username, password, college, phone } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Signup failed: Username already exists -', username);
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Validate required fields
        if (!username || !password || !college || !phone) {
            console.log('Signup failed: Missing required fields');
            return res.status(400).json({ error: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            username,
            password: hashedPassword,
            college,
            phone
        });
        
        await user.save();
        console.log('User created successfully:', username);
        
        // Set session for the new user
        req.session.userId = user._id;
        
        res.status(200).json({ 
            success: true, 
            message: 'User created successfully',
            redirect: '/quiz'
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

app.post('/login', async (req, res) => {
    try {
        console.log('Login attempt - Body:', req.body);
        const { username, password } = req.body;

        if (!username || !password) {
            console.log('Login failed - Missing credentials');
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            console.log('Login failed - User not found:', username);
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Login failed - Invalid password for user:', username);
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        req.session.userId = user._id;
        console.log('Login successful - Session after login:', req.session);
        console.log('Login successful - User ID set:', user._id);
        console.log('Login successful - Session ID:', req.session.id);
        console.log('Login successful - Cookie:', req.session.cookie);

        res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            redirect: '/home'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/api/questions', requireAuth, (req, res) => {
    res.json(quizQuestions);
});

app.post('/api/scores', requireAuth, async (req, res) => {
    try {
        const { score, selections } = req.body;
        const newScore = new Score({
            userId: req.session.userId,
            score
        });
        
        await newScore.save();
        
        // Save option selections
        if (selections && Array.isArray(selections)) {
            const optionSelections = selections.map(selection => ({
                questionIndex: selection.questionIndex,
                selectedOption: selection.selectedOption === null || selection.selectedOption === undefined ? -1 : selection.selectedOption,
                userId: req.session.userId
            }));
            
            await OptionSelection.insertMany(optionSelections);
        }
        
        res.json({ 
            success: true,
            redirect: '/leaderboard'  // Added redirect to leaderboard
        });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ error: 'Error saving score' });
    }
});

app.get('/api/scores', requireAuth, async (req, res) => {
    try {
        const scores = await Score.find()
            .populate('userId', 'username')
            .sort({ score: -1, date: -1 })
            .limit(10);
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching scores' });
    }
});

// API endpoint to get option selection analytics
app.get('/api/analytics', requireAuth, async (req, res) => {
    try {
        const analytics = [];
        
        // Get all selections in one query
        const allSelections = await OptionSelection.find();
        
        // Create a map to store counts for each question
        const questionCounts = new Map();
        
        // Initialize counts for all questions
        for (let i = 0; i < quizQuestions.length; i++) {
            questionCounts.set(i, [0, 0, 0, 0]);
        }
        
        // Count selections in memory
        allSelections.forEach(selection => {
            const counts = questionCounts.get(selection.questionIndex);
            if (counts && selection.selectedOption >= 0) {
                counts[selection.selectedOption]++;
            }
        });
        
        // Build analytics response
        for (let i = 0; i < quizQuestions.length; i++) {
            const question = quizQuestions[i];
            const counts = questionCounts.get(i);
            const totalSelections = counts.reduce((sum, count) => sum + count, 0);
            
            analytics.push({
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                counts: counts,
                percentages: counts.map(count => 
                    totalSelections > 0 ? Math.round((count / totalSelections) * 100) : 0
                ),
                totalSelections: totalSelections
            });
        }
        
        res.json(analytics);
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Error fetching analytics' });
    }
});

// Route for analytics page
app.get('/analytics', requireAuth, (req, res) => {
    res.render('analytics');
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
        server.listen(PORT + 1);
    } else {
        console.error('Server error:', err);
    }
}); 