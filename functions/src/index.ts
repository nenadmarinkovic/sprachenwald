import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions';

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

export const addAdminRole = onCall(async (request) => {
  if (request.auth?.token?.admin !== true) {
    logger.warn(
      'Unauthorized attempt to make an admin by:',
      request.auth?.uid
    );
    throw new HttpsError(
      'permission-denied',
      'Request not authorized. User must be an admin to perform this action.'
    );
  }

  const email = request.data.email;

  if (typeof email !== 'string' || email.length === 0) {
    throw new HttpsError(
      'invalid-argument',
      "The function must be called with a valid 'email' argument."
    );
  }

  try {
    const user = await admin.auth().getUserByEmail(email);

    if (user.customClaims?.admin === true) {
      logger.info(`${email} is already an admin.`);
      return { message: `${email} is already an admin.` };
    }

    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    logger.info(`Successfully made ${email} an admin.`);
    return { message: `Success! ${email} has been made an admin.` };
  } catch (error: any) {
    logger.error('Error setting custom claim:', error);

    if (error.code === 'auth/user-not-found') {
      throw new HttpsError(
        'not-found',
        `The user with the email ${email} was not found.`
      );
    }

    throw new HttpsError(
      'internal',
      'An error occurred while trying to make a user an admin.'
    );
  }
});
