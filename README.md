# Spectacular - Firebase

This git repository contains the project for the firebase portion of the Spectacular app. This project current only contains the source code for the cloud function that runs the user data API.

## User data API (`/functions`)

The user data API allows us to fetch and store user data in the a Firestore database within the same Firebase project. Currently, we store information such as user display names, links to cryptowallets and user liked events. <br \>

The API is implemented using Express.js and leverages the firebase admin sdk to handle authentication.

## Commands

To run these commands, you need have Firebase CLI installed (https://firebase.google.com/docs/cli).

### `firebase login`
Login to firebase

### `firebase emulators:start`
Start local firebase emulators to test locally (might not work with firebase auth)

### `firebase deploy`
Deploy to firebase