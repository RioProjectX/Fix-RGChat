import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Heart, Image as ImageIcon, Send, Star, 
  Trash, X, Info, Paperclip, Smile, CheckCheck, 
  ChevronRight, User, ShieldCheck, Search, Palette,
  Upload, RotateCcw, Check, Sliders, Sparkles, Camera, VideoOff, RefreshCw
} from "lucide-react";
import { ChatMessage, Partner } from "../types";

export interface ChatThemeConfig {
  wallpaperType: "color" | "preset_image" | "custom";
  wallpaperValue: string;
  overlayOpacity: number;
  bubbleTheme: "emerald" | "rose" | "sky" | "purple" | "dark";
  usePatternOverlay: boolean;
}

const DEFAULT_THEME_CONFIG: ChatThemeConfig = {
  wallpaperType: "color",
  wallpaperValue: "#efeae2",
  overlayOpacity: 0.15,
  bubbleTheme: "emerald",
  usePatternOverlay: true
};

const WALLPAPER_COLOR_PRESETS = [
  { id: "whatsapp-classic", name: "WhatsApp Classic", bg: "#efeae2", isDark: false },
  { id: "soft-rose", name: "Soft Rose", bg: "#fdf2f4", isDark: false },
  { id: "sage-green", name: "Sage Garden", bg: "#e8ece9", isDark: false },
  { id: "lavender-dream", name: "Lavender Dream", bg: "#f3e8ff", isDark: false },
  { id: "midnight-dark", name: "Midnight Dark", bg: "#0b141a", isDark: true },
  { id: "sunset-warm", name: "Sunset Gold", bg: "#fef3c7", isDark: false },
  { id: "ocean-breeze", name: "Ocean Breeze", bg: "#e0f2fe", isDark: false },
];

const WALLPAPER_IMAGE_PRESETS = [
  {
    id: "romantic-sunset",
    name: "Siluet Senja",
    url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "sakura-blossom",
    name: "Sakura Bunga",
    url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "starry-sky",
    name: "Malam Berbintang",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "cozy-cafe",
    name: "Kedai Kopi",
    url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "heart-bokeh",
    name: "Cahaya Cinta",
    url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "beach-couple",
    name: "Pantai Romantis",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80"
  }
];

const BUBBLE_THEMES = [
  {
    id: "emerald",
    name: "Hijau WhatsApp",
    selfBg: "bg-[#d9fdd3] text-[#111b21] border-[#c1ebd0]/30",
    partnerBg: "bg-white text-[#111b21] border-[#e9edef]",
    accent: "#00a884"
  },
  {
    id: "rose",
    name: "Merah Muda Cinta",
    selfBg: "bg-[#ffe4e6] text-[#881337] border-[#fecdd3]",
    partnerBg: "bg-white text-[#881337] border-[#ffe4e6]",
    accent: "#e11d48"
  },
  {
    id: "sky",
    name: "Biru Cerah",
    selfBg: "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]",
    partnerBg: "bg-white text-[#0369a1] border-[#e0f2fe]",
    accent: "#0284c7"
  },
  {
    id: "purple",
    name: "Ungu Amethyst",
    selfBg: "bg-[#f3e8ff] text-[#581c87] border-[#e9d5ff]",
    partnerBg: "bg-white text-[#581c87] border-[#f3e8ff]",
    accent: "#9333ea"
  },
  {
    id: "dark",
    name: "Hitam Elegan",
    selfBg: "bg-[#005c4b] text-white border-[#00a884]/30",
    partnerBg: "bg-[#202c33] text-white border-[#222d34]",
    accent: "#00a884"
  }
];

interface ChatMediaGalleryProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, mediaUrl: string) => Promise<void>;
  onToggleFavorite: (id: string) => Promise<void>;
  activeUser: string;
  partner1?: Partner;
  partner2?: Partner;
  isDrawerOpenProp?: boolean;
  drawerTabProp?: "info" | "favorites" | "gallery" | "theme";
  onDrawerOpenChange?: (open: boolean) => void;
  onDrawerTabChange?: (tab: "info" | "favorites" | "gallery" | "theme") => void;
}

