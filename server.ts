import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import firebaseConfigJson from "./firebase-applet-config.json";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path for persistent database (supports Vercel Serverless /tmp)
const DB_DIR = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Ensure db directory exists safely without throwing EROFS on read-only serverless environments
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Could not create DB_DIR, running in memory mode:", e);
}

// Initial default state
const DEFAULT_STATE = {
  relationshipStartDate: "2023-10-15",
  partner1: {
    name: "Grace",
    avatar: "female-1",
    address: "Rumah: Jl. Margonda Raya No. 12, Depok",
    office: "Kampus: Universitas Indonesia",
    bio: "Selalu bahagia bersamamu 💖"
  },
  partner2: {
    name: "Rio",
    avatar: "male-1",
    address: "Rumah: Jl. Kemang Raya No. 45, Jakarta Selatan",
    office: "Kantor: Menara BCA, Grand Indonesia",
    bio: "Menjaga dan mencintaimu selamanya 🌸"
  },
  notes: "",
  todos: [],
  calendarEvents: [],
  chatMessages: [],
  memories: [],
  mapPins: [],
  loveCapsules: [],
  safeArrivals: [],
  notifications: [],
  activeCall: null,
  liveLocations: {
    Grace: {
      user: "Grace",
      lat: -6.3686,
      lng: 106.8322,
      accuracy: 15,
      updatedAt: new Date().toISOString(),
      isSharing: true,
      addressName: "Jl. Margonda Raya, Depok",
      statusNote: "Kuliah di Kampus UI 📚",
      batteryLevel: 88
    },
    Rio: {
      user: "Rio",
      lat: -6.2615,
      lng: 106.8152,
      accuracy: 12,
      updatedAt: new Date().toISOString(),
      isSharing: true,
      addressName: "Kemang Raya, Jakarta Selatan",
      statusNote: "Di kantor Menara BCA 💻",
      batteryLevel: 94
    }
  }
};

// Initialize Firebase Web SDK
let firestoreDb: any = null;
let isFirebaseConnected = false;

try {
  let firebaseConfig: any = firebaseConfigJson;
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  }

  if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey) {
    const fbApp = getApps().length
      ? getApp()
      : initializeApp({
          apiKey: firebaseConfig.apiKey,
          authDomain: firebaseConfig.authDomain,
          projectId: firebaseConfig.projectId,
          storageBucket: firebaseConfig.storageBucket,
          messagingSenderId: firebaseConfig.messagingSenderId,
          appId: firebaseConfig.appId
        });
    
    const dbId = firebaseConfig.firestoreDatabaseId;
    if (dbId && dbId !== "(default)") {
      firestoreDb = getFirestore(fbApp, dbId);
    } else {
      firestoreDb = getFirestore(fbApp);
    }
    isFirebaseConnected = true;
    console.log(`[Firebase] Firestore Web SDK initialized with project '${firebaseConfig.projectId}' (database: '${dbId || "default"}').`);
  } else {
    console.log("[Firebase] firebase-applet-config.json not found or missing credentials.");
  }
} catch (error) {
  console.error("[Firebase] Error initializing Firebase SDK:", error);
}

let localCacheState = DEFAULT_STATE;

// Seed initial cache on startup synchronously so there is always a baseline
try {
  if (fs.existsSync(DB_FILE)) {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    localCacheState = JSON.parse(content);
  } else {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_STATE, null, 2), "utf-8");
    } catch (e) {}
  }
} catch (error) {
  console.error("Error reading initial database cache:", error);
}

// Helper to read database state (Firebase Firestore with Local File fallback)
async function readDb(): Promise<any> {
  if (firestoreDb && isFirebaseConnected) {
    try {
      const docRef = doc(firestoreDb, "couple_state", "default");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.state) {
          localCacheState = data.state;
          try {
            fs.writeFileSync(DB_FILE, JSON.stringify(localCacheState, null, 2), "utf-8");
          } catch (e) {}
          return localCacheState;
        }
      } else {
        console.log("[Firebase] Document 'default' not found in Firestore. Seeding default state...");
        await setDoc(docRef, {
          state: localCacheState,
          updatedAt: new Date().toISOString()
        });
        return localCacheState;
      }
    } catch (error: any) {
      console.error("[Firebase] Firestore read failed, using local cache:", error.message || error);
    }
  }
  return localCacheState;
}

