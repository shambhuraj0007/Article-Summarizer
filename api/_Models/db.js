const mongoose = require("mongoose");

let mongoUrl = process.env.MONGO_URI;

if (mongoUrl) {
  mongoUrl = mongoUrl.trim().replace(/^['"]|['"]$/g, "");
}

if (!mongoUrl) {
  console.warn("⚠️  MONGO_URI not set. Skipping MongoDB connection.");
} else {
  mongoose.set("strictQuery", true);

  mongoose
    .connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
      autoIndex: true,
    })
    .then(() => {
      console.log("MongoDB Connected...");
    })
    .catch((err) => {
      console.error("MongoDB Connection Error: ", err.message);
    });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting reconnect...");
  });
}

module.exports = mongoose;
