const express = require('express');
const router = express.Router();
const {
  getUserChats,
  getOrCreateChat,
  getChatMessages,
  sendMessage,
  markAsRead
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get all user chats
router.get('/', getUserChats);

// Create or get chat with mechanic
router.post('/', getOrCreateChat);

// Get messages for a chat
router.get('/:chatId/messages', getChatMessages);

// Send message to chat
router.post('/:chatId/messages', sendMessage);

// Mark messages as read
router.put('/:chatId/read', markAsRead);

module.exports = router;
