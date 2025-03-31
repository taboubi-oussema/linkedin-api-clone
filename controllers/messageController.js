const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// @desc    Get all conversations
// @route   GET /api/messages
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .sort({ updatedAt: -1 })
      .populate("participants", ["firstName", "lastName"])
      .populate("lastMessage");

    // Format conversations to show the other participant
    const formattedConversations = conversations.map((conversation) => {
      const otherParticipant = conversation.participants.find(
        (participant) => participant._id.toString() !== req.user.id
      );

      return {
        _id: conversation._id,
        otherParticipant,
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedConversations.length,
      data: formattedConversations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found or you are not a participant",
      });
    }

    // Get messages in conversation
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .sort({ createdAt: 1 })
      .populate("sender", ["firstName", "lastName"]);

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user.id },
        read: false,
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message
// @route   POST /api/messages/:receiverId
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    if (req.params.receiverId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: "You cannot send a message to yourself",
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(req.params.receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: "Receiver not found",
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, req.params.receiverId] },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, req.params.receiverId],
      });
    }

    // Create and save the message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      content: req.body.content,
    });

    // Update conversation's lastMessage and updatedAt
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    // Populate sender information
    await message.populate("sender", ["firstName", "lastName"]);

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    // Make sure user is message sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to delete this message",
      });
    }

    await message.remove();

    // If this was the lastMessage in conversation, update the lastMessage to the most recent one
    const conversation = await Conversation.findById(message.conversation);
    if (conversation && conversation.lastMessage.toString() === req.params.id) {
      const latestMessage = await Message.findOne({
        conversation: conversation._id,
      }).sort({ createdAt: -1 });

      if (latestMessage) {
        conversation.lastMessage = latestMessage._id;
      } else {
        conversation.lastMessage = undefined;
      }

      await conversation.save();
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
