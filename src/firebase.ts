import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAe1Ut_zakz_CvOP17fAzt6Iel98_9wy6I",
  authDomain: "electrical-network-8c761.firebaseapp.com",
  projectId: "electrical-network-8c761",
  storageBucket: "electrical-network-8c761.firebasestorage.app",
  messagingSenderId: "54393435938",
  appId: "1:54393435938:web:71d9faddec0c556ecf977b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
