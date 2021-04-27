const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log(`MongoDB is connected to ${conn.connection.host}`);
  } catch (error) {
    console.log({
      error: "Fatal error, please contact site admin for resolution...!",
    });
    process.exit(1);
  }
};

module.exports = connectDB;
