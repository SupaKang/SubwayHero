import firebase from "firebase/app";
import "firebase/firestore";

var firebaseConfig = {
  apiKey: "AIzaSyD4Jbqd9RgZd_AHeLNX-n",
  authDomain: "test-78694.firebaseapp.com",
  projectId: "test-78694",
  등 파이어베이스 콘솔에 있던 SDK 설정내용 ~~
};

firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();

// import {db} from './index.js'
// import "firebase/firestore"; 