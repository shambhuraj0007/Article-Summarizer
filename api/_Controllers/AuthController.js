const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../_Models/User");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({
          message: "User is already exist, you can login",
          success: false,
        });
    }
    const userModel = new UserModel({ name, email, password });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();
    res.status(201).json({
      message: "Signup successfully",
      success: true,
    });
  } catch (err) {
    console.error("🔥 Signup error:", err);
    res.status(500).json({
      message: "Internal server errror",
      success: false,
      error: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📥 Login request received:", { email, password }); // Debug

    const user = await UserModel.findOne({ email });
    console.log("🔎 User found:", user); // Debug

    const errorMsg = "Auth failed email or password is wrong";
    if (!user) {
      console.log("❌ No user found for email:", email);
      return res.status(403).json({ message: errorMsg, success: false });
    }

    const isPassEqual = await bcrypt.compare(password, user.password);
    console.log("🔑 Password match result:", isPassEqual); // Debug

    if (!isPassEqual) {
      console.log("❌ Wrong password for email:", email);
      return res.status(403).json({ message: errorMsg, success: false });
    }

    console.log("🔐 JWT_SECRET:", process.env.JWT_SECRET); // Debug

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log("✅ JWT generated successfully");

    res.status(200).json({
      message: "Login Success",
      success: true,
      jwtToken,
      email,
      name: user.name,
    });
  } catch (err) {
    console.error("🔥 Login error:", err); // Full error
    res.status(500).json({
      message: "Internal server error in authcontroller",
      success: false,
      error: err.message, // Show actual error for debugging
    });
  }
};

module.exports = {
  signup,
  login,
};
