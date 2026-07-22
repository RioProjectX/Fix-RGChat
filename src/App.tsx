import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Heart, 
  MessageSquare, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Camera, 
  Map, 
  Lock, 
  ShieldCheck, 
  User, 
  Sparkles, 
  Bell, 
  X,
  Compass,
  Phone,
  Video,
  Search,
  MoreVertical,
  ArrowLeft,
  CheckCheck,
  PhoneOff,
  Volume2,
  MicOff,
  HelpCircle,
  ChevronRight,
  Image as ImageIcon,
  Star,
  Palette,
  VideoOff,
  Mic,
  Download,
  Smartphone,
  BellRing
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppState, Partner, INITIAL_DEFAULT_STATE } from "./types";

// Import sub-components
import RelationTimer from "./components/RelationTimer";
import SharedNotes from "./components/SharedNotes";
import SharedTodos from "./components/SharedTodos";
import SharedCalendar from "./components/SharedCalendar";
import LoveCapsuleSection from "./components/LoveCapsuleSection";
import SafeArrivalSection from "./components/SafeArrivalSection";
import LiveLocation from "./components/LiveLocation";
import ChatMediaGallery from "./components/ChatMediaGallery";
import SharedMemories from "./components/SharedMemories";

type TabType = "beranda" | "obrolan" | "catatan" | "todos" | "album" | "peta" | "capsule" | "arrival";

