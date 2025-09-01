import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Callable function to grant a user admin privileges.
export const addAdminRole = functions.https.onCall(
  async (data, context) => {
    // Security Check: Ensure the user calling the function is an authenticated admin.
    // This single check handles both authentication and authorization.
    if (!context.auth || context.auth.token.admin !== true) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Request not authorized. User must be an admin to perform this action.'
      );
    }

    const email = data.email;
    try {
      // Find the user account by email.
      const user = await admin.auth().getUserByEmail(email);

      // Set the custom claim { admin: true } on their account.
      await admin
        .auth()
        .setCustomUserClaims(user.uid, { admin: true });

      return { message: `Success! ${email} has been made an admin.` };
    } catch (error) {
      console.error(error);
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred.'
      );
    }
  }
);
