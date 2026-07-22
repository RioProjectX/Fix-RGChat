export interface Partner {
  name: string;
  avatar: string;
  address: string;
  office: string;
  bio?: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  completedBy: string;
  dueDate: string;
  reminder: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "anniversary" | "date" | "birthday" | "other";
  date: string;
  description: string;
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isFavorited: boolean;
  mediaUrl?: string;
  mediaType?: string; // "image" | "video" | ""
  isRead?: boolean;
}

export interface Memory {
  id: string;
  imageUrl: string;
  title: string;
  date: string;
  caption: string;
  location: string;
  createdBy: string;
  createdAt: string;
}

export interface MapPin {
  id: string;
  title: string;
  lat: number; // Percentage coordinate (0-100) for custom vector map canvas
  lng: number; // Percentage coordinate (0-100) for custom vector map canvas
  description: string;
  category: "special" | "holiday" | "date" | "other";
  date: string;
  photoUrl: string;
}

export interface LoveCapsule {
  id: string;
  sender: string;
  message: string;
  mediaUrl: string;
  unlockDate: string;
  isOpened: boolean;
  createdAt: string;
}

export interface SafeArrival {
  id: string;
  user: string;
  locationName: string;
  arrivedAt: string;
  type: "home" | "office" | "other";
}

export interface CoupleNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ActiveCallState {
  id: string;
  caller: string;
  receiver: string;
  type: "audio" | "video";
  status: "calling" | "connected" | "declined" | "ended";
  createdAt: string;
  startedAt?: string;
}

export interface UserLiveLocation {
  user: "Grace" | "Rio";
  lat: number;
  lng: number;
  accuracy?: number;
  updatedAt: string;
  isSharing: boolean;
  addressName?: string;
  statusNote?: string;
  batteryLevel?: number;
}

export interface AppState {
  relationshipStartDate: string;
  partner1: Partner;
  partner2: Partner;
  notes: string;
  todos: Todo[];
  calendarEvents: CalendarEvent[];
  chatMessages: ChatMessage[];
  memories: Memory[];
  mapPins: MapPin[];
  loveCapsules: LoveCapsule[];
  safeArrivals: SafeArrival[];
  notifications: CoupleNotification[];
  liveLocations?: {
    Grace?: UserLiveLocation;
    Rio?: UserLiveLocation;
  };
  lastActiveGrace?: string;
  lastActiveRio?: string;
  activeCall?: ActiveCallState | null;
}

export const INITIAL_DEFAULT_STATE: AppState = {
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
