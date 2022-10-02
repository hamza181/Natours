const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must have name'],
    unique: true,
  },
  // rating: Number,
  rating: {
    type: Number,
    default: 4.5,
  },
  price: { type: Number, required: [true, 'Must have price'] },
});

//   const testTour = new Tour({
//     name: 'The Forest Hiker',
//     rating: 4.7,
//     price: 947
//   })

//   testTour.save().then(doc=>console.log(doc)).catch(err=>console.log('Error 🧨', err))

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
