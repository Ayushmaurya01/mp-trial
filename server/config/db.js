const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_tracker';
    
    // Set connection timeout options
    const options = {
      serverSelectionTimeoutMS: 3000,
    };

    console.log(`Connecting to MongoDB at: ${connStr}...`);
    const conn = await mongoose.connect(connStr, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Standard MongoDB connection failed (${error.message}).`);
    console.log('Falling back to Mongo Memory Server for standalone execution...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected successfully at: ${conn.connection.host}`);
    } catch (memError) {
      console.error(`Error starting In-Memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