// Helper to write database state (Firebase Firestore with Local File fallback)
async function writeDb(data: any): Promise<void> {
  localCacheState = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing local backup:", error);
  }

  if (firestoreDb && isFirebaseConnected) {
    try {
      const docRef = doc(firestoreDb, "couple_state", "default");
      await setDoc(docRef, {
        state: data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log("[Firebase] State successfully saved to Firestore.");
    } catch (error: any) {
      console.error("[Firebase] Firestore save failed:", error.message || error);
    }
  }
}

// API Router
const apiRouter = express.Router();

// 1. Get current full state
apiRouter.get("/state", async (req, res) => {
  const { user } = req.query;
  const db = await readDb();
  
  if (user === "Grace" || user === "Rio") {
    const now = new Date();
    const lastActiveKey = user === "Grace" ? "lastActiveGrace" : "lastActiveRio";
    const lastActiveVal = db[lastActiveKey];
    
    if (!lastActiveVal || (now.getTime() - new Date(lastActiveVal).getTime() >= 10000)) {
      const nowStr = now.toISOString();
      db[lastActiveKey] = nowStr;
      await writeDb(db);
    }
  }
  
  res.json(db);
});

// Fallback for root route in serverless router
apiRouter.get("/", async (req, res) => {
  const db = await readDb();
  res.json(db);
});

// Database status check endpoint
apiRouter.get("/db-status", async (req, res) => {
  res.json({
    firebaseConnected: isFirebaseConnected,
    activeStorage: isFirebaseConnected ? "Firebase Firestore Cloud ⚡" : "Local db.json",
    message: isFirebaseConnected 
      ? "Firebase Firestore database terhubung dan aktif! Semua data obrolan & pasangan tersimpan aman di Cloud Firestore." 
      : "Firebase belum terkonfigurasi. Menggunakan penyimpanan lokal db.json."
  });
});

// 2. Update relationship anniversary start date
apiRouter.post("/relationship-start-date", async (req, res) => {
  const { date } = req.body;
  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }
  const db = await readDb();
  db.relationshipStartDate = date;
  await writeDb(db);
  res.json({ success: true, state: db });
});

// 3. Update partner profile
apiRouter.post("/partners", async (req, res) => {
  const { partner1, partner2 } = req.body;
  const db = await readDb();
  if (partner1) db.partner1 = { ...db.partner1, ...partner1 };
  if (partner2) db.partner2 = { ...db.partner2, ...partner2 };
  await writeDb(db);
  res.json({ success: true, state: db });
});

// 4. Update shared notes
apiRouter.post("/notes", async (req, res) => {
  const { notes } = req.body;
  const db = await readDb();
  db.notes = notes;
  await writeDb(db);
  res.json({ success: true, state: db });
});

// 5. Add a to-do list item
apiRouter.post("/todos", async (req, res) => {
  const { text, dueDate, reminder, createdBy } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }
  const db = await readDb();
  const newTodo = {
    id: "todo-" + Date.now(),
    text,
    completed: false,
    completedBy: "",
    dueDate: dueDate || "",
    reminder: !!reminder,
    createdBy: createdBy || "Anonymous",
    createdAt: new Date().toISOString()
  };
  db.todos.unshift(newTodo);
  await writeDb(db);
  res.json({ success: true, todo: newTodo, state: db });
});

// 6. Toggle/edit a to-do item
apiRouter.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { completed, completedBy } = req.body;
  const db = await readDb();
  const todoIndex = db.todos.findIndex((t: any) => t.id === id);
  if (todoIndex > -1) {
    db.todos[todoIndex].completed = completed;
    db.todos[todoIndex].completedBy = completed ? (completedBy || "Partner") : "";
    await writeDb(db);
    return res.json({ success: true, todo: db.todos[todoIndex], state: db });
  }
  res.status(404).json({ error: "Todo not found" });
});

// 7. Delete a to-do item
apiRouter.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const db = await readDb();
  db.todos = db.todos.filter((t: any) => t.id !== id);
  await writeDb(db);
  res.json({ success: true, state: db });
});

// 8. Add a calendar event
apiRouter.post("/calendar-events", async (req, res) => {
  const { title, type, date, description, createdBy } = req.body;
  if (!title || !date || !type) {
    return res.status(400).json({ error: "Title, type and date are required" });
  }
  const db = await readDb();
  const newEvent = {
    id: "event-" + Date.now(),
    title,
    type,
    date,
    description: description || "",
    createdBy: createdBy || "System"
  };
  db.calendarEvents.push(newEvent);
  // Sort calendar events chronologically by date
  db.calendarEvents.sort((a: any, b: any) => a.date.localeCompare(b.date));
  await writeDb(db);
  res.json({ success: true, event: newEvent, state: db });
});

