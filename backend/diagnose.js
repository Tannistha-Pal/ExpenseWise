const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function diagnoseLoginIssue() {
  let mongoConnected = false;

  try {
    // Try to connect to MongoDB
    console.log("🔍 Attempting to connect to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expensewise",
      { serverSelectionTimeoutMS: 5000 }
    );
    mongoConnected = true;
    console.log("✅ MongoDB connected successfully");

    const email = "tanvi15singla@gmail.com";
    console.log(`\n🔍 Checking for user with email: ${email}`);

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log(
        "Solution: You need to sign up first. Click 'Sign Up' on the login page."
      );
      await mongoose.connection.close();
      return;
    }

    console.log(`✅ User found: ${user.name} (${user.email})`);
    console.log(`   Password field exists: ${!!user.password}`);

    if (!user.password) {
      console.error(
        "❌ User password is empty. This account needs to be re-registered."
      );
      await mongoose.connection.close();
      return;
    }

    console.log(
      `   Password is hashed: ${/^\$2[aby]\$/.test(user.password) ? "Yes ✅" : "No (Legacy)"}`
    );

    // Test password comparison with a test password
    console.log("\n🔍 Testing password comparison...");
    console.log(
      "   (This test uses 'testpassword' - your actual password should work)"
    );

    const testResult = await user.comparePassword("testpassword");
    console.log(
      `   Test result: ${testResult ? "Matched (unexpected)" : "Did not match (expected)"}`
    );

    console.log("\n📋 Summary:");
    console.log("   - MongoDB: ✅ Running");
    console.log("   - User account: ✅ Exists");
    console.log("   - Password field: ✅ Set");

    console.log("\n💡 Next steps:");
    console.log("   1. Make sure you're using the CORRECT password");
    console.log("   2. Try resetting your password:");
    console.log("      - Click 'Forgot your password?' on the login page");
    console.log("   3. Or create a new account:");
    console.log("      - Click 'Sign Up' on the login page");

    await mongoose.connection.close();
  } catch (err) {
    if (!mongoConnected) {
      console.error("❌ MongoDB Connection Failed!");
      console.error(`   Error: ${err.message}`);
      console.log(
        "\n🔧 To fix this:"
      );
      console.log("   1. Make sure MongoDB is running locally:");
      console.log("      - Windows: Services > MongoDB Server");
      console.log("      - Or run: mongod");
      console.log("   2. Or check .env file has correct MONGODB_URI");
      process.exit(1);
    } else {
      console.error("❌ Diagnostic Error:", err.message);
      try {
        await mongoose.connection.close();
      } catch {}
      process.exit(1);
    }
  }
}

diagnoseLoginIssue();
