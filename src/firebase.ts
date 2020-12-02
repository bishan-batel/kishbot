import * as admin from "firebase-admin";
const serviceAccount = require("./key.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://bishbot-1606814046634.firebaseio.com",
});
export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
export default admin;
