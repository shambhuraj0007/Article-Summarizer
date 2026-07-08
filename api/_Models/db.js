const mongoose = require("mongoose");

const mongo_url = process.env.MONGO_URI;

if (!mongo_url) {
  console.warn("⚠️  MONGO_URI not set. Skipping MongoDB connection.");
} else {
  mongoose
    .connect(mongo_url)
    .then(() => {
      console.log("MongoDB Connected...");
    })
    .catch((err) => {
      console.log("MongoDB Connection Error: ", err);
    });
}

module.exports = mongoose;
