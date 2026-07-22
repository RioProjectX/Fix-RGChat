import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

let db: any = null;

try {
  if (firebaseConfig && firebaseConfig.projectId) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const dbId = (firebaseConfig as any).firestoreDatabaseId;
    if (dbId && dbId !== "(default)") {
      db = getFirestore(app, dbId);
    } else {
      db = getFirestore(app);
    }
    console.log("[Client Firebase] Firestore initialized successfully.");
  }
} catch (err) {
  console.error("[Client Firebase] Initialization error:", err);
}

export { db, doc, onSnapshot, setDoc, getDoc };
