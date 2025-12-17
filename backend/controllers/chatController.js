const { FileDB } = require('../utils/fileDb');

const chatDB = new FileDB('chats.json');
const messageDB = new FileDB('messages.json');

// @desc    Get all chats for a user
// @route   GET /api/chats
// @access  Private
const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all chats where user is participant
    const chats = chatDB.find({}).filter(chat => 
      chat.participants.includes(userId)
    );
    
    // Get last message for each chat
    const chatsWithMessages = chats.map(chat => {
      const messages = messageDB.find({ chatId: chat._id });
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      
      return {
        ...chat,
        lastMessage
      };
    });
    
    res.json(chatsWithMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get or create chat with mechanic
// @route   POST /api/chats
// @access  Private
const getOrCreateChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mechanicId } = req.body;
    
    if (!mechanicId) {
      return res.status(400).json({ message: 'Mechanic ID is required' });
    }
    
    // Check if chat already exists
    let chat = chatDB.findOne({
      participants: { $all: [userId, mechanicId] }
    });
    
    // If not, create new chat
    if (!chat) {
      const participants = [userId, mechanicId].sort();
      chat = chatDB.create({
        participants,
        createdAt: new Date().toISOString()
      });
    }
    
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get messages for a chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    
    // Verify user is participant
    const chat = chatDB.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const messages = messageDB.find({ chatId }).sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send a message
// @route   POST /api/chats/:chatId/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text is required' });
    }
    
    // Verify user is participant
    const chat = chatDB.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const message = messageDB.create({
      chatId,
      senderId: userId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      read: false
    });
    
    // Update chat's last activity
    chatDB.update(chatId, {
      lastActivity: new Date().toISOString()
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chats/:chatId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    
    // Verify user is participant
    const chat = chatDB.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Mark all messages from other user as read
    const messages = messageDB.find({ chatId });
    messages.forEach(msg => {
      if (msg.senderId !== userId && !msg.read) {
        messageDB.update(msg._id, { read: true });
      }
    });
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserChats,
  getOrCreateChat,
  getChatMessages,
  sendMessage,
  markAsRead
};
