// Firebase Configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyApqICVa3NtIhonqbQhclLGtFr8FY5kKHE",
    authDomain: "skylark-express.firebaseapp.com",
    projectId: "skylark-express",
    storageBucket: "skylark-express.firebasestorage.app",
    messagingSenderId: "151268461042",
    appId: "1:151268461042:web:a708cb1c4be04978c5c36b",
    measurementId: "G-23LWL0Z4NY"
  };
  
// Initialize Firebase (guard against double init)
if (firebase.apps && firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
console.log('[firebase-config] Firebase apps:', firebase.apps.length);

// Initialize Firestore
const db = firebase.firestore();
console.log('[firebase-config] Firestore initialized');

// Initialize Firebase Storage
const storage = firebase.storage();
console.log('[firebase-config] Firebase Storage initialized');

// Export for use in other files
window.db = db;
window.storage = storage;

// Attempt anonymous auth (needed if rules require request.auth != null)
if (firebase.auth) {
  window.firebaseAuthReady = new Promise(resolve => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log('[firebase-config] Signed in anonymously. UID:', user.uid);
        resolve(user);
      }
    });
  });
  firebase.auth().signInAnonymously().catch(err => {
    console.warn('[firebase-config] Anonymous sign-in failed:', err);
    if (window.firebaseAuthReady) {
      // Resolve after short delay to avoid dangling promise
      setTimeout(() => window.firebaseAuthReady.then(()=>{}), 0);
    }
  });
} else {
  window.firebaseAuthReady = Promise.resolve(null);
  console.warn('[firebase-config] Auth SDK not available.');
}
