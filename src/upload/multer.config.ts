import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  }),
};

export const multerImageChatOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads'; // ← غيّرنا ده
      if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `chat-img-${unique}${extname(file.originalname)}`); // ← أضفنا prefix
    },
  }),
};

export const multerVoiceChatOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads'; // ← غيّرنا ده
      if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `chat-voice-${unique}${extname(file.originalname)}`); // ← أضفنا prefix
    },
  }),
};