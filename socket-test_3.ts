import { io } from 'socket.io-client';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTE4ZGEyMzE4M2VhYWQ2NzJlNmE1YzEiLCJ0eXBlIjoiT1dORVIiLCJpYXQiOjE3NjM3MzM0OTMsImV4cCI6MTc2NDMzODI5M30.BQA20giSupJlwWoJ73kOE8uC1NS8pFnLsJqGme_N-p8';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  auth:{token},

  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const conversationId = '69206fb76b5b051a80a9e1a9';
const senderId = '6918da23183eaad672e6a5c1';

socket.on('connect', () => {
  console.log('🔥 Connected to Socket Server:', socket.id);

  // الانضمام إلى المحادثة
  socket.emit('joinConversation', { conversationId }, (res) => {
    // إرسال رسالة نصية
    socket.emit(
      'sendMessage',
      {
        conversationId,
        senderId,
        text: 'Hello from fares client! To You', // الرسالة النصية
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
