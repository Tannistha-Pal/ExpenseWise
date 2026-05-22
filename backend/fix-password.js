const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function fixUserPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expensewise");
    console.log("✅ MongoDB connected");

    const email = "tanvi15singla@gmail.com";
    const newPassword = "your-new-password"; // User should provide this

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.error("❌ User not found with email:", email);
      await mongoose.connection.close();
      return;
    }

    console.log("User found:", user.email);
    console.log("Current password hash:", user.password.substring(0, 20) + "...");

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    console.log("✅ Password hashed and saved successfully");
    console.log("User can now log in with email:", email, "and their new password");

    // Test the password comparison
    const isMatch = await user.comparePassword(newPassword);
    console.log("✅ Password verification test:", isMatch ? "PASSED" : "FAILED");

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixUserPassword();
