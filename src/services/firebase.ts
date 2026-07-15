import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export class FirebaseService {
  /**
   * Send Passwordless Email Magic Link
   */
  static async sendMagicLink(email: string): Promise<void> {
    const actionCodeSettings = {
      url: 'https://lengua.store/login', // Must be configured in Firebase Dynamic Links
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.launchfast.lengua',
      },
    };
    
    await auth().sendSignInLinkToEmail(email, actionCodeSettings);
  }

  /**
   * Verify the magic link and sign in
   */
  static async verifyMagicLinkAndSignIn(email: string, link: string): Promise<FirebaseUser | null> {
    const isSignIn = await auth().isSignInWithEmailLink(link);
    if (isSignIn) {
      const result = await auth().signInWithEmailLink(email, link);
      if (result.user) {
        return {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
        };
      }
    }
    return null;
  }

  /**
   * Live Firestore Sync
   * Syncs user state to Firestore database in the background.
   */
  static async syncUserData(uid: string, data: any): Promise<void> {
    try {
      await firestore().collection('users').doc(uid).set(data, { merge: true });
      console.log(`[Firebase] Successfully synced data for user ${uid}`);
    } catch (error) {
      console.error(`[Firebase] Error syncing data for user ${uid}:`, error);
    }
  }
}
