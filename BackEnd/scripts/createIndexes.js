require('dotenv').config();
const mongoose = require('mongoose');
const Content = require('../src/models/Content');
const User = require('../src/models/User');
const connectDB = require('../src/config/database');

async function createIndexes() {
  try {
    await connectDB();

    console.log('Creating database indexes...');

    // Content collection indexes
    await Content.collection.createIndex({ platform: 1, year: -1 });
    await Content.collection.createIndex({ assignedGenre: 1, primaryLanguage: 1 });
    await Content.collection.createIndex({ year: -1, createdAt: -1 });
    await Content.collection.createIndex({ totalDubbings: -1 });
    await Content.collection.createIndex({ 
      title: 'text', 
      selfDeclaredGenre: 'text', 
      assignedGenre: 'text' 
    });

    // User collection indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1, isActive: 1 });

    console.log('✅ Indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();
