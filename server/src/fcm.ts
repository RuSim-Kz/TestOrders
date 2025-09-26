type FcmPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

import { GoogleAuth } from 'google-auth-library';

export async function sendFcmNotification(tokens: string[], payload: FcmPayload): Promise<void> {
  if (tokens.length === 0) return;
  try {
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/firebase.messaging'] });
    const client = await auth.getClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;
    if (!projectId) return;
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    await Promise.all(tokens.map(async (token) => {
      const body = {
        message: {
          token,
          notification: { title: payload.title, body: payload.body },
          data: payload.data ?? {}
        }
      };
      const res: any = await client.request({ url, method: 'POST', data: body });
      if (!res || res.status >= 400) {
        console.error('FCM v1 error', res);
      }
    }));
  } catch (e) {
    console.error('FCM v1 request failed', e);
  }
}


