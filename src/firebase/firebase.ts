import firebase from '@firebase/app';
import { FirebaseFirestore } from '@firebase/firestore-types';
import '@firebase/firestore';
import '@firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBP_5Gk3Z5PkoxrdThW9o5UImLlH4bMBQw',
  authDomain: 'floss-9feb7.firebaseapp.com',
  databaseURL: 'https://floss-9feb7.firebaseio.com',
  projectId: 'floss-9feb7',
  storageBucket: 'floss-9feb7.appspot.com',
  messagingSenderId: '353010051983',
  appId: '1:353010051983:web:a4ecaf8209be60d9bd79fa',
};

// Initialize Cloud Firestore through Firebase
firebase.initializeApp(firebaseConfig);

const db = (firebase.firestore && firebase.firestore()) as FirebaseFirestore;

export default db;