// 9. Delete a calendar event
apiRouter.delete("/calendar-events/:id", async (req, res) => {
  const { id } = req.params;
  const db = await readDb();
  db.calendarEvents = db.calendarEvents.filter((e: any) => e.id !== id);
  await writeDb(db);
  res.json({ success: true, state: db });
});

// 10. Send a Chat Message & auto-parse media for Galeri Media
apiRouter.post("/chat-message", async (req, res) => {
  const { sender, text, mediaUrl, mediaType } = req.body;
  if (!text && !mediaUrl) {
    return res.status(400).json({ error: "Text or media is required" });
  }
  const db = await readDb();
  const newMsg = {
    id: "msg-" + Date.now(),
    sender,
    text: text || "",
    timestamp: new Date().toISOString(),
    isFavorited: false,
    mediaUrl: mediaUrl || "",
    mediaType: mediaType || (mediaUrl ? "image" : ""),
    isRead: false
  };
  db.chatMessages.push(newMsg);
  await writeDb(db);
  res.json({ success: true, message: newMsg, state: db });
});

// 10b. Mark messages as read by partner
apiRouter.post("/chat-message/read", async (req, res) => {
  const { user } = req.body;
  if (!user) {
    return res.status(400).json({ error: "User is required" });
  }
  const db = await readDb();
  const otherUser = user === "Grace" ? "Rio" : "Grace";
  let updated = false;
  if (db.chatMessages && Array.isArray(db.chatMessages)) {
    db.chatMessages.forEach((msg: any) => {
      if (msg.sender === otherUser && !msg.isRead) {
        msg.isRead = true;
        updated = true;
      }
    });
  }
  if (updated) {
    await writeDb(db);
  }
  res.json({ success: true, state: db });
});

// 11. Toggle message favorite (Pesan Favorit)
apiRouter.post("/chat-message/:id/favorite", async (req, res) => {
  const { id } = req.params;
  const db = await readDb();
  const msgIndex = db.chatMessages.findIndex((m: any) => m.id === id);
  if (msgIndex > -1) {
    db.chatMessages[msgIndex].isFavorited = !db.chatMessages[msgIndex].isFavorited;
    await writeDb(db);
    return res.json({ success: true, message: db.chatMessages[msgIndex], state: db });
  }
  res.status(404).json({ error: "Message not found" });
});

// Helper for formatting duration
function formatCallSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// 12a. Start a call
apiRouter.post("/call/start", async (req, res) => {
  const { caller, type } = req.body;
  if (!caller) return res.status(400).json({ error: "Caller is required" });
  const receiver = caller === "Grace" ? "Rio" : "Grace";
  const db = await readDb();

  db.activeCall = {
    id: "call_" + Date.now(),
    caller,
    receiver,
    type: type === "video" ? "video" : "audio",
    status: "calling",
    createdAt: new Date().toISOString()
  };

  await writeDb(db);
  res.json({ success: true, activeCall: db.activeCall, state: db });
});

// 12b. Answer call
apiRouter.post("/call/answer", async (req, res) => {
  const { user } = req.body;
  const db = await readDb();
  if (db.activeCall && db.activeCall.receiver === user && db.activeCall.status === "calling") {
    db.activeCall.status = "connected";
    db.activeCall.startedAt = new Date().toISOString();
    await writeDb(db);
    return res.json({ success: true, activeCall: db.activeCall, state: db });
  }
  res.status(400).json({ error: "No active call to answer" });
});

// 12c. Decline call
apiRouter.post("/call/decline", async (req, res) => {
  const db = await readDb();
  if (db.activeCall) {
    const callTypeLabel = db.activeCall.type === "video" ? "Video" : "Suara";
    const newMsg = {
      id: "msg_" + Date.now(),
      sender: db.activeCall.caller,
      text: `📞 Panggilan ${callTypeLabel} Ditolak`,
      timestamp: new Date().toISOString(),
      isFavorited: false,
      mediaUrl: "",
      mediaType: "",
      isRead: false
    };
    if (!db.chatMessages) db.chatMessages = [];
    db.chatMessages.push(newMsg);
    db.activeCall = null;
    await writeDb(db);
  }
  res.json({ success: true, state: db });
});

