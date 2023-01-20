/**
 * mongoconn.js
 *
 * Connection to MongoDB Database. Allows for async
 * callbacks to the database
 */

const mongoose = require("mongoose");

module.exports = () => {
  const uri = process.env.MONGO_URI;

  const connectionsParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    mongoose.connect(uri, connectionsParams);
    console.log("Connected to database successfully");
  } catch (error) {
    console.log(error);
    console.log("Could not connect to database");
  }
};
