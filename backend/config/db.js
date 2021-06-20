const mongoose = require('mongoose');

const connectDB = () => {
  const URI =
    'mongodb+srv://root:root@crepairs.jvkvh.mongodb.net/crepairs?retryWrites=true&w=majority';

  mongoose
    .connect(URI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => console.log('DB Connected'))
    .catch((err) => {
      console.log(err.message);
      process.exit(1);
    });
};

module.exports = connectDB;
