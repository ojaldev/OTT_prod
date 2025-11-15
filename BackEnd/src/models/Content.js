const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const contentSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: [true, 'Platform is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  selfDeclaredGenre: {
    type: String,
    trim: true
  },
  assignedGenre: {
    type: String
    //enum: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary', 'Animation', 'Crime', 'Other']
  },
  primaryLanguage: {
    type: String,
    required: [true, 'Primary language is required']
    //enum: ['Hindi','English','Marathi','Gujarati','Tamil','Punjabi','Telugu','Bengali','Kannada','Malayalam','Bhojpuri','Haryanvi','Urdu','Rajasthani','Other']
  },
  selfDeclaredFormat: {
    type: String,
    trim: true
  },
  assignedFormat: {
    type: String
    //enum: ['Series','Movie','Documentary','Reality Show','Short Film','Talk Show','Animation','Stand-up Comedy','Game Show','Comedy Show','Performative','Music Show','Poetry Show','Not Assigned']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [2030, 'Year cannot be in the future beyond 2030']
  },
  releaseDate: {
    type: Date
  },
  seasons: {
    type: Number,
    min: [0, 'Seasons cannot be negative'],
    default: 1
  },
  episodes: {
    type: Number,
    min: [0, 'Episodes cannot be negative']
  },
  durationHours: {
    type: Number,
    min: [0, 'Duration cannot be negative']
  },
  source: {
    type: String,
    //enum: ['In-House', 'Commissioned', 'Co-Production', 'NA', 'TBC'],
    default: 'TBD'
  },
  sourceFlags: {
    inHouse: { type: Boolean, default: false },
    commissioned: { type: Boolean, default: false },
    coProduction: { type: Boolean, default: false }
  },
  dubbing: {
    tamil: { type: Boolean, default: false },
    telugu: { type: Boolean, default: false },
    kannada: { type: Boolean, default: false },
    malayalam: { type: Boolean, default: false },
    hindi: { type: Boolean, default: false },
    punjabi: { type: Boolean, default: false },
    bengali: { type: Boolean, default: false },
    marathi: { type: Boolean, default: false },
    bhojpuri: { type: Boolean, default: false },
    gujarati: { type: Boolean, default: false },
    english: { type: Boolean, default: false },
    haryanvi: { type: Boolean, default: false },
    rajasthani: { type: Boolean, default: false },
    deccani: { type: Boolean, default: false },
    arabic: { type: Boolean, default: false }
  },
  totalDubbings: {
    type: Number,
    default: 0
  },
  ageRating: {
    type: String,
    default: 'Not Rated'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
contentSchema.index({ platform: 1 });
contentSchema.index({ year: -1 });
contentSchema.index({ assignedGenre: 1 });
contentSchema.index({ primaryLanguage: 1 });
contentSchema.index({ title: 'text', selfDeclaredGenre: 'text' });
contentSchema.index({ platform: 1, title: 1, year: 1 }, { unique: true });

// Add pagination plugin
contentSchema.plugin(mongoosePaginate);

// Pre-save middleware to calculate total dubbings
contentSchema.pre('save', function(next) {
  const dubbingValues = Object.values(this.dubbing);
  this.totalDubbings = dubbingValues.filter(Boolean).length;
  next();
});

// Virtual for content type detection
contentSchema.virtual('contentType').get(function() {
  return this.episodes && this.episodes > 1 ? 'Series' : 'Movie';
});

module.exports = mongoose.model('Content', contentSchema);
