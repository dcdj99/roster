import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCGHpC_uujSGg3PYCnveizhEJsYGRi3Z5I",
  authDomain: "multi-location-daily-rostering.firebaseapp.com",
  projectId: "multi-location-daily-rostering",
  storageBucket: "multi-location-daily-rostering.firebasestorage.app",
  messagingSenderId: "216644928371",
  appId: "1:216644928371:web:c0516755474f4a92277b06",
  measurementId: "G-NS6Y0R6E79"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics };
