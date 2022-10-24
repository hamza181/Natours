const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs')
const Tour = require('./../../models/tourModel')

dotenv.config({ path: `./../../config.env`});
// dotenv.config({ path: `${__dirname}./../../config.env`});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
console.log(process.env) 

// const DB = ""
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connection)
    console.log('DB connect successfully');
  });

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}./tours-simple.json`, 'utf-8'))

// Import data into databse
const importData = async () => {
    try {
        await Tour.create(tours)
        console.log('Data successfully loaded')
    } catch (error) {
        console.log(error)
    }
}

// Delete all data from db
const deleteData = async () => {
    try {
        await Tour.deleteMany()
        console.log('Data successfully deleted')
    } catch (error) {
        console.log(error)
    }
}

console.log(process.argv)

