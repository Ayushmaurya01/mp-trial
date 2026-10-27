const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Base Route Verification
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Student Performance Tracker API is running cleanly',
    timestamp: new Date(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/units', require('./routes/unitRoutes'));
app.use('/api/topics', require('./routes/topicRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/lectures', require('./routes/lectureRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
