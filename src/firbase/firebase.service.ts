import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  onModuleInit() {
    // تحقق إذا Firebase مهيأ قبل كده
    if (!admin.apps.length) {
      // Firebase مش متهيأ، هنهيأه دلوقتي
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Firebase متهيأ بالفعل، استخدم الـ app الموجود
      this.firebaseApp = admin.app();
    }
  }

  // إرسال إشعار لجهاز واحد
  async sendNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: any,
  ) {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token: fcmToken,
      };

      const response = await admin.messaging().send(message);
      return { success: true, response };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }


  // دالة للحصول على Firebase App (optional)
  getApp(): admin.app.App {
    return this.firebaseApp;
  }
}