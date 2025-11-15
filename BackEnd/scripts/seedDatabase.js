require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Content = require('../src/models/Content');
const connectDB = require('../src/config/database');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Content.deleteMany({});

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@ottdashboard.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();

    // Create regular user
    const regularUser = new User({
      username: 'user',
      email: 'user@ottdashboard.com',
      password: 'user123',
      role: 'user'
    });
    await regularUser.save();

    // Create sample content
    const sampleContent = [
      {
        platform: 'Netflix',
        title: 'Stranger Things',
        selfDeclaredGenre: 'Sci-Fi Horror',
        assignedGenre: 'Sci-Fi',
        primaryLanguage: 'English',
        selfDeclaredFormat: 'Series',
        assignedFormat: 'TV Series',
        year: 2016,
        releaseDate: new Date('2016-07-15'),
        seasons: 4,
        episodes: 34,
        durationHours: 42,
        source: 'In-House',
        dubbing: {
          hindi: true,
          tamil: true,
          telugu: true,
          english: true
        },
        ageRating: 'U/A 16+',
        createdBy: adminUser._id
      },
      {
        platform: 'Amazon Prime',
        title: 'The Boys',
        selfDeclaredGenre: 'Superhero Action',
        assignedGenre: 'Action',
        primaryLanguage: 'English',
        selfDeclaredFormat: 'Series',
        assignedFormat: 'TV Series',
        year: 2019,
        releaseDate: new Date('2019-07-26'),
        seasons: 3,
        episodes: 24,
        durationHours: 24,
        source: 'Commissioned',
        dubbing: {
          hindi: true,
          english: true
        },
        ageRating: 'A',
        createdBy: adminUser._id
      },
      {
        platform: 'Disney+',
        title: 'The Mandalorian',
        selfDeclaredGenre: 'Space Western',
        assignedGenre: 'Sci-Fi',
        primaryLanguage: 'English',
        selfDeclaredFormat: 'Series',
        assignedFormat: 'TV Series',
        year: 2019,
        releaseDate: new Date('2019-11-12'),
        seasons: 3,
        episodes: 24,
        durationHours: 18,
        source: 'In-House',
        dubbing: {
          hindi: true,
          tamil: false,
          english: true
        },
        ageRating: 'U/A 13+',
        createdBy: adminUser._id
      },
      {
        platform: 'Hotstar',
        title: 'Arya',
        selfDeclaredGenre: 'Action Romance',
        assignedGenre: 'Action',
        primaryLanguage: 'Telugu',
        selfDeclaredFormat: 'Movie',
        assignedFormat: 'Movie',
        year: 2004,
        releaseDate: new Date('2004-05-07'),
        seasons: 1,
        episodes: 1,
        durationHours: 2.5,
        source: 'Co-Production',
        dubbing: {
          hindi: true,
          tamil: true,
          telugu: true,
          kannada: true
        },
        ageRating: 'U/A 13+',
        createdBy: adminUser._id
      },
      {
        platform: 'Zee5',
        title: 'Scam 1992',
        selfDeclaredGenre: 'Financial Drama',
        assignedGenre: 'Drama',
        primaryLanguage: 'Hindi',
        selfDeclaredFormat: 'Web Series',
        assignedFormat: 'Web Series',
        year: 2020,
        releaseDate: new Date('2020-10-09'),
        seasons: 1,
        episodes: 10,
        durationHours: 10,
        source: 'In-House',
        dubbing: {
          hindi: true,
          english: true,
          tamil: true,
          telugu: true
        },
        ageRating: 'U/A 16+',
        createdBy: adminUser._id
      }
    ];

    await Content.insertMany(sampleContent);

    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin User: admin@ottdashboard.com / admin123');
    console.log('👤 Regular User: user@ottdashboard.com / user123');
    console.log(`📊 Created ${sampleContent.length} sample content items`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
