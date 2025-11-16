import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import toStream = require('buffer-to-stream');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

@Injectable()
export class CloudinaryService {
  // ✅ رفع صورة مباشرة من base64
  async uploadImageFromBase64(base64: string, folder = 'images', publicId?: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(
       base64,
        {
          folder,
          public_id: publicId,
          use_filename: true,
          quality: 'auto:good',
          fetch_format: 'auto',
        },
      );

      if (!result) throw new Error('No result returned from Cloudinary');
      return result.secure_url;
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  // ✅ رفع صورة من buffer (مثلاً لو جايه من form-data أو sharp)
  uploadBuffer(buffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {

      const uploadStream = cloudinary.uploader.upload_stream(

        { folder },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No result returned from Cloudinary'));
          resolve(result.secure_url);
        },
      );


      

      toStream(buffer).pipe(uploadStream);
    });
  }
}
