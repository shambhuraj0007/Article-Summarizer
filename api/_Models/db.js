const mongoose = require("mongoose");

let mongo_url = process.env.MONGO_URI;

if (mongo_url) {
  // Strip any accidental surrounding quotes from the connection string
  mongo_url = mongo_url.trim().replace(/^["']|["']$/g, '');
}

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
