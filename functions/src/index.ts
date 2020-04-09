import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const verify = (request: any): boolean => {
    return request.method === 'POST' && !!request.body.value;
}

export const helloWorld = functions.https.onRequest(async (request, response) => {
 if (!verify(request)) {
  response.status(400).send('nope');
 }
 await admin.firestore().collection('/temperature').add({
     value: request.body.value,
     created: admin.firestore.FieldValue.serverTimestamp()
 });
 response.status(200).send('OK');
});

