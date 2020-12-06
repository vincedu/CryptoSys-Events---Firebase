const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors')

// Follow instructions to set up admin credentials:
// https://firebase.google.com/docs/functions/local-emulator#set_up_admin_credentials_optional
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

const app = express();
 
app.use(cors());

// Source: https://github.com/firebase/functions-samples/blob/master/authenticated-json-api/functions/index.js
// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const authenticate = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        res.status(403).send('Unauthorized');
        return;
    }
    const idToken = req.headers.authorization.split('Bearer ')[1];
    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedIdToken;
        next();
        return;
    } catch(e) {
        res.status(403).send('Unauthorized');
        return;
    }
};

// app.use(authenticate);

app.post('/user/data', authenticate, async (req, res) => {
    try {
        const displayName = req.body.displayName;
        const walletAccountName = req.body.walletAccountName;
        const walletAuthType = req.body.walletAuthType;
        const result = await admin.firestore().collection('users').doc(req.user.uid).set({
            displayName: displayName,
            walletAccountName: walletAccountName,
            walletAuthType: walletAuthType,
        }, {merge: true});

        res.status(201).json({result});
    } catch(error) {
        res.sendStatus(500);
    }
});

app.get('/user/data', authenticate, async (req, res) => {
    try {
        const usersRef = admin.firestore().collection('users').doc(req.user.uid);
        const userDoc = await usersRef.get();
        if (!userDoc.exists) {
            res.status(404).json({errorCode: 404, errorMessage: 'User not found'});
        } else {
            const userData = userDoc.data();
            if (!userData.walletAccountName) {
                res.status(404).json({errorCode: 404, errorMessage: 'Wallet account name not found'});
            } else {
                res.status(200).json(userData);
            }
        }
    } catch(error) {
        res.sendStatus(500);
    }
});

app.get('/user/:id', async (req, res) => {
    try {
        const usersRef = admin.firestore().collection('users').doc(req.params.id);
        const userDoc = await usersRef.get();
        if (!userDoc.exists) {
            res.status(404).json({errorCode: 404, errorMessage: 'User not found'});
        } else {
            const userData = userDoc.data();
            if (!userData.displayName) {
                res.status(404).json({errorCode: 404, errorMessage: 'User display name not found'});
            } else {
                res.status(200).json({ displayName: userData.displayName });
            }
        }
    } catch(error) {
        res.sendStatus(500);
    }
});

app.post('/user/like', authenticate, async (req, res) => {
    try {
        const result = await admin.firestore().collection('users').doc(req.user.uid).update({
            liked: admin.firestore.FieldValue.arrayUnion(req.body.id)
        });
        res.status(201).json({result});
    } catch(error) {
        res.sendStatus(500);
    }
});

app.post('/user/unlike', authenticate, async (req, res) => {
    try {
        const result = await admin.firestore().collection('users').doc(req.user.uid).update({
            liked: admin.firestore.FieldValue.arrayRemove(req.body.id)
        });
        res.status(201).json({result});
    } catch(error) {
        res.sendStatus(500);
    }
});

exports.api = functions.https.onRequest(app);
