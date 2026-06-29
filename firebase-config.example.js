(function () {
  const FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  };

  const ADMIN_EMAIL = "admin@example.com";

  window.FIREBASE_CONFIG = FIREBASE_CONFIG;
  window.ADMIN_EMAIL = ADMIN_EMAIL;

  if (typeof firebase !== "undefined" && firebase.initializeApp) {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    if (firebase.auth) {
      firebase.auth()
        .setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .catch((err) => console.error("Failed to set auth persistence:", err));
    }
  }
})();
