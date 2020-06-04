/* eslint-disable */
import * as firebase from 'firebase';

var firebaseConfig = {
    apiKey: "AIzaSyBmkB5ymuRUsEmlDIRINn0Q7PAxxw1uOck",
    authDomain: "chat-app-99067.firebaseapp.com",
    databaseURL: "https://chat-app-99067.firebaseio.com",
    projectId: "chat-app-99067",
    storageBucket: "chat-app-99067.appspot.com",
    messagingSenderId: "178390971762",
    appId: "1:178390971762:web:ec3ced6b455633f61859eb"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;