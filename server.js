const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
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




const port = process.env.PORT || 5000;

// console.log(app.get('env'))
// console.log(process.env)

app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
