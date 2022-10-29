const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Must have name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Name should be less than or equal to 40 characters'],
      minlength: [10, 'Name should be more than or equal to 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    // rating: Number,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating should greater than or equal to 1.0'],
      max: [5, 'Rating should less than or equal to 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: { type: Number, required: [true, 'Must have price'] },
    priceDiscount: {
      type: Number,
      validate: {
        message: 'Discount price ({VALUE}) should be regular price',
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // save in db but not get by api
    },
    startDate: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// this virtual property save when get method/api call
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// document middleware: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', function (doc, next) {
//     console.log(doc)
//   next()
// })

//   const testTour = new Tour({
//     name: 'The Forest Hiker',
//     rating: 4.7,
//     price: 947
//   })

// Query middleware
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

//   testTour.save().then(doc=>console.log(doc)).catch(err=>console.log('Error 🧨', err))

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
