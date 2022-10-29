// const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// check id middleware
// exports.checkId = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }
//   next();
// };

// check body middleware
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing Name or price',
//     });
//   }
//   next()
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // const query = Tour.find();

    // const query = Tour.find({
    //   duration: 5
    // });
    // const query = Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    /*  const queryObj = { ...req.query };

    // 1) Filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2) Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // { difficulty: 'easy', duration: { $gte: 5 } }
    // { difficulty: 'easy', duration: { gte: '5' } }

    let query = Tour.find(JSON.parse(queryStr)); */

    /* // 3) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    } */

    /* // 4) Fields limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('');
    } */

    /* // 5) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // page=2&limit=10     1-10, page 1,  11-20, page 2
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }
    // query.sort().select().skip().limit() */

    // execute query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // sending response
    res.status(200).json({
      success: 'success',
      result: tours.length,
      data: { tours },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      messaage: error,
    });
  }
};

exports.createTour = catchAsync(async (req, res, next) => {
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  // tours.push(newTour);

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: newTour,
  //       },
  //     });
  //   }
  // );

  // const newTour = new Tour({})
  // newTour.save()

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // const id = req.params.id * 1; // string multiply with number to convert
  // const tour = tours.find((x) => x.id === id);

  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    success: 'success',
    data: { tour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // console.log(`The user id is ${val}`);
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: 'difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPRice: { $min: '$price' },
        maxPRice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // 1 for ascending
    },
    /* {
        $match: { _id: { $ne: 'EASY' } },
      }, */
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $add: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addField: {
        month: '$_id',
      },
    },
    { $project: { _id: 0 } }, // id 0 means id not show
    { $sort: { numTourStart: -1 } }, // -1 means descending
    { $limit: 6 },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