export default function App() {
  const [activeUser, setActiveUser] = useState<string>(() => {
    return sessionStorage.getItem("active_user") || "Grace";
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("is_authenticated") === "true";
  });
  const [selectedProfile, setSelectedProfile] = useState<"Grace" | "Rio" | null>(null);
  const [pinProgress, setPinProgress] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [state, setState] = useState<AppState>(INITIAL_DEFAULT_STATE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState<boolean>(false);
  const [lastNotificationId, setLastNotificationId] = useState<string>("");
  
  // Chat Room Drawer states
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [chatDrawerTab, setChatDrawerTab] = useState<"info" | "favorites" | "gallery" | "theme">("info");
  const [showNameMenu, setShowNameMenu] = useState<boolean>(false);
  
  // Fake Calling state for WhatsApp theme
  const [activeCall, setActiveCall] = useState<{
    isOpen: boolean;
    type: "audio" | "video";
    partnerName: string;
    status: "calling" | "connected";
  } | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string>("");
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Profile modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [editingName, setEditingName] = useState<string>("");
  const [editingAvatar, setEditingAvatar] = useState<string>("");
  const [editingBio, setEditingBio] = useState<string>("");
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // PWA Install & Web Push Notification states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const lastMsgNotifiedIdRef = useRef<string | null>(null);

  // PWA beforeinstallprompt event listener
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleRequestNotifPermission = async () => {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotifPerm(perm);
      if (perm === "granted") {
        const title = "Notifikasi Latar Belakang Aktif 💖";
        const body = "Anda akan menerima notifikasi otomatis saat pesan baru masuk dari pasangan!";
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, { body, icon: "/icon.svg" });
          });
        } else {
          new Notification(title, { body, icon: "/icon.svg" });
        }
      }
    } else {
      alert("Browser Anda tidak mendukung notifikasi browser.");
    }
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  // PIN Helper functions
  const handlePinKeyPress = useCallback((num: string) => {
    setPinError("");
    setPinProgress((prev) => {
      const next = prev + num;
      if (next.length === 6) {
        const requiredPin = selectedProfile === "Grace" ? "150305" : "310104";
        if (next === requiredPin) {
          setIsAuthenticated(true);
          setActiveUser(selectedProfile);
          sessionStorage.setItem("is_authenticated", "true");
          sessionStorage.setItem("active_user", selectedProfile);
          setSelectedProfile(null);
          setPinProgress("");
        } else {
          setPinError("PIN salah! Silakan coba lagi.");
          setTimeout(() => {
            setPinProgress("");
          }, 600);
        }
      }
      return next.length > 6 ? prev : next;
    });
  }, [selectedProfile]);

  const handlePinDelete = useCallback(() => {
    setPinProgress((prev) => prev.slice(0, -1));
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("is_authenticated");
    setSelectedProfile(null);
    setPinProgress("");
    setPinError("");
  }, []);

  // Keyboard support for PIN entry
  useEffect(() => {
    if (isAuthenticated) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedProfile && pinProgress.length < 6) {
        if (/^[0-9]$/.test(e.key)) {
          handlePinKeyPress(e.key);
        } else if (e.key === "Backspace") {
          handlePinDelete();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated, selectedProfile, pinProgress, handlePinKeyPress, handlePinDelete]);

  const handleOpenProfileModal = () => {
    if (!state) return;
    const currentPartner = activeUser === "Grace" ? state.partner1 : state.partner2;
    setEditingName(currentPartner.name);
    setEditingAvatar(currentPartner.avatar || "");
    setEditingBio(currentPartner.bio || "");
    setIsProfileModalOpen(true);
  };

  const handleImageFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diizinkan!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert("Ukuran gambar maksimal 2MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEditingAvatar(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveProfile = async () => {
    if (!state) return;
    setIsSavingProfile(true);
    try {
      const updatedFields = {
        name: editingName,
        avatar: editingAvatar,
        bio: editingBio
      };

      let p1 = {};
      let p2 = {};
      if (activeUser === "Grace") {
        p1 = updatedFields;
      } else {
        p2 = updatedFields;
      }

      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner1: p1, partner2: p2 })
      });
      if (res.ok) {
        if (editingName.trim()) {
          setActiveUser(editingName.trim());
        }
        await fetchState();
        setIsProfileModalOpen(false);
      }
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Fetch full state from backend server
  const fetchState = useCallback(async (isInitial = false) => {
    try {
      const url = isAuthenticated ? `/api/state?user=${encodeURIComponent(activeUser)}` : "/api/state";
      const res = await fetch(url);
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data: AppState = await res.json();
          if (data && typeof data === "object") {
            setState(data);

            // Real-time desktop / mobile background notification for new messages from partner
            if (data.chatMessages && data.chatMessages.length > 0) {
              const latestMsg = data.chatMessages[data.chatMessages.length - 1];
              if (latestMsg.sender !== activeUser) {
                if (lastMsgNotifiedIdRef.current !== null && lastMsgNotifiedIdRef.current !== latestMsg.id) {
                  if ("Notification" in window && Notification.permission === "granted") {
                    const notifTitle = `Pesan Baru dari ${latestMsg.sender} 💖`;
                    const notifBody = latestMsg.text 
                      ? latestMsg.text 
                      : (latestMsg.mediaUrl ? "Mengirimkan foto/media 🖼️" : "Pesan Baru");

                    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
                      navigator.serviceWorker.ready.then((reg) => {
                        reg.showNotification(notifTitle, {
                          body: notifBody,
                          icon: "/icon.svg",
                          badge: "/icon.svg",
                          tag: "chat-" + latestMsg.id
                        } as NotificationOptions);
                      });
                    } else {
                      new Notification(notifTitle, {
                        body: notifBody,
                        icon: "/icon.svg"
                      });
                    }
                  }
                }
                lastMsgNotifiedIdRef.current = latestMsg.id;
              }
            }
            
            // Real-time alert for safe arrival notifications
            if (data.notifications && data.notifications.length > 0) {
              const latestNotif = data.notifications[0];
              // If we have a new unread notification, trigger the overlay popup
              if (!latestNotif.read && latestNotif.id !== lastNotificationId) {
                setLastNotificationId(latestNotif.id);
                setShowNotificationPopup(true);
              }
            }
          }
        }
      }
      if (isInitial) setLoading(false);
    } catch (err: any) {
      console.warn("Server poll warning:", err);
      if (isInitial) setLoading(false);
    }
  }, [lastNotificationId, activeUser, isAuthenticated]);

  // Load state on mount and set up real-time polling every 2 seconds
  useEffect(() => {
    fetchState(true);
    const interval = setInterval(() => {
      fetchState();
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Auto-select chat tab on desktop, and list view on mobile
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setActiveTab("obrolan");
    } else {
      setActiveTab(null);
    }
  }, []);

  // Timer tick for real-time synchronized call
  useEffect(() => {
    let timer: any;
    if (state?.activeCall && state.activeCall.status === "connected" && state.activeCall.startedAt) {
      const startTime = new Date(state.activeCall.startedAt).getTime();
      const updateDuration = () => {
        const now = Date.now();
        setCallDuration(Math.max(0, Math.floor((now - startTime) / 1000)));
      };
      updateDuration();
      timer = setInterval(updateDuration, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [state?.activeCall?.status, state?.activeCall?.startedAt]);

  // Auto-close call screen when call is declined after brief notice
  useEffect(() => {
    if (state?.activeCall && state.activeCall.status === "declined") {
      const timeout = setTimeout(() => {
        handleEndCall();
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [state?.activeCall?.status]);

  // Camera stream management for Video Calls
  const stopCameraStream = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    setCameraStream(null);
  }, []);

  const startCameraStream = useCallback(async () => {
    setCameraPermissionError("");
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: true
        });
        activeStreamRef.current = stream;
        setCameraStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(console.warn);
        }
      } else {
        setCameraPermissionError("Browser Anda tidak mendukung akses kamera web.");
      }
    } catch (err: any) {
      console.warn("Camera request error with audio, trying video only:", err);
      try {
        const streamOnlyVideo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        activeStreamRef.current = streamOnlyVideo;
        setCameraStream(streamOnlyVideo);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = streamOnlyVideo;
          localVideoRef.current.play().catch(console.warn);
        }
      } catch (err2: any) {
        console.warn("Camera permission denied or camera device missing:", err2);
        setCameraPermissionError("Kamera tidak dapat diakses langsung. Klik tombol di bawah untuk mengizinkan kamera.");
      }
    }
  }, []);

  // Callback ref for setting video element srcObject reliably as soon as DOM mounts
  const setVideoElementRef = useCallback((node: HTMLVideoElement | null) => {
    localVideoRef.current = node;
    if (node && activeStreamRef.current) {
      node.srcObject = activeStreamRef.current;
      node.play().catch(console.warn);
    }
  }, []);

  useEffect(() => {
    const isVideoCallActive = state?.activeCall && state.activeCall.type === "video" && (state.activeCall.status === "calling" || state.activeCall.status === "connected");
    
    if (isVideoCallActive && !isVideoOff) {
      if (!activeStreamRef.current) {
        startCameraStream();
      }
    } else {
      stopCameraStream();
    }
  }, [state?.activeCall?.id, state?.activeCall?.type, state?.activeCall?.status, isVideoOff, startCameraStream, stopCameraStream]);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Trigger floating heart animations for clicks
  const triggerHeartAnimation = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newHeart = { id: Date.now(), x, y };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  const calculateDays = (startDateStr: string) => {
    if (!startDateStr) return 0;
    const startDate = new Date(startDateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatLastSeen = useCallback((date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const timeStr = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
    
    if (compareDate.getTime() === today.getTime()) {
      return `Terakhir dilihat hari ini pukul ${timeStr}`;
    } else if (compareDate.getTime() === yesterday.getTime()) {
      return `Terakhir dilihat kemarin pukul ${timeStr}`;
    } else {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `Terakhir dilihat ${day}/${month}/${year} pukul ${timeStr}`;
    }
  }, []);

  const getPartnerStatus = useCallback((partnerName: string, appState: AppState | null) => {
    if (!appState) return "Offline";
    const lastActiveStr = partnerName === "Grace" ? appState.lastActiveGrace : appState.lastActiveRio;
    if (!lastActiveStr) return "Offline";
    
    const lastActive = new Date(lastActiveStr);
    const now = new Date();
    
    if (now.getTime() - lastActive.getTime() < 15000) {
      return "Online";
    }
    return formatLastSeen(lastActive);
  }, [formatLastSeen]);

  // API Call handlers

  const handleUpdateStartDate = async (date: string) => {
    try {
      const res = await fetch("/api/relationship-start-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date })
      });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePartners = async (p1: Partial<Partner>, p2: Partial<Partner>) => {
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner1: p1, partner2: p2 })
      });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async (notes: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes })
      });
      if (res.ok) {
        fetchState();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleAddTodo = async (text: string, dueDate: string, reminder: boolean) => {
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, dueDate, reminder, createdBy: activeUser })
      });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed, completedBy: activeUser })
      });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvent = async (title: string, type: string, date: string, description: string) => {
    try {
      const res = await fetch("/api/calendar-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, date, description, createdBy: activeUser })
      });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/calendar-events/${id}`, { method: "DELETE" });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (text: string, mediaUrl: string) => {
    try {
      const res = await fetch("/api/chat-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: activeUser, text, mediaUrl })
      });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await fetch(`/api/chat-message/${id}/favorite`, { method: "POST" });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMemory = async (title: string, imageUrl: string, date: string, caption: string, location: string) => {
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, imageUrl, date, caption, location, createdBy: activeUser })
      });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      const res = await fetch(`/api/memories/${id}`, { method: "DELETE" });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPin = async (
    title: string, 
    lat: number, 
    lng: number, 
    description: string, 
    category: string, 
    date: string, 
    photoUrl: string
  ) => {
    try {
      const res = await fetch("/api/map-pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, lat, lng, description, category, date, photoUrl })
      });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePin = async (id: string) => {
    try {
      const res = await fetch(`/api/map-pins/${id}`, { method: "DELETE" });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCapsule = async (message: string, mediaUrl: string, unlockDate: string) => {
    try {
      const res = await fetch("/api/love-capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: activeUser, message, mediaUrl, unlockDate })
      });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCapsule = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/love-capsules/${id}/open`, { method: "POST" });
      if (res.ok) {
        fetchState();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleArrive = async (locationName: string, type: "home" | "office" | "other") => {
    try {
      const res = await fetch("/api/safe-arrivals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: activeUser, locationName, type })
      });
      if (res.ok) fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await fetch("/api/notifications/clear", { method: "POST" });
      setShowNotificationPopup(false);
      fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerCall = async (type: "audio" | "video") => {
    try {
      const res = await fetch("/api/call/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caller: activeUser, type })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error("Gagal memulai panggilan:", err);
    }
  };

  const handleAnswerCall = async () => {
    try {
      const res = await fetch("/api/call/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: activeUser })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setState(data.state);
        else fetchState();
      }
    } catch (err) {
      console.error("Gagal menjawab panggilan:", err);
    }
  };

  const handleDeclineCall = async () => {
    try {
      stopCameraStream();
      setState((prev) => (prev ? { ...prev, activeCall: null } : prev));
      setCallDuration(0);
      const res = await fetch("/api/call/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: activeUser })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setState(data.state);
        else fetchState();
      } else {
        fetchState();
      }
    } catch (err) {
      console.error("Gagal menolak panggilan:", err);
      fetchState();
    }
  };

  const handleEndCall = async () => {
    try {
      stopCameraStream();
      const currentDuration = callDuration;
      setState((prev) => (prev ? { ...prev, activeCall: null } : prev));
      setCallDuration(0);
      const res = await fetch("/api/call/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: activeUser, durationSeconds: currentDuration })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setState(data.state);
        else fetchState();
      } else {
        fetchState();
      }
    } catch (err) {
      console.error("Gagal mengakhiri panggilan:", err);
      fetchState();
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center font-sans">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="text-[#00A884] mb-4"
        >
          <MessageSquare className="w-16 h-16 fill-[#00A884]" />
        </motion.div>
        <h2 className="text-lg font-bold text-[#3B4A54]">Menghubungkan WhatsApp Cinta...</h2>
        <p className="text-xs text-[#667781] mt-2">Menyiapkan ruang obrolan real-time Grace & Rio</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center font-sans p-6 text-center">
        <p className="text-red-600 font-bold text-lg">Gagal Memuat Database</p>
        <p className="text-sm text-[#667781] mt-1">Sambungan server terputus. Pastikan container berjalan dengan benar.</p>
        <button onClick={() => fetchState(true)} className="mt-4 px-5 py-2.5 bg-[#00A884] hover:bg-[#008069] text-white rounded-xl text-xs font-bold shadow transition">
          Coba Hubungkan Kembali
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex flex-col bg-[#FAF3E0] text-[#3B4A54] overflow-hidden select-none font-sans relative" onClick={triggerHeartAnimation}>
        {/* Floating hearts background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {floatingHearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, scale: 0.5, y: h.y, x: h.x }}
              animate={{ opacity: 0, scale: 1.5, y: h.y - 120, x: h.x + (Math.random() * 40 - 20) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute text-rose-400 text-lg"
            >
              ❤️
            </motion.div>
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
          <AnimatePresence mode="wait">
            {!selectedProfile ? (
              // STEP 1: CHOOSE PROFILE
              <motion.div
                key="profile-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md flex flex-col items-center text-center space-y-8"
              >
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-[#008069] rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-serif italic font-bold text-[#8B7E74] tracking-tight mt-4">R&amp;GChat 💬</h1>
                  <p className="text-xs text-[#A89F91] font-medium leading-relaxed">
                    Sistem Obrolan Pribadi Terenkripsi & Romantis.<br />Silakan pilih profil Anda untuk membuka kunci.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                  {/* PROFILE: GRACE */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedProfile("Grace");
                      setPinProgress("");
                      setPinError("");
                    }}
                    className="bg-white p-5 rounded-3xl shadow-md border border-[#E6D5B8] flex flex-col items-center space-y-3 cursor-pointer group hover:border-[#008069] transition"
                  >
                    <div className="relative w-20 h-20">
                      {state?.partner1?.avatar && (state.partner1.avatar.startsWith("http") || state.partner1.avatar.startsWith("data:")) ? (
                        <img 
                          src={state.partner1.avatar} 
                          alt="Grace" 
                          className="w-20 h-20 rounded-full object-cover border-2 border-[#008069]/30 group-hover:border-[#008069]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#FFE2E2] text-rose-600 flex items-center justify-center font-bold font-serif text-2xl border-2 border-[#008069]/30 group-hover:border-[#008069] shadow-inner uppercase">
                          G
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#25D366] rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white">✓</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#4A403A]">{state?.partner1?.name || "Grace"}</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[120px]">{state?.partner1?.bio || "Menjaga hubungan kita 🌸"}</p>
                    </div>
                  </motion.button>

                  {/* PROFILE: RIO */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedProfile("Rio");
                      setPinProgress("");
                      setPinError("");
                    }}
                    className="bg-white p-5 rounded-3xl shadow-md border border-[#E6D5B8] flex flex-col items-center space-y-3 cursor-pointer group hover:border-[#008069] transition"
                  >
                    <div className="relative w-20 h-20">
                      {state?.partner2?.avatar && (state.partner2.avatar.startsWith("http") || state.partner2.avatar.startsWith("data:")) ? (
                        <img 
                          src={state.partner2.avatar} 
                          alt="Rio" 
                          className="w-20 h-20 rounded-full object-cover border-2 border-[#008069]/30 group-hover:border-[#008069]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#FFE2E2] text-rose-600 flex items-center justify-center font-bold font-serif text-2xl border-2 border-[#008069]/30 group-hover:border-[#008069] shadow-inner uppercase">
                          R
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#25D366] rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white">✓</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#4A403A]">{state?.partner2?.name || "Rio"}</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[120px]">{state?.partner2?.bio || "Mencintaimu selamanya ✨"}</p>
                    </div>
                  </motion.button>
                </div>

                <div className="text-[10px] text-[#A89F91] italic font-semibold">
                  Klik foto di atas untuk login ke profil masing-masing.
                </div>
              </motion.div>
            ) : (
              // STEP 2: ENTER PIN LOCKSCREEN
              <motion.div
                key="pin-input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xs flex flex-col items-center text-center space-y-6"
              >
                {/* Profile chosen header */}
                <div className="space-y-3">
                  <div className="relative w-24 h-24 mx-auto">
                    {selectedProfile === "Grace" && state?.partner1?.avatar && (state.partner1.avatar.startsWith("http") || state.partner1.avatar.startsWith("data:")) ? (
                      <img 
                        src={state.partner1.avatar} 
                        alt="Grace" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        referrerPolicy="no-referrer"
                      />
                    ) : selectedProfile === "Rio" && state?.partner2?.avatar && (state.partner2.avatar.startsWith("http") || state.partner2.avatar.startsWith("data:")) ? (
                      <img 
                        src={state.partner2.avatar} 
                        alt="Rio" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-[#FFE2E2] text-rose-600 border-4 border-white flex items-center justify-center font-bold font-serif text-3xl shadow-lg uppercase">
                        {selectedProfile.slice(0, 1)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-[#008069] text-white p-1.5 rounded-full shadow border-2 border-white">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-[#4A403A]">{selectedProfile === "Grace" ? (state?.partner1?.name || "Grace") : (state?.partner2?.name || "Rio")}</h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Masukkan PIN Keamanan</p>
                  </div>
                </div>

                {/* PIN Dots indicators */}
                <div className="flex justify-center space-x-3.5 my-4">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={index}
                      className={`w-3.5 h-3.5 rounded-full border border-[#E6D5B8] transition-all duration-150 ${
                        pinProgress.length > index
                          ? "bg-[#008069] border-[#008069] scale-110"
                          : "bg-white"
                      }`}
                    />
                  ))}
                </div>

                {/* PIN Error Feedback */}
                {pinError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-rose-500 font-bold bg-rose-50 rounded-lg px-3 py-1"
                  >
                    {pinError}
                  </motion.p>
                )}

                {/* Dial Pad Grid */}
                <div className="grid grid-cols-3 gap-y-3.5 gap-x-5 w-full">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePinKeyPress(num)}
                      className="w-14 h-14 bg-white hover:bg-gray-50 active:bg-gray-100 border border-[#E6D5B8] rounded-full text-base font-bold text-[#4A403A] shadow-sm flex items-center justify-center transition cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                  
                  {/* Back/Cancel */}
                  <button
                    onClick={() => {
                      setSelectedProfile(null);
                      setPinProgress("");
                      setPinError("");
                    }}
                    className="w-14 h-14 text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center justify-center cursor-pointer"
                  >
                    Batal
                  </button>

                  {/* 0 key */}
                  <button
                    onClick={() => handlePinKeyPress("0")}
                    className="w-14 h-14 bg-white hover:bg-gray-50 active:bg-gray-100 border border-[#E6D5B8] rounded-full text-base font-bold text-[#4A403A] shadow-sm flex items-center justify-center transition cursor-pointer"
                  >
                    0
                  </button>

                  {/* Delete key */}
                  <button
                    onClick={handlePinDelete}
                    className="w-14 h-14 text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center justify-center cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 italic">
                  Hubungi pasangan Anda jika Anda lupa PIN.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Define WhatsApp style Chat list items based on active features
  const chatItems = [
    {
      id: "obrolan" as TabType,
      title: activeUser === "Grace" ? "Rio ❤️" : "Grace ❤️",
      avatarBg: activeUser === "Grace" ? "bg-[#588157]" : "bg-[#D4A373]",
      avatarChar: activeUser === "Grace" ? "R" : "G",
      status: state ? getPartnerStatus(activeUser === "Grace" ? "Rio" : "Grace", state) : "Offline",
      getSubtitle: (s: AppState) => {
        const lastMsg = s.chatMessages[s.chatMessages.length - 1];
        if (!lastMsg) return "Kirim pesan cinta pertamamu... ❤️";
        const prefix = lastMsg.sender === activeUser ? "Anda: " : "";
        return `${prefix}${lastMsg.text || "📷 Lampiran foto"}`;
      },
      getBadge: (s: AppState) => 0,
      getTime: (s: AppState) => {
        const lastMsg = s.chatMessages[s.chatMessages.length - 1];
        if (!lastMsg) return "";
        const date = new Date(lastMsg.timestamp);
        return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      }
    },
    {
      id: "beranda" as TabType,
      title: "Hari Jadian & Profil Cinta 💖",
      avatarBg: "bg-red-500",
      avatarChar: "❤️",
      status: "Hubungan Tersegel",
      getSubtitle: (s: AppState) => {
        const days = calculateDays(s.relationshipStartDate);
        return `Sudah ${days} hari berjalan bersama! ✨`;
      },
      getBadge: (s: AppState) => 0,
      getTime: () => "Timer"
    },
    {
      id: "catatan" as TabType,
      title: "Buku Diary Bersama 📖",
      avatarBg: "bg-amber-500",
      avatarChar: "📖",
      status: "Catatan Kolaboratif",
      getSubtitle: (s: AppState) => {
        if (!s.notes) return "Tulis coretan sayang atau catatan harian...";
        return s.notes.replace(/\n/g, " ").slice(0, 35) + (s.notes.length > 35 ? "..." : "");
      },
      getBadge: (s: AppState) => 0,
      getTime: () => "Diary"
    },
    {
      id: "todos" as TabType,
      title: "Checklist Agenda & To-Do 📝",
      avatarBg: "bg-blue-500",
      avatarChar: "📝",
      status: "Rencana Kencan",
      getSubtitle: (s: AppState) => {
        const activeCount = s.todos.filter(t => !t.completed).length;
        return `${activeCount} checklist aktif, ${s.calendarEvents.length} agenda.`;
      },
      getBadge: (s: AppState) => s.todos.filter(t => !t.completed).length,
      getTime: () => "To-Do"
    },
    {
      id: "album" as TabType,
      title: "Timeline Album Kenangan 📸",
      avatarBg: "bg-pink-500",
      avatarChar: "📸",
      status: "Galeri Kenangan",
      getSubtitle: (s: AppState) => {
        if (s.memories.length === 0) return "Abadikan kenangan foto berdua.";
        const lastMem = s.memories[s.memories.length - 1];
        return `Foto baru: "${lastMem.title}"`;
      },
      getBadge: (s: AppState) => 0,
      getTime: () => "Album"
    },
    {
      id: "peta" as TabType,
      title: "Live Location & GPS 📍",
      avatarBg: "bg-emerald-600",
      avatarChar: "📍",
      status: "Lokasi Langsung",
      getSubtitle: (s: AppState) => {
        const partner = activeUser === "Grace" ? "Rio" : "Grace";
        const partnerLoc = s.liveLocations?.[partner];
        if (partnerLoc?.isSharing && partnerLoc.addressName) {
          return `${partner}: ${partnerLoc.addressName}`;
        }
        return "Berbagi lokasi GPS real-time pasangan.";
      },
      getBadge: (s: AppState) => 0,
      getTime: () => "Live"
    },
    {
      id: "capsule" as TabType,
      title: "Love Capsule (Waktu) 🔒",
      avatarBg: "bg-indigo-500",
      avatarChar: "🔒",
      status: "Pesan Tersegel",
      getSubtitle: (s: AppState) => {
        const todayStr = new Date().toISOString().split("T")[0];
        const readyCount = s.loveCapsules.filter(c => !c.isOpened && c.unlockDate <= todayStr).length;
        if (readyCount > 0) return `🎁 Ada ${readyCount} kapsul siap dibuka!`;
        return `${s.loveCapsules.length} kapsul tersimpan aman.`;
      },
      getBadge: (s: AppState) => {
        const todayStr = new Date().toISOString().split("T")[0];
        return s.loveCapsules.filter(c => !c.isOpened && c.unlockDate <= todayStr).length;
      },
      getTime: () => "Capsule"
    },
    {
      id: "arrival" as TabType,
      title: "Safe Arrival (Kabar Sampai) 🚗",
      avatarBg: "bg-emerald-700",
      avatarChar: "🛡️",
      status: "Sinyal Keselamatan",
      getSubtitle: (s: AppState) => {
        const lastArr = s.safeArrivals[0];
        if (!lastArr) return "Kirim sinyal saat tiba di tujuan.";
        return `${lastArr.user} tiba di: ${lastArr.locationName}`;
      },
      getBadge: (s: AppState) => 0,
      getTime: () => "Kabar"
    }
  ];

  const activePartner = state ? (activeUser === "Grace" ? state.partner1 : state.partner2) : null;
  const partner = state ? (activeUser === "Grace" ? state.partner2 : state.partner1) : null;

  const isPartnerOnline = partner && state ? (
    (() => {
      const lastActiveStr = partner.name === "Grace" ? state.lastActiveGrace : state.lastActiveRio;
      if (!lastActiveStr) return false;
      const lastActive = new Date(lastActiveStr);
      const now = new Date();
      return now.getTime() - lastActive.getTime() < 15000;
    })()
  ) : false;

  // Filter items based on search query
  const filteredChatItems = chatItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.getSubtitle(state).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChatItem = chatItems.find(i => i.id === activeTab);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F0F2F5] text-[#3B4A54] overflow-hidden select-none font-sans relative" onClick={triggerHeartAnimation}>
      
      {/* REAL-TIME NOTIFICATION POPUP BANNER */}
      <AnimatePresence>
        {showNotificationPopup && state.notifications && state.notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-[#005C4B] text-white p-4 rounded-xl shadow-2xl flex items-start justify-between gap-3 border border-[#00A884]/30"
          >
            <div className="flex-1 flex items-start space-x-3">
              <div className="p-2 bg-white/20 rounded-lg mt-0.5 animate-bounce">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Notifikasi Kabar Sampai! 🚗💖</p>
                <p className="text-xs opacity-90 mt-1 leading-relaxed font-sans">
                  {state.notifications[0].message}
                </p>
                <p className="text-[10px] opacity-75 mt-1 font-mono">
                  {new Date(state.notifications[0].timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                </p>
              </div>
            </div>
            <button
              onClick={handleClearNotifications}
              className="p-1 hover:bg-white/10 rounded-lg transition self-start cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN WHATSAPP LAYOUT CONTAINER */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* SIDEBAR: CHAT LIST */}
        <aside
          className={`h-full bg-white flex flex-col border-r border-[#E9EDEF] shrink-0 z-30 transition-all duration-300 ${
            activeTab === null 
              ? "w-full" 
              : "hidden md:flex md:w-[350px] lg:w-[400px]"
          }`}
        >
          {/* Sidebar Top bar (WhatsApp Styled Green Header) */}
          <div className="bg-[#008069] text-white px-4 py-3.5 flex items-center justify-between shadow-sm flex-shrink-0">
            <div 
              onClick={handleOpenProfileModal}
              className="flex items-center space-x-3 cursor-pointer hover:bg-white/10 p-1 -m-1 rounded-lg transition-all"
              title="Ubah Profil Anda"
              id="sidebar-profile-header-click"
            >
              <div className="relative w-9 h-9 shrink-0">
                {activePartner && activePartner.avatar && (activePartner.avatar.startsWith("http") || activePartner.avatar.startsWith("data:")) ? (
                  <img 
                    src={activePartner.avatar} 
                    alt={activeUser}
                    className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-inner"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#FFE2E2] text-rose-600 border border-white/20 flex items-center justify-center font-bold font-serif text-sm shadow-inner uppercase">
                    {activeUser.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border border-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight">R&amp;GChat 💬</h1>
                <p className="text-[10px] opacity-90 font-medium">Aktif: {activeUser}</p>
              </div>
            </div>

            {/* Action Buttons: Background Notification, Theme Palette & Lock */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleRequestNotifPermission}
                className={`p-2 rounded-full transition cursor-pointer flex items-center justify-center text-white relative ${
                  notifPerm === "granted" ? "hover:bg-white/10" : "bg-amber-500/30 hover:bg-amber-500/50 animate-pulse"
                }`}
                title={notifPerm === "granted" ? "Notifikasi Latar Belakang Aktif 🔔" : "Aktifkan Notifikasi Pesan Masuk 🔔"}
                id="sidebar-notif-permission-button"
              >
                <BellRing className="w-5 h-5" />
                {notifPerm !== "granted" && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("obrolan");
                  setChatDrawerTab("theme");
                  setIsChatDrawerOpen(true);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer flex items-center justify-center text-white"
                title="Edit Tema & Wallpaper Chat 🎨"
                id="sidebar-theme-button"
              >
                <Palette className="w-5 h-5" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer flex items-center justify-center text-white"
                title="Kunci Aplikasi / Ganti Peran"
                id="sidebar-lock-button"
              >
                <Lock className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Search bar inside Sidebar */}
          <div className="bg-white px-3 py-2 border-b border-[#F0F2F5] flex-shrink-0">
            <div className="bg-[#F0F2F5] rounded-lg px-3 py-1.5 flex items-center space-x-2 border border-transparent focus-within:border-[#00A884]/30 focus-within:bg-white transition-all duration-150">
              <Search className="w-4 h-4 text-[#667781]" />
              <input
                type="text"
                placeholder="Cari fitur atau kata sandi..."
                className="w-full bg-transparent text-xs text-[#3B4A54] placeholder-[#667781] outline-none focus:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[#667781] hover:text-[#3B4A54] cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Chat/Feature Items list */}
          <div className="flex-1 overflow-y-auto bg-white divide-y divide-[#F0F2F5]">
            {filteredChatItems.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Search className="w-10 h-10 text-[#A89F91]/50 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#8B7E74]">Pencarian Tidak Ditemukan</p>
                <p className="text-[10px] text-[#A89F91] mt-1">Coba ketik kata kunci fitur lainnya.</p>
              </div>
            ) : (
              filteredChatItems.map((item) => {
                const isActive = activeTab === item.id;
                const badgeCount = item.getBadge(state);
                const subtitleText = item.getSubtitle(state);
                const timeText = item.getTime(state);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setError("");
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3.5 transition text-left cursor-pointer border-l-4 ${
                      isActive 
                        ? "bg-[#F0F2F5] border-[#008069]" 
                        : "bg-white hover:bg-[#F5F6F6] border-transparent"
                    }`}
                  >
                    {/* Circle Avatar matching character status */}
                    {item.id === "obrolan" && partner && partner.avatar && (partner.avatar.startsWith("http") || partner.avatar.startsWith("data:")) ? (
                      <div className="relative w-12 h-12 shrink-0">
                        <img 
                          src={partner.avatar} 
                          alt={partner.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-inner"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-lg relative shadow-inner ${item.avatarBg}`}>
                        <span>{item.avatarChar}</span>
                      </div>
                    )}

                    {/* Chat Text Details */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold text-[#111B21] truncate">{item.title}</h2>
                        <span className="text-[10px] text-[#667781] font-medium font-mono shrink-0">{timeText}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1 gap-1">
                        <p className="text-[11px] text-[#667781] truncate leading-normal flex-1">
                          {item.id === "obrolan" && (() => {
                            const lastMsg = state?.chatMessages?.[state.chatMessages.length - 1];
                            if (lastMsg && lastMsg.sender === activeUser) {
                              return (
                                <CheckCheck
                                  className={`w-3.5 h-3.5 inline mr-1 shrink-0 ${
                                    lastMsg.isRead ? "text-[#53BDEB]" : "text-[#8696a0]"
                                  }`}
                                />
                              );
                            }
                            return null;
                          })()}
                          {subtitleText}
                        </p>

                        {/* Unread Indicator Badge */}
                        {badgeCount > 0 && (
                          <span className="shrink-0 bg-[#25D366] text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                            {badgeCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* MAIN DISPLAY PANE: ACTIVE FEATURE SCREEN */}
        <main
          className={`flex-1 h-full bg-[#efeae2] flex flex-col overflow-hidden relative ${
            activeTab === null 
              ? "hidden md:flex" 
              : "flex w-full"
          }`}
        >
          {/* WHATSAPP CHAT WALLPAPER SUBTLE BACKGROUND PATTERN */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />

          {activeTab === null ? (
            /* WELCOME DISPLAY SCREEN (Shown when no chat is active) */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F8F9FA] relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              
              <div className="max-w-md space-y-4">
                <div className="w-24 h-24 rounded-full bg-[#00A884]/10 text-[#00A884] flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <MessageSquare className="w-12 h-12" />
                </div>
                <h1 className="text-2xl font-bold text-[#41525D] font-sans">KopelChat Web Cinta 💖</h1>
                <p className="text-xs text-[#667781] leading-relaxed">
                  Pilih salah satu ruang obrolan di sebelah kiri untuk mulai mengelola buku diary, to-do list kencan, timeline album, live location GPS, atau mengirim kabar sampai secara otomatis ke pasanganmu.
                </p>
                <div className="flex justify-center items-center gap-1 text-[10px] text-[#8696A0] pt-4 border-t border-[#E9EDEF]">
                  <Lock className="w-3 h-3 text-[#8696A0]" />
                  <span>Tersegel Aman & Terhubung Real-Time</span>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE CHAT SCREEN CONTAINER */
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              
              {/* Active Header (WhatsApp Style Contact Bar) */}
              <div className="bg-[#F0F2F5] px-4 py-2.5 flex items-center justify-between border-b border-[#E9EDEF] shadow-sm z-20 flex-shrink-0">
                <div className="flex items-center space-x-3 min-w-0 relative">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveTab(null)}
                    className="md:hidden p-1 hover:bg-[#E1E3E6] rounded-full text-[#54656F] cursor-pointer"
                    title="Kembali ke Daftar Chat"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Clickable Header Info wrapper */}
                  <div 
                    className="flex items-center space-x-3 cursor-pointer hover:bg-black/5 p-1.5 -m-1.5 rounded-lg transition-all relative"
                    onClick={() => {
                      if (activeTab === "obrolan") {
                        setShowNameMenu(!showNameMenu);
                      }
                    }}
                    title="Klik untuk melihat menu info"
                    id="active-partner-header-info"
                  >
                    {/* Active Header Avatar */}
                    <div className="relative w-10 h-10 shrink-0">
                      {activeTab === "obrolan" && partner && partner.avatar && (partner.avatar.startsWith("http") || partner.avatar.startsWith("data:")) ? (
                        <img 
                          src={partner.avatar} 
                          alt={partner.name}
                          className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${activeChatItem?.avatarBg}`}>
                          <span>{activeChatItem?.avatarChar}</span>
                        </div>
                      )}
                      {activeTab === "obrolan" && isPartnerOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border border-white" />
                      )}
                    </div>

                    {/* Active Title & Info */}
                    <div className="min-w-0">
                      <h2 className="text-xs font-bold text-[#111B21] truncate leading-tight flex items-center gap-1">
                        <span>{activeChatItem?.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      </h2>
                      {activeTab === "obrolan" ? (
                        isPartnerOnline ? (
                          <p className="text-[10px] text-[#00A884] font-semibold flex items-center gap-1 mt-0.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00A884]" />
                            <span>Online</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-[#667781] font-medium flex items-center gap-1 mt-0.5">
                            <span>{getPartnerStatus(partner?.name || "", state)}</span>
                          </p>
                        )
                      ) : (
                        <p className="text-[10px] text-[#00A884] font-semibold flex items-center gap-1 mt-0.5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00A884]" />
                          <span>{activeChatItem?.status}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu when clicked */}
                  {showNameMenu && (
                    <div className="absolute top-12 left-10 w-52 bg-white border border-[#E9EDEF] rounded-xl shadow-xl p-1.5 z-50 animate-fade-in text-xs">
                      <button
                        onClick={() => {
                          setChatDrawerTab("info");
                          setIsChatDrawerOpen(true);
                          setShowNameMenu(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 hover:bg-gray-50 rounded-lg transition text-left cursor-pointer text-[#3b4a54] font-semibold"
                      >
                        <User className="w-4 h-4 text-[#008069]" />
                        <span>Lihat Info Kontak</span>
                      </button>
                      <button
                        onClick={() => {
                          setChatDrawerTab("theme");
                          setIsChatDrawerOpen(true);
                          setShowNameMenu(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 hover:bg-gray-50 rounded-lg transition text-left cursor-pointer text-[#3b4a54] font-semibold"
                      >
                        <Palette className="w-4 h-4 text-purple-600" />
                        <span>Wallpaper & Tema Chat 🎨</span>
                      </button>
                      <button
                        onClick={() => {
                          setChatDrawerTab("gallery");
                          setIsChatDrawerOpen(true);
                          setShowNameMenu(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 hover:bg-gray-50 rounded-lg transition text-left cursor-pointer text-[#3b4a54] font-semibold"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>Lihat Galeri Media</span>
                      </button>
                      <button
                        onClick={() => {
                          setChatDrawerTab("favorites");
                          setIsChatDrawerOpen(true);
                          setShowNameMenu(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 hover:bg-gray-50 rounded-lg transition text-left cursor-pointer text-[#3b4a54] font-semibold"
                      >
                        <Star className="w-4 h-4 text-amber-500 fill-amber-100" />
                        <span>Pesan Berbintang</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Header Action Controls (Voice call, video call icons!) */}
                <div className="flex items-center space-x-2 text-[#54656F]">
                  <button
                    onClick={() => handleTriggerCall("audio")}
                    className="p-2 hover:bg-[#E1E3E6] rounded-full transition cursor-pointer"
                    title="Panggilan Suara Romantis"
                  >
                    <Phone className="w-4 h-4 text-[#008069]" />
                  </button>
                  <button
                    onClick={() => handleTriggerCall("video")}
                    className="p-2 hover:bg-[#E1E3E6] rounded-full transition cursor-pointer"
                    title="Panggilan Video Romantis"
                  >
                    <Video className="w-4 h-4 text-[#008069]" />
                  </button>
                  <button 
                    onClick={() => alert(`Status: Aktif sebagai ${activeUser}`)}
                    className="p-2 hover:bg-[#E1E3E6] rounded-full transition cursor-pointer"
                    title="Menu Lainnya"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ACTIVE TAB COMPONENT WRAPPER */}
              {activeTab === "obrolan" ? (
                <ChatMediaGallery
                  messages={state.chatMessages}
                  onSendMessage={handleSendMessage}
                  onToggleFavorite={handleToggleFavorite}
                  activeUser={activeUser}
                  partner1={state.partner1}
                  partner2={state.partner2}
                  isDrawerOpenProp={isChatDrawerOpen}
                  drawerTabProp={chatDrawerTab}
                  onDrawerOpenChange={setIsChatDrawerOpen}
                  onDrawerTabChange={setChatDrawerTab}
                />
              ) : (
                <div className="flex-1 overflow-y-auto p-3 sm:p-5 relative z-10 scrollbar-thin">
                  <div className="max-w-5xl mx-auto space-y-6">
                    {activeTab === "beranda" && (
                      <RelationTimer
                        startDateStr={state.relationshipStartDate}
                        partner1={state.partner1}
                        partner2={state.partner2}
                        onUpdateStartDate={handleUpdateStartDate}
                        onUpdatePartners={handleUpdatePartners}
                        activeUser={activeUser}
                      />
                    )}

                    {activeTab === "catatan" && (
                      <SharedNotes
                        initialNotes={state.notes}
                        onSaveNotes={handleSaveNotes}
                      />
                    )}

                    {activeTab === "todos" && (
                      <div className="space-y-6">
                        <SharedTodos
                          todos={state.todos}
                          onAddTodo={handleAddTodo}
                          onToggleTodo={handleToggleTodo}
                          onDeleteTodo={handleDeleteTodo}
                          activeUser={activeUser}
                        />
                        <SharedCalendar
                          events={state.calendarEvents}
                          onAddEvent={handleAddEvent}
                          onDeleteEvent={handleDeleteEvent}
                          activeUser={activeUser}
                        />
                      </div>
                    )}

                    {activeTab === "album" && (
                      <SharedMemories
                        memories={state.memories}
                        onAddMemory={handleAddMemory}
                        onDeleteMemory={handleDeleteMemory}
                        activeUser={activeUser}
                      />
                    )}

                    {activeTab === "peta" && (
                      <LiveLocation
                        state={state}
                        activeUser={activeUser}
                        onUpdateState={fetchState}
                      />
                    )}

                    {activeTab === "capsule" && (
                      <LoveCapsuleSection
                        capsules={state.loveCapsules}
                        onAddCapsule={handleAddCapsule}
                        onOpenCapsule={handleOpenCapsule}
                        activeUser={activeUser}
                      />
                    )}

                    {activeTab === "arrival" && (
                      <SafeArrivalSection
                        arrivals={state.safeArrivals}
                        partner1={state.partner1}
                        partner2={state.partner2}
                        onArrive={handleArrive}
                        activeUser={activeUser}
                      />
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

      </div>

      {/* REAL-TIME SYNCHRONIZED ROMANTIC CALL SCREEN MODAL */}
      <AnimatePresence>
        {state?.activeCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-[#0B141A] text-white flex flex-col justify-between p-4 sm:p-8 font-sans overflow-y-auto"
          >
            {/* Call Header */}
            <div className="text-center pt-2 sm:pt-6 shrink-0">
              <span className="text-[10px] text-[#8696A0] uppercase tracking-widest block mb-1 font-mono">
                🔒 Panggilan Privat Enkripsi Ujung-ke-Ujung
              </span>
              <h2 className="text-xl sm:text-3xl font-bold mt-1 text-white">
                {state.activeCall.caller === activeUser ? state.activeCall.receiver : state.activeCall.caller}
              </h2>

              {/* Status Subtitle */}
              {state.activeCall.status === "calling" && (
                state.activeCall.caller === activeUser ? (
                  <div className="space-y-1 mt-1">
                    <p className="text-xs sm:text-sm text-[#00A884] font-semibold tracking-wide animate-pulse">
                      Memanggil {state.activeCall.receiver}... 💖
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-400 max-w-xs mx-auto">
                      Menunggu {state.activeCall.receiver} membuka aplikasi dan menjawab panggilan...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 mt-1">
                    <p className="text-xs sm:text-sm text-emerald-400 font-bold tracking-wide animate-bounce">
                      Panggilan {state.activeCall.type === "video" ? "Video" : "Suara"} Masuk... 📞
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-300">
                      {state.activeCall.caller} sedang memanggilmu!
                    </p>
                  </div>
                )
              )}

              {state.activeCall.status === "connected" && (
                <p className="text-xs sm:text-sm text-[#00A884] font-semibold mt-1 tracking-wide flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00A884] animate-ping" />
                  <span>Tersambung • {formatDuration(callDuration)}</span>
                </p>
              )}

              {state.activeCall.status === "declined" && (
                <p className="text-xs sm:text-sm text-rose-400 font-semibold mt-1">
                  Panggilan Ditolak oleh {state.activeCall.receiver === activeUser ? state.activeCall.caller : state.activeCall.receiver}
                </p>
              )}
            </div>

            {/* Center Area: Live Video Camera or Avatar Circle */}
            {state.activeCall.type === "video" ? (
              <div className="flex-1 my-auto flex flex-col items-center justify-center relative w-full max-w-lg mx-auto py-2 min-h-0">
                <div className="relative w-full aspect-[4/3] sm:aspect-video max-h-[40vh] sm:max-h-[50vh] bg-[#111B21] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl flex items-center justify-center">
                  {/* Live WebCam Stream */}
                  {!isVideoOff && (
                    <video
                      ref={setVideoElementRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                  )}

                  {/* Fallback / Video Off Overlay */}
                  {(isVideoOff || cameraPermissionError || !cameraStream) && (
                    <div className="absolute inset-0 bg-[#111B21] flex flex-col items-center justify-center p-4 text-center space-y-2 z-0">
                      {isVideoOff ? (
                        <>
                          <div className="p-3 bg-rose-500/10 rounded-full text-rose-400">
                            <VideoOff className="w-8 h-8" />
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-200">
                            Kamera Dinonaktifkan
                          </p>
                          <button
                            onClick={() => setIsVideoOff(false)}
                            className="px-3 py-1.5 bg-[#00A884] hover:bg-[#008069] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                          >
                            Nyalakan Kamera 🎥
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/20 animate-ping absolute inset-0" />
                            <div className="p-3.5 bg-emerald-500/10 rounded-full text-emerald-400 relative z-10 border border-emerald-500/30">
                              <Video className="w-7 h-7 animate-pulse" />
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-200 max-w-xs">
                            {cameraPermissionError || "Menghubungkan Kamera Langsung..."}
                          </p>
                          <div className="flex flex-wrap justify-center gap-2 pt-1">
                            <button
                              onClick={startCameraStream}
                              className="px-3 py-1.5 bg-[#00A884] hover:bg-[#008069] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex items-center space-x-1"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Buka / Izinkan Akses Kamera 🎥</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Partner Floating Badge in Top-Right Corner */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl border border-white/10 flex items-center space-x-1.5 sm:space-x-2 shadow-lg z-10">
                    {(() => {
                      const partnerObj = state.activeCall.caller === activeUser
                        ? (activeUser === "Grace" ? state.partner2 : state.partner1)
                        : (activeUser === "Grace" ? state.partner1 : state.partner2);
                      const partnerAvatar = partnerObj?.avatar;
                      const partnerName = state.activeCall.caller === activeUser ? state.activeCall.receiver : state.activeCall.caller;

                      return (
                        <>
                          {partnerAvatar && (partnerAvatar.startsWith("http") || partnerAvatar.startsWith("data:")) ? (
                            <img src={partnerAvatar} alt={partnerName} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px] sm:text-xs shrink-0">
                              {partnerName.slice(0, 1)}
                            </div>
                          )}
                          <span className="text-[11px] sm:text-xs font-medium text-white">{partnerName}</span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Live Indicator on Video Feed */}
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-emerald-600/80 backdrop-blur-md text-white text-[10px] sm:text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full flex items-center space-x-1 font-medium z-10">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-ping" />
                    <span>Kamera Langsung ({activeUser})</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Center Avatar Circle for Voice Calls */
              <div className="flex flex-col items-center justify-center my-auto py-4">
                <div className="relative">
                  {state.activeCall.status === "calling" && (
                    <>
                      <span className="absolute inset-0 bg-[#00A884]/30 rounded-full animate-ping scale-150" />
                      <span className="absolute inset-0 bg-[#00A884]/20 rounded-full animate-ping scale-200" />
                    </>
                  )}
                  {state.activeCall.status === "connected" && (
                    <span className="absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse scale-125" />
                  )}

                  {/* Avatar picture or initial */}
                  {(() => {
                    const partnerObj = state.activeCall.caller === activeUser
                      ? (activeUser === "Grace" ? state.partner2 : state.partner1)
                      : (activeUser === "Grace" ? state.partner1 : state.partner2);
                    const partnerAvatar = partnerObj?.avatar;
                    const partnerName = state.activeCall.caller === activeUser ? state.activeCall.receiver : state.activeCall.caller;

                    return partnerAvatar && (partnerAvatar.startsWith("http") || partnerAvatar.startsWith("data:")) ? (
                      <img
                        src={partnerAvatar}
                        alt={partnerName}
                        className="w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-[#00A884] shadow-2xl relative z-10"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full flex items-center justify-center text-white text-3xl sm:text-5xl font-extrabold shadow-2xl relative z-10 border-4 border-[#00A884] bg-emerald-700">
                        {partnerName.slice(0, 1).toUpperCase()}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="space-y-4 sm:space-y-6 pb-2 sm:pb-6 shrink-0">
              {/* Controls when call is INCOMING for receiver */}
              {state.activeCall.status === "calling" && state.activeCall.receiver === activeUser ? (
                <div className="flex items-center justify-center space-x-8 sm:space-x-12">
                  {/* Decline button */}
                  <div className="flex flex-col items-center space-y-1.5">
                    <button
                      onClick={handleDeclineCall}
                      className="p-4 sm:p-5 bg-[#EA0038] hover:bg-[#C80030] active:scale-95 text-white rounded-full transition shadow-xl cursor-pointer flex items-center justify-center"
                      title="Tolak Panggilan"
                    >
                      <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                    <span className="text-xs text-rose-300 font-semibold">Tolak</span>
                  </div>

                  {/* Answer button */}
                  <div className="flex flex-col items-center space-y-1.5">
                    <button
                      onClick={handleAnswerCall}
                      className="p-4 sm:p-5 bg-[#00A884] hover:bg-[#008069] active:scale-95 text-white rounded-full transition shadow-xl cursor-pointer flex items-center justify-center animate-bounce"
                      title="Terima Panggilan"
                    >
                      <Phone className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                    <span className="text-xs text-emerald-300 font-semibold">Terima</span>
                  </div>
                </div>
              ) : (
                /* Controls when calling or connected */
                <>
                  <div className="flex justify-center items-center space-x-4 sm:space-x-6">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 sm:p-3.5 rounded-full transition cursor-pointer ${
                        isMuted ? "bg-white text-black" : "bg-[#202C33] hover:bg-[#323D45] text-white"
                      }`}
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {state.activeCall.type === "video" && (
                      <button
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`p-3 sm:p-3.5 rounded-full transition cursor-pointer ${
                          isVideoOff ? "bg-rose-600 text-white" : "bg-[#202C33] hover:bg-[#323D45] text-white"
                        }`}
                        title={isVideoOff ? "Nyalakan Kamera" : "Matikan Kamera"}
                      >
                        {isVideoOff ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    )}

                    <button
                      onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                      className={`p-3 sm:p-3.5 rounded-full transition cursor-pointer ${
                        isSpeakerOn ? "bg-white text-black" : "bg-[#202C33] hover:bg-[#323D45] text-white"
                      }`}
                      title={isSpeakerOn ? "Matikan Speaker" : "Aktifkan Speaker"}
                    >
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* Red Hangup / Cancel Call button */}
                  <div className="flex flex-col items-center space-y-1.5">
                    <button
                      onClick={handleEndCall}
                      className="p-4 sm:p-5 bg-[#EA0038] hover:bg-[#C80030] active:scale-95 text-white rounded-full transition shadow-xl shrink-0 cursor-pointer flex items-center justify-center"
                      title="Tutup Panggilan"
                    >
                      <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </button>
                    <span className="text-xs text-gray-300 font-medium">
                      {state.activeCall.status === "calling" ? "Batal / Tutup" : "Akhiri Panggilan"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isProfileModalOpen && state && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden flex flex-col font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-[#008069] text-white px-5 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <h3 className="font-bold text-sm tracking-wide">Ubah Profil {activeUser}</h3>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto max-h-[75vh] space-y-4 text-xs">
                {/* Avatar Preview */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative group">
                    {editingAvatar && (editingAvatar.startsWith("http") || editingAvatar.startsWith("data:")) ? (
                      <img
                        src={editingAvatar}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-[#008069] shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-[#FFE2E2] text-rose-600 border-2 border-dashed border-[#008069] flex items-center justify-center font-bold text-3xl shadow-inner uppercase font-serif">
                        {editingName ? editingName.slice(0, 1).toUpperCase() : "?"}
                      </div>
                    )}
                    {editingAvatar && (
                      <button
                        onClick={() => setEditingAvatar("")}
                        className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 shadow cursor-pointer transition"
                        title="Hapus foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Drag and Drop File Upload Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`w-full p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${
                      dragActive
                        ? "border-[#008069] bg-[#e1f3f0]"
                        : "border-gray-300 hover:border-[#008069] hover:bg-gray-50"
                    }`}
                  >
                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                    <p className="text-[10px] text-gray-500 text-center">
                      Seret & lepas foto di sini, atau{" "}
                      <label className="text-[#008069] font-bold underline cursor-pointer hover:text-[#005c4b]">
                        pilih file
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageFileChange(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Maksimal 2MB (format PNG, JPG)</p>
                  </div>

                  {/* Or Tautan URL Input */}
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Atau Tempel Tautan Foto (URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#008069] text-[#4A403A]"
                      value={editingAvatar.startsWith("data:") ? "" : editingAvatar}
                      onChange={(e) => setEditingAvatar(e.target.value)}
                    />
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nama Panggilan</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#008069] text-[#4A403A]"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bio / Status Cinta</label>
                    <textarea
                      rows={3}
                      placeholder="Tulis bio romantis atau statusmu di sini..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#008069] text-[#4A403A] resize-none"
                      value={editingBio}
                      onChange={(e) => setEditingBio(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-5 py-3.5 flex justify-end space-x-2 border-t border-gray-100">
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile || !editingName.trim()}
                  className="px-4 py-2 text-xs bg-[#008069] text-white font-bold hover:bg-[#005c4b] disabled:bg-gray-300 rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSavingProfile ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PWA INSTALL & DOWNLOAD APP MODAL */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#008069] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-6 h-6 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-base">Unduh Aplikasi KopelChat 📲</h3>
                  <p className="text-[10px] text-emerald-100">Siap di-install di HP Android, iOS, &amp; Laptop/PC</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs text-gray-700 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3">
                <Download className="w-6 h-6 text-[#008069] shrink-0" />
                <div>
                  <span className="font-bold text-gray-900 block">PWA Native Application</span>
                  <span className="text-[11px] text-gray-600">Aplikasi ini berjalan layaknya aplikasi native tanpa perlu mendownload APK manual dari store.</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1 flex items-center space-x-1.5">
                  <span>📱 Cara Install di Android / Google Chrome:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-600 pl-1">
                  <li>Ketuk tombol titik tiga <strong>(⋮)</strong> di sudut kanan atas browser.</li>
                  <li>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.</li>
                  <li>Aplikasi akan muncul langsung di menu HP Anda!</li>
                </ol>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1 flex items-center space-x-1.5">
                  <span>🍏 Cara Install di iPhone / iOS Safari:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-600 pl-1">
                  <li>Buka aplikasi ini di browser <strong>Safari</strong>.</li>
                  <li>Ketuk ikon <strong>Bagikan (Share 📤)</strong> di bagian bawah layar.</li>
                  <li>Pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</li>
                </ol>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1 flex items-center space-x-1.5">
                  <span>💻 Cara Install di Laptop / Desktop PC:</span>
                </h4>
                <p className="text-gray-600">
                  Klik ikon <strong>Install / Download</strong> di sebelah bilah alamat (address bar) browser Chrome/Edge Anda.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-5 py-3.5 flex justify-end border-t border-gray-100">
              <button
                onClick={() => setShowInstallModal(false)}
                className="px-5 py-2 bg-[#008069] hover:bg-[#005c4b] text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Mengerti &amp; Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating hearts collection container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {floatingHearts.map((h) => (
          <span
            key={h.id}
            className="absolute text-[#BC8F8F] font-serif select-none pointer-events-none animate-float-heart"
            style={{ left: h.x, top: h.y }}
          >
            ❤️
          </span>
        ))}
      </div>

    </div>
  );
}
