// Firebase configuration (replace with your actual project settings)
// IMPORTANT: For production restrict API key usage via Firebase console.
const firebaseConfig = {
	apiKey: "YOUR_API_KEY",
	authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
	projectId: "YOUR_PROJECT_ID",
	storageBucket: "YOUR_PROJECT_ID.appspot.com",
	messagingSenderId: "YOUR_SENDER_ID",
	appId: "YOUR_APP_ID"
};

// Initialize only once
if (typeof firebase !== 'undefined' && firebase.apps?.length === 0) {
	firebase.initializeApp(firebaseConfig);
}

// Expose Firestore database globally
try {
	if (typeof firebase !== 'undefined') {
		window.db = firebase.firestore();
	}
} catch (e) {
	console.warn('Firestore init failed:', e);
}

// Provide a lightweight mock for local offline development if Firestore not available
if (!window.db) {
	console.info('[firebase-config] Firestore not available. Using mock DB.');
	window.db = {
		collection: () => ({
			doc: () => ({
				get: async () => ({ exists: false })
			})
		})
	};
}
