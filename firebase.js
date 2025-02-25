import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/storage"
import { getStorage } from "firebase/storage";  // Import Storage from Firebase SDK

const firebaseConfig = {

  apiKey: "AIzaSyDXTBQgfGy5QcucUCkRcPB2TuehbCwF4e811",
  authDomain: "aimadein.firebaseapp.com",
  projectId: "aimadein",
  storageBucket: "aimadein.firebasestorage.app",
  messagingSenderId: "209904749229",
  appId: "1:209904749229:web:1009289f4ce2868192142411"

};


// Initialize Firebase
if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig)
}

export {firebase};



const app = initializeApp(firebaseConfig);  // Initialize Firebase App
const storage = getStorage(app);  // Get the Firebase Storage instance

export { storage };  // Export the storage for use in other parts of the app