// 12d. End call
apiRouter.post("/call/end", async (req, res) => {
  const { user, durationSeconds } = req.body;
  const db = await readDb();
  if (db.activeCall) {
    const currentCall = db.activeCall;
    const callTypeLabel = currentCall.type === "video" ? "Video" : "Suara";
    
    if (currentCall.status === "connected") {
      const dur = (durationSeconds && durationSeconds > 0) ? Number(durationSeconds) : 0;
      const newMsg = {
        id: "msg_" + Date.now(),
        sender: currentCall.caller,
        text: `📞 Panggilan ${callTypeLabel} Selesai (${formatCallSec(dur)})`,
        timestamp: new Date().toISOString(),
        isFavorited: false,
        mediaUrl: "",
        mediaType: "",
        isRead: false
      };
      if (!db.chatMessages) db.chatMessages = [];
      db.chatMessages.push(newMsg);
    } else if (currentCall.status === "calling") {
      const newMsg = {
        id: "msg_" + Date.now(),
        sender: currentCall.caller,
        text: `📞 Panggilan ${callTypeLabel} Batal / Tak Terjawab`,
        timestamp: new Date().toISOString(),
        isFavorited: false,
        mediaUrl: "",
        mediaType: "",
        isRead: false
      };
      if (!db.chatMessages) db.chatMessages = [];
      db.chatMessages.push(newMsg);
    }
    db.activeCall = null;
    await writeDb(db);
  }
  res.json({ success: true, state: db });
});

// 12. Add a memory (Timeline Kenangan)
apiRouter.post("/memories", async (req, res) => {
  const { title, imageUrl, date, caption, location, createdBy } = req.body;
  if (!title || !imageUrl || !date) {
    return res.status(400).json({ error: "Title, image URL and date are required" });
  }
  const db = await readDb();
  const newMemory = {
    id: "mem-" + Date.now(),
    imageUrl,
    title,
    date,
    caption: caption || "",
    location: location || "",
    createdBy: createdBy || "Partner",
    createdAt: new Date().toISOString()
  };
  db.memories.unshift(newMemory);
  // Sort memories chronologically (latest first)
  db.memories.sort((a: any, b: any) => b.date.localeCompare(a.date));
  await writeDb(db);
  res.json({ success: true, memory: newMemory, state: db });
});

// 13. Delete a memory
apiRouter.delete("/memories/:id", async (req, res) => {
  const { id } = req.params;
  const db = await readDb();
  db.memories = db.memories.filter((m: any) => m.id !== id);
  await writeDb(db);
  res.json({ success: true, state: db });
});

// 14. Add a map location pin (Peta Kenangan)
apiRouter.post("/map-pins", async (req, res) => {
  const { title, lat, lng, description, category, date, photoUrl } = req.body;
  if (!title || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "Title and coordinates are required" });
  }
  const db = await readDb();
  const newPin = {
    id: "pin-" + Date.now(),
    title,
    lat: Number(lat),
    lng: Number(lng),
    description: description || "",
    category: category || "date",
    date: date || new Date().toISOString().split('T')[0],
    photoUrl: photoUrl || ""
  };
  db.mapPins.push(newPin);
  await writeDb(db);
  res.json({ success: true, pin: newPin, state: db });
});

// 15. Delete a map location pin
apiRouter.delete("/map-pins/:id", async (req, res) => {
  const { id } = req.params;
  const db = await readDb();
  db.mapPins = db.mapPins.filter((p: any) => p.id !== id);
  await writeDb(db);
  res.json({ success: true, state: db });
});

// Update / Post Live Location
apiRouter.post("/live-location", async (req, res) => {
  const { user, lat, lng, accuracy, isSharing, addressName, statusNote, batteryLevel } = req.body;
  if (!user || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "User, lat, and lng are required" });
  }
  const db = await readDb();
  if (!db.liveLocations) db.liveLocations = {};

  const existing = db.liveLocations[user] || {};
  db.liveLocations[user] = {
    ...existing,
    user,
    lat: Number(lat),
    lng: Number(lng),
    accuracy: accuracy !== undefined ? Number(accuracy) : existing.accuracy || 10,
    updatedAt: new Date().toISOString(),
    isSharing: isSharing !== undefined ? Boolean(isSharing) : (existing.isSharing !== undefined ? existing.isSharing : true),
    addressName: addressName || existing.addressName || "Lokasi Langsung",
    statusNote: statusNote !== undefined ? statusNote : (existing.statusNote || ""),
    batteryLevel: batteryLevel !== undefined ? Number(batteryLevel) : existing.batteryLevel
  };

  await writeDb(db);
  res.json({ success: true, liveLocations: db.liveLocations, state: db });
});

