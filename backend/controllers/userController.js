const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { FileDB } = require('../utils/fileDb');
const path = require('path');
const fs = require('fs');

const userDB = new FileDB('users.json');
const adminDB = new FileDB('admins.json');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, nationalId, address, age, vehicleType, isMechanic, workLocation } = req.body;

    console.log('Registration attempt:', { name, email, phone, nationalId, address, age, vehicleType, isMechanic, workLocation });

    if (!name || !email || !password || !phone || !nationalId || !address || !age || !vehicleType) {
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: {
          name: !name,
          email: !email,
          password: !password,
          phone: !phone,
          nationalId: !nationalId,
          address: !address,
          age: !age,
          vehicleType: !vehicleType
        }
      });
    }

    if (isMechanic === 'true' || isMechanic === true) {
      if (!workLocation) {
        return res.status(400).json({ message: 'Work location is required for mechanics' });
      }
    }

    const emailExists = userDB.findOne({ email });
    if (emailExists) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const nationalIdExists = userDB.findOne({ nationalId });
    if (nationalIdExists) {
      console.log('National ID already exists:', nationalId);
      return res.status(400).json({ message: 'National ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      nationalId,
      address,
      age: parseInt(age) || 0,
      vehicleType,
      isMechanic: isMechanic === 'true' || isMechanic === true,
      isAdmin: false,
      photo: req.file ? `/uploads/users/${req.file.filename}` : '',
    };

    if (userData.isMechanic && workLocation) {
      try {
        userData.workLocation = typeof workLocation === 'string' ? JSON.parse(workLocation) : workLocation;
      } catch (e) {
        userData.workLocation = workLocation;
      }
    }

    const user = userDB.create(userData);

    if (user) {
      console.log('User created successfully:', user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isMechanic: user.isMechanic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = userDB.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isMechanic: user.isMechanic,
        isAdmin: user.isAdmin || false,
        token: generateToken(user._id),
      });
    } else {
      const admins = adminDB.findAll();
      const admin = admins.find(a => a.national_id === email && a.Password === password);
      
      if (admin) {
        res.json({
          _id: admin._id || admin.national_id,
          name: 'Admin',
          email: admin.national_id,
          isMechanic: false,
          isAdmin: true,
          token: generateToken(admin._id || admin.national_id),
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = userDB.findById(req.user._id);

    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = userDB.findById(req.user._id);

    if (user) {
      const updates = {
        name: req.body.name || user.name,
        email: req.body.email || user.email,
        phone: req.body.phone || user.phone,
        address: req.body.address || user.address,
        age: req.body.age ? parseInt(req.body.age) : user.age,
        vehicleType: req.body.vehicleType || user.vehicleType,
      };

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(req.body.password, salt);
      }

      if (req.file) {
        if (user.photo) {
          const oldPhotoPath = path.join(__dirname, '..', user.photo);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        updates.photo = `/uploads/users/${req.file.filename}`;
      }

      const updatedUser = userDB.update(req.user._id, updates);

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isMechanic: updatedUser.isMechanic,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all mechanics
// @route   GET /api/users/mechanics
// @access  Public
const getMechanics = async (req, res) => {
  try {
    const mechanics = userDB.find({ isMechanic: true });
    const mechanicsWithoutPassword = mechanics.map(({ password, ...rest }) => rest);
    res.json(mechanicsWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const users = userDB.findAll();
    const usersWithoutPassword = users.map(({ password, ...rest }) => rest);
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = userDB.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin accounts
    if (user.isAdmin) {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }

    userDB.delete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getMechanics,
  getAllUsers,
  deleteUser,
};
