import admin from "firebase-admin";
import serviceAccount from "./service-key.json" with { type: "json" };

export interface CallNotificationPayload {
  fcmToken: string;
  callerName: string;
  calleeName: string;
}

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export async function sendCallNotification({ fcmToken, callerName, calleeName }: CallNotificationPayload): Promise<void> {
  const message: admin.messaging.Message = {
    token: fcmToken,

    data: {
      type: "incoming_call",
      caller_name: callerName,
      channel_id: "NENACALL_CALLING_CHANNEL",
    },

    android: {
      notification: {
        sound: "default",
        priority: "high",
      
        channelId: "NENACALL_CALLING_CHANNEL",
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Push Notification Sent to:", calleeName, response);
  } catch (error) {
    console.error("❌ Error Sending Notification:", error);
  }
}
