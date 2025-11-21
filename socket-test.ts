import { io } from 'socket.io-client';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTE1OTk3NDljYTVlM2JjYTIxOTRjZmYiLCJ0eXBlIjoiQ0xJRU5UIiwiaWF0IjoxNzYzNzMwMDQ0LCJleHAiOjE3NjQzMzQ4NDR9.mpP8qiqFScUkbklG4dB_VXy0sdfv0ey7vnVLD7nbjzs';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  auth:{token},

  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const conversationId = '6920639772cd0bce2155ebba';
const senderId = '691599749ca5e3bca2194cff';

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
        text: 'Hello from TS1 client! To TS2', // الرسالة النصية
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