export default function ChatMediaGallery({
  messages,
  onSendMessage,
  onToggleFavorite,
  activeUser,
  partner1,
  partner2,
  isDrawerOpenProp,
  drawerTabProp,
  onDrawerOpenChange,
  onDrawerTabChange
}: ChatMediaGalleryProps) {
  const [inputText, setInputText] = useState("");
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Hidden File Input Ref for Media Uploads
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Mohon pilih file foto atau video!");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("Ukuran file maksimal 15MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMediaUrlInput(event.target.result as string);
        setShowMediaInput(true);
      }
    };
    reader.readAsDataURL(file);
    setShowAttachmentMenu(false);
    if (e.target) e.target.value = "";
  };

  // Direct WebCam Camera Snap state
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraSnapStream, setCameraSnapStream] = useState<MediaStream | null>(null);
  const [cameraSnapErr, setCameraSnapErr] = useState("");
  const snapVideoRef = useRef<HTMLVideoElement | null>(null);
  const snapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const startSnapCamera = async () => {
    setCameraSnapErr("");
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        setCameraSnapStream(stream);
        if (snapVideoRef.current) {
          snapVideoRef.current.srcObject = stream;
          snapVideoRef.current.play().catch(console.warn);
        }
      } else {
        setCameraSnapErr("Browser tidak mendukung kamera.");
      }
    } catch (e: any) {
      console.warn("Snap camera error:", e);
      setCameraSnapErr("Kamera tidak dapat diakses. Mohon izinkan akses kamera di browser Anda.");
    }
  };

  const stopSnapCamera = () => {
    if (cameraSnapStream) {
      cameraSnapStream.getTracks().forEach((track) => track.stop());
      setCameraSnapStream(null);
    }
  };

  const openCameraModal = () => {
    setShowCameraModal(true);
    setShowAttachmentMenu(false);
    startSnapCamera();
  };

  const handleCapturePhoto = () => {
    if (!snapVideoRef.current || !snapCanvasRef.current) return;
    const video = snapVideoRef.current;
    const canvas = snapCanvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setMediaUrlInput(dataUrl);
      setShowMediaInput(true);
      stopSnapCamera();
      setShowCameraModal(false);
    }
  };
  
  // Chat Theme & Wallpaper State
  const [themeConfig, setThemeConfig] = useState<ChatThemeConfig>(() => {
    try {
      const saved = localStorage.getItem("chat_theme_config");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_THEME_CONFIG;
  });

  const [customWallpaperUrlInput, setCustomWallpaperUrlInput] = useState("");
  const wallpaperFileInputRef = useRef<HTMLInputElement>(null);

  const saveThemeConfig = (newConfig: ChatThemeConfig) => {
    setThemeConfig(newConfig);
    try {
      localStorage.setItem("chat_theme_config", JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUploadWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file gambar maksimal 5MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        saveThemeConfig({
          ...themeConfig,
          wallpaperType: "custom",
          wallpaperValue: event.target.result as string
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // WhatsApp Style Drawer/Right Panel State
  const [localIsDrawerOpen, setLocalIsDrawerOpen] = useState(false);
  const [localDrawerTab, setLocalDrawerTab] = useState<"info" | "favorites" | "gallery" | "theme">("info");

  const isControlled = isDrawerOpenProp !== undefined;
  const isDrawerOpen = isControlled ? isDrawerOpenProp : localIsDrawerOpen;
  const drawerTab = isControlled && drawerTabProp ? drawerTabProp : localDrawerTab;

  const setIsDrawerOpen = (open: boolean) => {
    if (onDrawerOpenChange) {
      onDrawerOpenChange(open);
    }
    setLocalIsDrawerOpen(open);
  };

  const setDrawerTab = (tab: "info" | "favorites" | "gallery" | "theme") => {
    if (onDrawerTabChange) {
      onDrawerTabChange(tab);
    }
    setLocalDrawerTab(tab);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark partner messages as read when viewing room chat
  useEffect(() => {
    if (activeUser) {
      fetch("/api/chat-message/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: activeUser })
      }).catch(console.error);
    }
  }, [activeUser, messages.length]);

  // Close attachment menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setShowAttachmentMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !mediaUrlInput.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(inputText.trim(), mediaUrlInput.trim());
      setInputText("");
      setMediaUrlInput("");
      setShowMediaInput(false);
      setShowAttachmentMenu(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const openDrawerTab = (tab: "info" | "favorites" | "gallery" | "theme") => {
    setDrawerTab(tab);
    setIsDrawerOpen(true);
    setShowAttachmentMenu(false);
  };

  const favoriteMessages = messages.filter((m) => m.isFavorited);
  const mediaGallery = messages.filter((m) => m.mediaUrl);
  const partnerName = activeUser === "Grace" ? "Rio" : "Grace";

  const activeBubbleTheme = BUBBLE_THEMES.find(t => t.id === themeConfig.bubbleTheme) || BUBBLE_THEMES[0];

  const containerStyle: React.CSSProperties = {};
  if (themeConfig.wallpaperType === "color") {
    containerStyle.backgroundColor = themeConfig.wallpaperValue;
  } else if (themeConfig.wallpaperType === "preset_image" || themeConfig.wallpaperType === "custom") {
    containerStyle.backgroundImage = `url(${themeConfig.wallpaperValue})`;
    containerStyle.backgroundSize = "cover";
    containerStyle.backgroundPosition = "center";
    containerStyle.backgroundRepeat = "no-repeat";
  }

  return (
    <div 
      className="flex-1 flex h-full overflow-hidden relative transition-colors duration-300" 
      style={containerStyle}
      id="whatsapp-roomchat-wrapper"
    >
      
      {/* LEFT AREA: ACTUAL CHAT THREAD */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Dimmer Overlay for Custom Wallpaper Readability */}
        <div 
          className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
          style={{ opacity: themeConfig.overlayOpacity }}
        />

        {/* WhatsApp Chat Wallpaper Pattern Overlay */}
        {themeConfig.usePatternOverlay && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:18px_18px] pointer-events-none opacity-30" />
        )}

        {/* Scrollable Chat Logs */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 relative z-10 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center text-[#8696A0] max-w-sm mx-auto p-4">
              <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center mb-3 shadow-sm backdrop-blur-sm">
                <MessageSquare className="w-8 h-8 text-[#00a884] opacity-80" />
              </div>
              <p className="text-sm font-bold text-[#111b21] bg-white/80 px-3 py-1 rounded-lg backdrop-blur-sm shadow-sm">
                Mulai Hubungan Lebih Dekat
              </p>
              <p className="text-xs text-[#3b4a54] mt-2 leading-relaxed bg-white/80 p-2.5 rounded-xl backdrop-blur-sm shadow-sm">
                Tuliskan sapaan manis atau kirimkan foto pertama untuk mengabadikan momen kalian hari ini.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isSelf = msg.sender === activeUser;
              const date = new Date(msg.timestamp);
              const formattedTime = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

              let showDateBanner = false;
              if (idx === 0) {
                showDateBanner = true;
              } else {
                const prevDate = new Date(messages[idx - 1].timestamp);
                if (prevDate.toDateString() !== date.toDateString()) {
                  showDateBanner = true;
                }
              }

              const formattedDateStr = date.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              });

              return (
                <div key={msg.id} className="space-y-2">
                  {showDateBanner && (
                    <div className="flex justify-center my-3.5">
                      <span className="bg-white/90 backdrop-blur-sm text-[#54656F] text-[10px] md:text-xs font-semibold px-3 py-1 rounded-lg shadow-sm border border-[#E9EDEF] uppercase tracking-wide">
                        {formattedDateStr}
                      </span>
                    </div>
                  )}

                  <div className={`flex ${isSelf ? "justify-end" : "justify-start"} w-full`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] md:max-w-[60%] px-3 py-1.5 rounded-2xl shadow-xs relative group transition-all duration-150 ${
                        isSelf
                          ? `${activeBubbleTheme.selfBg} rounded-tr-none border-t border-r`
                          : `${activeBubbleTheme.partnerBg} rounded-tl-none border-t border-l`
                      }`}
                    >
                      {/* Favorite star indicator inside bubble */}
                      {msg.isFavorited && (
                        <div className="absolute -top-1.5 -right-1.5 bg-amber-100 border border-amber-200 text-amber-500 rounded-full p-0.5 shadow-sm z-20">
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </div>
                      )}

                      {/* Photo Attachment inside bubble */}
                      {msg.mediaUrl && (
                        <div className="rounded-xl overflow-hidden mb-1 max-h-72 bg-black/5 flex items-center justify-center border border-black/5 relative group/img">
                          <img
                            src={msg.mediaUrl}
                            alt="Media"
                            className="w-full h-full object-cover rounded-xl max-h-68 cursor-pointer hover:opacity-95 transition"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          {!msg.text && (
                            <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg flex items-center space-x-1 text-[10px]">
                              <span className="font-sans">{formattedTime}</span>
                              {isSelf && (
                                <CheckCheck
                                  className={`w-3.5 h-3.5 select-none shrink-0 ${
                                    msg.isRead ? "text-[#53bdeb]" : "text-gray-300"
                                  }`}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text Content with Inline WhatsApp Timestamp & Read Status */}
                      {msg.text && (
                        <div className="text-[13px] md:text-sm leading-relaxed font-sans whitespace-pre-line break-words">
                          <span>{msg.text}</span>

                          {/* WhatsApp-Style Inline/Floated Time & Read Checkmark */}
                          <span className="inline-flex items-center space-x-1 float-right align-bottom ml-2 mt-1 -mr-0.5 select-none shrink-0">
                            <span className="text-[10px] opacity-70 font-medium font-sans">
                              {formattedTime}
                            </span>
                            {isSelf && (
                              <CheckCheck
                                className={`w-3.5 h-3.5 select-none shrink-0 ${
                                  msg.isRead ? "text-[#53bdeb]" : "text-[#8696a0]"
                                }`}
                              />
                            )}

                            {/* Fast Favorite action star toggled on hover */}
                            <button
                              onClick={() => onToggleFavorite(msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-gray-400 hover:text-amber-500 ml-0.5 cursor-pointer"
                              title={msg.isFavorited ? "Hapus dari Favorit" : "Simpan Favorit"}
                            >
                              <Star className={`w-3 h-3 ${msg.isFavorited ? "fill-amber-400 text-amber-500" : ""}`} />
                            </button>
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Hidden File Input for Device Media Uploads */}
        <input
          type="file"
          ref={mediaFileInputRef}
          onChange={handleMediaFileUpload}
          accept="image/*,video/*"
          className="hidden"
        />

        {/* BOTTOM WHATSAPP INPUT BAR */}
        <div className="p-2.5 bg-[#f0f2f5] border-t border-[#e9edef] z-20 relative flex-shrink-0">
          
          {/* Dynamic Image / Media Preview Drawer */}
          {showMediaInput && (
            <div className="mx-2 mb-2 p-3 bg-white rounded-2xl border border-[#e9edef] shadow-lg flex items-center justify-between gap-3 animate-slide-up">
              {mediaUrlInput ? (
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    <img src={mediaUrlInput} alt="Preview Media" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-[#111b21] block truncate">Media Siap Dikirim 🖼️</span>
                    <button
                      type="button"
                      onClick={() => mediaFileInputRef.current?.click()}
                      className="text-[11px] text-[#008069] font-semibold hover:underline cursor-pointer"
                    >
                      Ganti Foto / Video
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => mediaFileInputRef.current?.click()}
                    className="flex-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-[#008069] font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4 text-[#00a884]" />
                    <span>Pilih Foto / Video dari Perangkat HP / PC 📁</span>
                  </button>
                  <input
                    type="url"
                    placeholder="Atau Tempel URL Gambar..."
                    className="flex-1 bg-gray-50 text-xs text-[#3b4a54] placeholder-[#8696a0] outline-none border border-gray-200 rounded-xl px-3 py-1.5 focus:border-[#008069]"
                    value={mediaUrlInput}
                    onChange={(e) => setMediaUrlInput(e.target.value)}
                  />
                </div>
              )}

              <button 
                type="button"
                onClick={() => {
                  setMediaUrlInput("");
                  setShowMediaInput(false);
                }} 
                className="p-1.5 hover:bg-gray-100 rounded-full text-[#667781] cursor-pointer shrink-0"
                title="Batal Lampirkan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form Controls */}
          <form onSubmit={handleSend} className="flex items-center space-x-2 w-full relative">
            
            {/* Left Icons: Emoji (Visual) and Paperclip / Attachment */}
            <div className="flex items-center text-[#54656f]">
              <button
                type="button"
                className="p-2 hover:bg-[#d9dbde] rounded-full transition cursor-pointer"
                title="Emoji"
                onClick={() => alert("Fitur emoji segera hadir! Gunakan keyboard emoji bawaan sistem Anda untuk saat ini 😊")}
              >
                <Smile className="w-[22px] h-[22px]" />
              </button>

              <div className="relative" ref={attachmentMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className={`p-2 hover:bg-[#d9dbde] rounded-full transition cursor-pointer ${showAttachmentMenu ? "bg-[#d9dbde]" : ""}`}
                  title="Lampirkan Dokumen / Momen"
                >
                  <Paperclip className={`w-[21px] h-[21px] transform ${showAttachmentMenu ? "rotate-45" : ""}`} />
                </button>

                {/* Direct Camera Button */}
                <button
                  type="button"
                  onClick={openCameraModal}
                  className="p-2 hover:bg-[#d9dbde] rounded-full transition cursor-pointer text-[#54656f]"
                  title="Ambil Foto Kamera Langsung 📸"
                >
                  <Camera className="w-[21px] h-[21px]" />
                </button>

                {/* Attachment Floating Menu */}
                {showAttachmentMenu && (
                  <div className="absolute bottom-12 left-0 w-60 bg-white border border-[#e9edef] rounded-2xl shadow-xl p-2.5 space-y-1 z-50 animate-fade-in text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        mediaFileInputRef.current?.click();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl transition text-left cursor-pointer text-[#008069] font-bold border border-emerald-100"
                    >
                      <Upload className="w-4 h-4 text-[#00a884]" />
                      <span>Unggah Foto / Media dari HP 📁</span>
                    </button>

                    <button
                      type="button"
                      onClick={openCameraModal}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 hover:bg-gray-50 rounded-xl transition text-left cursor-pointer text-[#3b4a54] font-medium"
                    >
                      <Camera className="w-4 h-4 text-pink-600" />
                      <span>Ambil Foto Kamera Langsung 📸</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openDrawerTab("theme")}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 hover:bg-gray-50 rounded-xl transition text-left cursor-pointer text-[#3b4a54] font-medium"
                    >
                      <Palette className="w-4 h-4 text-purple-600" />
                      <span>Edit Wallpaper & Tema 🎨</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openDrawerTab("favorites")}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 hover:bg-gray-50 rounded-xl transition text-left cursor-pointer text-[#3b4a54] font-medium"
                    >
                      <Star className="w-4 h-4 text-amber-500 fill-amber-100" />
                      <span>Pesan Bintang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openDrawerTab("gallery")}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 hover:bg-gray-50 rounded-xl transition text-left cursor-pointer text-[#3b4a54] font-medium"
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      <span>Galeri Media</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openDrawerTab("info")}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 hover:bg-gray-50 rounded-xl transition text-left cursor-pointer text-[#3b4a54] font-medium"
                    >
                      <Info className="w-4 h-4 text-sky-500" />
                      <span>Detail Hubungan</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Input Text Box */}
            <input
              type="text"
              required={!mediaUrlInput.trim()}
              className="flex-1 bg-white border border-transparent rounded-lg px-4 py-2 text-[13px] md:text-sm text-[#111b21] placeholder-[#667781] focus:outline-none shadow-sm"
              placeholder="Ketik pesan..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isSending || (!inputText.trim() && !mediaUrlInput.trim())}
              className="p-2.5 bg-[#00a884] hover:bg-[#008069] disabled:opacity-50 text-white rounded-full flex items-center justify-center transition shadow-sm cursor-pointer shrink-0"
            >
              <Send className="w-4.5 h-4.5" />
            </button>

          </form>

        </div>

      </div>

      {/* RIGHT AREA: WHATSAPP-STYLE DRAWER / SIDE PANEL */}
      {isDrawerOpen && (
        <div className="w-[320px] md:w-[360px] bg-white border-l border-[#e9edef] flex flex-col h-full z-30 shrink-0 animate-slide-left shadow-lg">
          
          {/* Drawer Header */}
          <div className="bg-[#f0f2f5] p-4 flex items-center space-x-4 border-b border-[#e9edef] shrink-0">
            <button 
              onClick={() => setIsDrawerOpen(false)} 
              className="p-1 hover:bg-[#d9dbde] rounded-full text-[#54656f] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-[#111b21] text-sm flex-1 truncate">
              {drawerTab === "info" && "Info Kontak Pasangan"}
              {drawerTab === "theme" && "Edit Tema & Wallpaper Chat 🎨"}
              {drawerTab === "favorites" && `Pesan Berbintang (${favoriteMessages.length})`}
              {drawerTab === "gallery" && `Galeri Media (${mediaGallery.length})`}
            </h3>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto bg-[#f0f2f5] divide-y divide-[#e9edef] space-y-3.5 pb-8 scrollbar-thin">
            
            {/* TAB 1: RELATION DETAILS & PROFILE INFO */}
            {drawerTab === "info" && (() => {
              const partnerObj = partnerName.toLowerCase() === "grace" ? partner1 : partner2;
              const hasCustomAvatar = partnerObj?.avatar && (partnerObj.avatar.startsWith("http") || partnerObj.avatar.startsWith("data:"));
              return (
                <div className="space-y-3">
                  {/* Big Profile Card */}
                  <div className="bg-white p-5 flex flex-col items-center text-center shadow-sm">
                    {hasCustomAvatar ? (
                      <img 
                        src={partnerObj.avatar} 
                        alt={partnerName}
                        className="w-24 h-24 rounded-full object-cover border border-[#e6d5b8] shadow-md mb-3"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-[#faedcd] border border-[#e6d5b8] flex items-center justify-center font-bold text-3xl text-[#d4a373] shadow-inner mb-3">
                        {partnerName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <h4 className="font-bold text-[#111b21] text-base">{partnerName}</h4>
                    <p className="text-xs text-[#667781] mt-0.5">Online • Pacar Tersayang ❤️</p>
                  </div>

                  {/* Info Fields */}
                  <div className="bg-white p-4 shadow-sm space-y-3">
                    {partnerObj?.bio && (
                      <div className="border-b border-gray-100 pb-3">
                        <span className="text-[10px] text-[#667781] font-semibold uppercase tracking-wider block">Bio / Status</span>
                        <span className="text-xs text-[#111b21] font-medium block mt-1 whitespace-pre-wrap italic text-rose-600 font-serif">
                          "{partnerObj.bio}"
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-[#667781] font-semibold uppercase tracking-wider block">Status Hubungan</span>
                      <span className="text-xs text-[#111b21] font-medium block mt-1">
                        Berpacaran dengan penuh rasa sayang ✨
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#667781] font-semibold uppercase tracking-wider block">Simulator Peran</span>
                      <span className="text-xs text-[#00a884] font-bold block mt-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#00a884]" />
                        <span>Anda login sebagai {activeUser}</span>
                      </span>
                    </div>
                  </div>

                  {/* Quick Menu Links */}
                  <div className="bg-white shadow-sm divide-y divide-gray-100 text-xs text-[#3b4a54] font-medium">

                    <button 
                      onClick={() => setDrawerTab("theme")}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <Palette className="w-4 h-4 text-purple-600" />
                        <span>Wallpaper & Tema Chat</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[#8696a0]">
                        <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold">Ubah</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>

                    <button 
                      onClick={() => setDrawerTab("favorites")}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <Star className="w-4 h-4 text-[#8696a0] fill-[#8696a0]" />
                        <span>Pesan Berbintang</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[#8696a0]">
                        <span className="text-[10px] bg-[#f0f2f5] px-2 py-0.5 rounded-full font-bold">{favoriteMessages.length}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>

                    <button 
                      onClick={() => setDrawerTab("gallery")}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <ImageIcon className="w-4 h-4 text-[#8696a0]" />
                        <span>Media, Dokumen & Tautan</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[#8696a0]">
                        <span className="text-[10px] bg-[#f0f2f5] px-2 py-0.5 rounded-full font-bold">{mediaGallery.length}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* TAB 2: WALLPAPER & THEME EDITOR */}
            {drawerTab === "theme" && (
              <div className="p-3.5 space-y-4 text-xs font-sans">
                
                {/* Real-time mini preview box */}
                <div className="bg-white p-3 rounded-2xl border border-[#e9edef] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#3b4a54]">
                    <span>Pratinjau Tema & Wallpaper</span>
                    <button
                      onClick={() => saveThemeConfig(DEFAULT_THEME_CONFIG)}
                      className="text-[#008069] hover:underline flex items-center gap-1 font-semibold text-[10px] cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Default</span>
                    </button>
                  </div>

                  {/* Mini Chat Box Preview */}
                  <div
                    className="h-32 rounded-xl overflow-hidden relative p-2.5 flex flex-col justify-end space-y-1.5 border border-gray-200 shadow-inner"
                    style={
                      themeConfig.wallpaperType === "color"
                        ? { backgroundColor: themeConfig.wallpaperValue }
                        : {
                            backgroundImage: `url(${themeConfig.wallpaperValue})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                          }
                    }
                  >
                    {/* Dimmer layer */}
                    <div
                      className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-200"
                      style={{ opacity: themeConfig.overlayOpacity }}
                    />
                    {themeConfig.usePatternOverlay && (
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none opacity-30" />
                    )}

                    <div className="relative z-10 self-start max-w-[80%] bg-white text-[#111b21] p-1.5 px-2.5 rounded-lg rounded-tl-none shadow-sm text-[10px]">
                      Halo sayang, selamat hari ini! ❤️
                    </div>
                    <div className={`relative z-10 self-end max-w-[80%] p-1.5 px-2.5 rounded-lg rounded-tr-none shadow-sm text-[10px] ${activeBubbleTheme.selfBg}`}>
                      Iya cinta, aku juga kangen banget 🌸
                    </div>
                  </div>
                </div>

                {/* SECTION 1: UNGGAH FOTO WALLPAPER SENDIRI */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#e9edef] shadow-sm space-y-2.5">
                  <h4 className="font-bold text-[#111b21] flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#008069]" />
                    <span>Ganti Foto Wallpaper Sendiri</span>
                  </h4>
                  <p className="text-[11px] text-[#667781] leading-relaxed">
                    Unggah foto kenangan kalian berdua atau pasangan untuk dijadikan latar obrolan romantis.
                  </p>

                  <input
                    type="file"
                    ref={wallpaperFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUploadWallpaper}
                  />

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <button
                      onClick={() => wallpaperFileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-[#e1f3f0] hover:bg-[#c9ebd3] text-[#008069] font-bold rounded-xl flex items-center justify-center gap-2 border border-[#008069]/20 transition cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Pilih Foto dari Galeri HP / Komputer</span>
                    </button>

                    {/* Input URL Foto */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="url"
                        placeholder="Atau paste URL Foto di sini..."
                        value={customWallpaperUrlInput}
                        onChange={(e) => setCustomWallpaperUrlInput(e.target.value)}
                        className="flex-1 bg-[#f0f2f5] border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] text-[#111b21] placeholder-[#8696a0] outline-none focus:border-[#008069]"
                      />
                      <button
                        onClick={() => {
                          if (customWallpaperUrlInput.trim()) {
                            saveThemeConfig({
                              ...themeConfig,
                              wallpaperType: "custom",
                              wallpaperValue: customWallpaperUrlInput.trim()
                            });
                            setCustomWallpaperUrlInput("");
                          }
                        }}
                        disabled={!customWallpaperUrlInput.trim()}
                        className="px-2.5 py-1.5 bg-[#00a884] hover:bg-[#008069] disabled:opacity-40 text-white font-bold text-[10px] rounded-lg cursor-pointer shrink-0"
                      >
                        Terapkan
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: PRESET FOTO ROMANTIS */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#e9edef] shadow-sm space-y-2.5">
                  <h4 className="font-bold text-[#111b21] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Koleksi Foto Wallpaper Romantis</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {WALLPAPER_IMAGE_PRESETS.map((preset) => {
                      const isSelected =
                        themeConfig.wallpaperType === "preset_image" &&
                        themeConfig.wallpaperValue === preset.url;
                      return (
                        <button
                          key={preset.id}
                          onClick={() =>
                            saveThemeConfig({
                              ...themeConfig,
                              wallpaperType: "preset_image",
                              wallpaperValue: preset.url
                            })
                          }
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition cursor-pointer group ${
                            isSelected ? "border-[#00a884] ring-2 ring-[#00a884]/30" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={preset.preview}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-[#00a884] text-white p-0.5 rounded-full shadow">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                          <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-bold truncate drop-shadow text-center">
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: PRESET WARNA WALLPAPER */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#e9edef] shadow-sm space-y-2.5">
                  <h4 className="font-bold text-[#111b21] flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-indigo-500" />
                    <span>Warna Latar Belakang Chat</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {WALLPAPER_COLOR_PRESETS.map((colorItem) => {
                      const isSelected =
                        themeConfig.wallpaperType === "color" &&
                        themeConfig.wallpaperValue === colorItem.bg;
                      return (
                        <button
                          key={colorItem.id}
                          onClick={() =>
                            saveThemeConfig({
                              ...themeConfig,
                              wallpaperType: "color",
                              wallpaperValue: colorItem.bg
                            })
                          }
                          style={{ backgroundColor: colorItem.bg }}
                          className={`h-12 rounded-xl border-2 shadow-sm transition cursor-pointer flex flex-col items-center justify-center p-1 relative ${
                            isSelected ? "border-[#00a884] ring-2 ring-[#00a884]/30 scale-105" : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {isSelected && (
                            <div className="bg-[#00a884] text-white p-0.5 rounded-full shadow">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                          <span className={`text-[9px] font-bold mt-0.5 truncate max-w-full ${colorItem.isDark ? "text-white" : "text-gray-800"}`}>
                            {colorItem.name.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 4: GAYA BALON CHAT (BUBBLE COLORS) */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#e9edef] shadow-sm space-y-2.5">
                  <h4 className="font-bold text-[#111b21] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-rose-500" />
                    <span>Warna Balon Chat</span>
                  </h4>
                  <div className="space-y-1.5">
                    {BUBBLE_THEMES.map((b) => {
                      const isSelected = themeConfig.bubbleTheme === b.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() =>
                            saveThemeConfig({
                              ...themeConfig,
                              bubbleTheme: b.id as any
                            })
                          }
                          className={`w-full p-2 px-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? "border-[#00a884] bg-[#e1f3f0]/50 font-bold"
                              : "border-gray-100 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: b.accent }} />
                            <span className="text-[#111b21] text-xs">{b.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#00a884]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 5: DIMMER & PATTERN SLIDERS */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#e9edef] shadow-sm space-y-3">
                  <h4 className="font-bold text-[#111b21] flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>Efek & Kegelapan Wallpaper</span>
                  </h4>

                  {/* Dimmer Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#667781]">
                      <span>Kegelapan Wallpaper (Overlay)</span>
                      <span className="font-mono font-bold">{Math.round(themeConfig.overlayOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.8"
                      step="0.05"
                      value={themeConfig.overlayOpacity}
                      onChange={(e) =>
                        saveThemeConfig({
                          ...themeConfig,
                          overlayOpacity: parseFloat(e.target.value)
                        })
                      }
                      className="w-full accent-[#00a884] cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                    />
                  </div>

                  {/* Pattern Toggle */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span className="text-[11px] text-[#111b21] font-medium">Pola Grid WhatsApp Doodle</span>
                    <button
                      type="button"
                      onClick={() =>
                        saveThemeConfig({
                          ...themeConfig,
                          usePatternOverlay: !themeConfig.usePatternOverlay
                        })
                      }
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        themeConfig.usePatternOverlay ? "bg-[#00a884] justify-end" : "bg-gray-300 justify-start"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: STARRED / FAVORITE MESSAGES */}
            {drawerTab === "favorites" && (
              <div className="p-3 space-y-2.5">
                {favoriteMessages.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#3b4a54]">Belum ada pesan bintang</p>
                    <p className="text-[10px] text-[#8696a0] mt-1">Tekan ikon ⭐ pada balon chat untuk menyematkannya di sini.</p>
                  </div>
                ) : (
                  favoriteMessages.map((msg) => (
                    <div key={msg.id} className="bg-white p-3.5 rounded-xl border border-[#e9edef] shadow-sm space-y-2 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#008069] bg-[#e1f3f0] px-2 py-0.5 rounded-full uppercase">
                          {msg.sender}
                        </span>
                        <button
                          onClick={() => onToggleFavorite(msg.id)}
                          className="text-amber-500 hover:text-gray-300 transition cursor-pointer"
                          title="Hapus Bintang"
                        >
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        </button>
                      </div>
                      
                      <p className="text-xs text-[#111b21] leading-relaxed italic border-l-2 border-[#00a884] pl-2.5">
                        "{msg.text}"
                      </p>

                      {msg.mediaUrl && (
                        <div className="rounded-lg overflow-hidden border border-gray-100 max-h-36 max-w-full bg-gray-50">
                          <img
                            src={msg.mediaUrl}
                            alt="Favorite thumbnail"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <div className="text-[9px] text-[#8696a0] font-mono text-right">
                        {new Date(msg.timestamp).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} WIB
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: MEDIA GALLERY COLLECTIONS */}
            {drawerTab === "gallery" && (
              <div className="p-3 space-y-2.5">
                {mediaGallery.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#3b4a54]">Belum ada foto galeri</p>
                    <p className="text-[10px] text-[#8696a0] mt-1">Kirim chat disertai lampiran foto untuk mengisi album otomatis ini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl shadow-sm border border-[#e9edef]">
                    {mediaGallery.map((msg) => (
                      <div
                        key={msg.id}
                        className="relative bg-gray-100 aspect-square rounded-md overflow-hidden group hover:opacity-90 cursor-pointer border border-gray-50"
                        title={msg.text || "Foto Momen"}
                      >
                        <img
                          src={msg.mediaUrl}
                          alt="Album Item"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* CAMERA SNAPSHOT MODAL */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#111B21] border border-emerald-500/30 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl flex flex-col text-white">
            <div className="bg-[#202C33] p-4 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#00A884]" />
                <h3 className="font-bold text-sm">Ambil Foto Momen 📸</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopSnapCamera();
                  setShowCameraModal(false);
                }}
                className="p-1 hover:bg-gray-700/50 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-emerald-500/20 flex items-center justify-center shadow-inner">
                <video
                  ref={snapVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                <canvas ref={snapCanvasRef} className="hidden" />

                {cameraSnapErr && (
                  <div className="absolute inset-0 bg-[#111B21]/95 p-6 flex flex-col items-center justify-center text-center space-y-3">
                    <VideoOff className="w-10 h-10 text-rose-400" />
                    <p className="text-xs text-gray-300 font-medium">{cameraSnapErr}</p>
                    <button
                      type="button"
                      onClick={startSnapCamera}
                      className="px-4 py-2 bg-[#00A884] hover:bg-[#008069] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Coba Lagi Kamera</span>
                    </button>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-gray-400 text-center font-medium">
                Posisikan diri Anda dengan senyum manis lalu tekan tombol di bawah untuk mengambil foto! ✨
              </p>

              <div className="flex items-center justify-center space-x-3 w-full pt-1">
                <button
                  type="button"
                  onClick={() => {
                    stopSnapCamera();
                    setShowCameraModal(false);
                  }}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  disabled={!!cameraSnapErr}
                  className="flex-1 py-2.5 bg-[#00A884] hover:bg-[#008069] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-lg flex items-center justify-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ambil &amp; Kirim Foto 📸</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

