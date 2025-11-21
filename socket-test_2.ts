import { io } from 'socket.io-client';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTFiNmY5MWViZmRlYTFiMWQxZTQ1YzUiLCJ0eXBlIjoiT1dORVIiLCJpYXQiOjE3NjM3MzI3MDksImV4cCI6MTc2NDMzNzUwOX0.jcXpnjlKE2L5bqufzb2cUEzbgat6j8zOPp4LF6_91Qs';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  auth:{token},

  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const conversationId = '6920639772cd0bce2155ebba';
const senderId = '691b6f91ebfdea1b1d1e45c5';

socket.on('connect', () => {
  console.log('🔥 Connected to Socket Server:', socket.id);

  // الانضمام إلى المحادثة
  socket.emit('joinConversation', { conversationId }, (res) => {
    console.log('👥 Joined conversation:', res);

    // إرسال رسالة نصية
    socket.emit(
      'sendMessage',
      {
        conversationId,
        senderId,
        text: 'Hello from TS2 client to TS1!', // الرسالة النصية
        type: 'TEXT',                  // نوع الرسالة
      }
    );
  });
});

// استماع للرسائل الجديدة من السيرفر
socket.on('newMessage', (msg) => {
  console.log('📩 New message received:', msg.text);
});

// استماع لأخطاء الاتصال
socket.on('connect_error', (err) => {
  console.log('❌ Connection Error:', err.message);
});

// الانفصال
socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected from server. Reason:', reason);
});