// Toggle Live Location Sharing
apiRouter.post("/live-location/toggle", async (req, res) => {
  const { user, isSharing } = req.body;
  if (!user) {
    return res.status(400).json({ error: "User is required" });
  }
  const db = await readDb();
  if (!db.liveLocations) db.liveLocations = {};
  if (!db.liveLocations[user]) {
    db.liveLocations[user] = {
      user,
      lat: user === "Grace" ? -6.3686 : -6.2615,
      lng: user === "Grace" ? 106.8322 : 106.8152,
      updatedAt: new Date().toISOString(),
      isSharing: Boolean(isSharing)
    };
  } else {
    db.liveLocations[user].isSharing = Boolean(isSharing);
    db.liveLocations[user].updatedAt = new Date().toISOString();
  }

  await writeDb(db);
  res.json({ success: true, liveLocations: db.liveLocations, state: db });
});

// 16. Create a Love Capsule
apiRouter.post("/love-capsules", async (req, res) => {
  const { sender, message, mediaUrl, unlockDate } = req.body;
  if (!sender || !message || !unlockDate) {
    return res.status(400).json({ error: "Sender, message and unlock date are required" });
  }
  const db = await readDb();
  const newCapsule = {
    id: "capsule-" + Date.now(),
    sender,
    message,
    mediaUrl: mediaUrl || "",
    unlockDate,
    isOpened: false,
    createdAt: new Date().toISOString()
  };
  db.loveCapsules.push(newCapsule);
  await writeDb(db);
  res.json({ success: true, capsule: newCapsule, state: db });
});

// 17. Open a Love Capsule
apiRouter.post("/love-capsules/:id/open", async (req, res) => {
  const { id } = req.params;
  const db = await readDb();
  const capIndex = db.loveCapsules.findIndex((c: any) => c.id === id);
  if (capIndex > -1) {
    const capsule = db.loveCapsules[capIndex];
    const today = new Date().toISOString().split("T")[0];
    if (capsule.unlockDate > today) {
      return res.status(400).json({ error: `Kapsul waktu ini terkunci hingga ${capsule.unlockDate}!` });
    }
    db.loveCapsules[capIndex].isOpened = true;
    await writeDb(db);
    return res.json({ success: true, capsule: db.loveCapsules[capIndex], state: db });
  }
  res.status(404).json({ error: "Capsule not found" });
});

// 18. Safe Arrival Ping (partner receives instant notification)
apiRouter.post("/safe-arrivals", async (req, res) => {
  const { user, locationName, type } = req.body;
  if (!user || !locationName) {
    return res.status(400).json({ error: "User and location are required" });
  }
  const db = await readDb();
  const arrivalId = "arr-" + Date.now();
  const newArrival = {
    id: arrivalId,
    user,
    locationName,
    arrivedAt: new Date().toISOString(),
    type: type || "other"
  };
  db.safeArrivals.unshift(newArrival);

  // Generate notification for partner
  const partnerName = user === db.partner1.name ? db.partner2.name : db.partner1.name;
  const typeIcons: Record<string, string> = {
    home: "🏠",
    office: "💼",
    other: "📍"
  };
  const icon = typeIcons[type] || "📍";
  
  const notifMsg = `${user} telah tiba dengan selamat di ${locationName} ${icon}`;
  const newNotif = {
    id: "notif-" + Date.now(),
    message: notifMsg,
    timestamp: new Date().toISOString(),
    read: false
  };
  db.notifications.unshift(newNotif);
  
  // Cap history limits for safe arrivals and notifications
  if (db.safeArrivals.length > 50) db.safeArrivals.pop();
  if (db.notifications.length > 30) db.notifications.pop();

  await writeDb(db);
  res.json({ success: true, arrival: newArrival, notification: newNotif, state: db });
});

// 19. Clear active notifications
apiRouter.post("/notifications/clear", async (req, res) => {
  const db = await readDb();
  db.notifications = db.notifications.map((n: any) => ({ ...n, read: true }));
  await writeDb(db);
  res.json({ success: true, state: db });
});

// Mount API router
app.use("/api", apiRouter);
if (process.env.VERCEL) {
  app.use("/", apiRouter);
}

// Vite middleware setup for local Development and Production
if (!process.env.VERCEL) {
  async function startServer() {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      // SPA fallback
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[CouplePortal Server] Running on http://0.0.0.0:${PORT}`);
      
      readDb()
        .then(() => {
          console.log("[Server] Database state loaded/seeded successfully");
        })
        .catch((error) => {
          console.error("[Server] Failed to load/seed database state on startup:", error);
        });
    });
  }

  startServer();
}

export default app;
