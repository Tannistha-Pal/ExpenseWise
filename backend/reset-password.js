const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function resetPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expensewise"
    );
    console.log("✅ MongoDB connected");

    const email = "tanvi15singla@gmail.com";
    const newPassword = "Test@123"; // Simple test password

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.error("❌ User not found with email:", email);
      await mongoose.connection.close();
      return;
    }

    console.log("✅ User found:", user.email);

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    console.log("✅ Password reset successfully!");
    console.log("");
    console.log("📝 LOGIN CREDENTIALS:");
    console.log("   Email:", email);
    console.log("   Password:", newPassword);
    console.log("");
    console.log("👉 Try logging in now with these credentials");

    // Test the password comparison
    const isMatch = await user.comparePassword(newPassword);
    console.log("✅ Verification test:", isMatch ? "PASSED ✅" : "FAILED ❌");

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

resetPassword();
