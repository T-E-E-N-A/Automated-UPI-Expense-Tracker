const User = require('../models/User')
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const jwt = require('jsonwebtoken')
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

async function registerUser(req, res) {
  const { name, email, password } = req.body;
  bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(password,salt,async (err,hash)=>{
        const newUser = await User.create({ name, email, password:hash })

        let token = jwt.sign({email} , process.env.SECRET)
        // res.cookie("token",token);
        res.cookie("token", token, {
            httpOnly: true,   // prevents JS access (safer)
            secure: false,    // set true in production with HTTPS
            sameSite: "lax",  // allows cookie on same-site navigation
        });
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    })
  })
}

// ---------------- Login ----------------
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate token
    const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: "1d" });

    // Send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // change to true in production
      sameSite: "lax",
    });

    res.json({ message: "Login successful", user });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// ---------------- Logout ----------------
function logOut(req, res) {
  try {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


module.exports = {registerUser , loginUser , logOut}