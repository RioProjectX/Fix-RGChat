import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Navigation, MapPin as MapPinIcon, RefreshCw, Compass, 
  ShieldCheck, Battery, Clock, Radio, Power, Send, 
  ExternalLink, Heart, AlertCircle, Sparkles, UserCheck, LocateFixed
} from "lucide-react";
import { AppState, UserLiveLocation } from "../types";

interface LiveLocationProps {
  state: AppState;
  activeUser: "Grace" | "Rio";
  onUpdateState: () => void;
}

// Calculate distance between two coordinates in km using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// Format timestamp cleanly in Indonesian
function formatTimeAgo(isoString?: string): string {
  if (!isoString) return "Belum pernah";
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 10) return "Baru saja";
  if (diffSec < 60) return `${diffSec} detik lalu`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function LiveLocation({ state, activeUser, onUpdateState }: LiveLocationProps) {
  const partnerUser = activeUser === "Grace" ? "Rio" : "Grace";
  const activePartnerInfo = activeUser === "Grace" ? state.partner1 : state.partner2;
  const targetPartnerInfo = partnerUser === "Grace" ? state.partner1 : state.partner2;

  const myLocation = state.liveLocations?.[activeUser];
  const partnerLocation = state.liveLocations?.[partnerUser];

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const myMarkerRef = useRef<L.Marker | null>(null);
  const partnerMarkerRef = useRef<L.Marker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);

  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string>("");
  const [statusNoteInput, setStatusNoteInput] = useState(myLocation?.statusNote || "");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | undefined>(myLocation?.batteryLevel);
  const [autoSync, setAutoSync] = useState(true);

  // Get Battery Level if supported
  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener("levelchange", () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }
  }, []);

  // Send coordinates to server
  const sendLocationToServer = useCallback(async (lat: number, lng: number, accuracy?: number, customNote?: string) => {
    try {
      // Reverse geocoding optional fetch
      let addressName = myLocation?.addressName || "Lokasi GPS";
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.display_name) {
            const parts = geoData.display_name.split(",");
            addressName = parts.slice(0, 3).join(", ");
          }
        }
      } catch (e) {
        // ignore geocode network errors
      }

      await fetch("/api/live-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: activeUser,
          lat,
          lng,
          accuracy: accuracy || 10,
          isSharing: true,
          addressName,
          statusNote: customNote !== undefined ? customNote : (myLocation?.statusNote || ""),
          batteryLevel
        })
      });
      onUpdateState();
    } catch (err) {
      console.error("Gagal mengirim lokasi ke server:", err);
    }
  }, [activeUser, myLocation?.addressName, myLocation?.statusNote, batteryLevel, onUpdateState]);

  // Request & Fetch current GPS position
  const handleFetchCurrentGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Browser Anda tidak mendukung Geolocation GPS.");
      return;
    }

    setIsGpsLoading(true);
    setGpsError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const { latitude, longitude, accuracy } = pos.coords;
        sendLocationToServer(latitude, longitude, accuracy);
      },
      (err) => {
        setIsGpsLoading(false);
        console.warn("GPS error:", err);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("Izin lokasi/GPS ditolak. Mohon aktifkan izin lokasi di browser Anda.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError("Informasi lokasi GPS tidak tersedia saat ini.");
        } else {
          setGpsError("Gagal mengambil koordinat GPS.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, [sendLocationToServer]);

  // Periodic GPS watch / auto sync
  useEffect(() => {
    if (!autoSync || !navigator.geolocation) return;

    // Initial GPS fetch
    handleFetchCurrentGps();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        sendLocationToServer(latitude, longitude, accuracy);
      },
      (err) => {
        console.warn("Watch position error:", err);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 15000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [autoSync, handleFetchCurrentGps, sendLocationToServer]);

  // Toggle Sharing On / Off
  const handleToggleSharing = async () => {
    const nextSharingState = !(myLocation?.isSharing ?? true);
    try {
      await fetch("/api/live-location/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: activeUser, isSharing: nextSharingState })
      });
      if (nextSharingState) {
        handleFetchCurrentGps();
      } else {
        onUpdateState();
      }
    } catch (e) {
      console.error("Gagal mengubah status berbagi lokasi:", e);
    }
  };

  // Submit Status Note Update
  const handleSaveStatusNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    try {
      const lat = myLocation?.lat || (activeUser === "Grace" ? -6.3686 : -6.2615);
      const lng = myLocation?.lng || (activeUser === "Grace" ? 106.8322 : 106.8152);
      await sendLocationToServer(lat, lng, myLocation?.accuracy, statusNoteInput);
      setIsUpdatingStatus(false);
    } catch (e) {
      setIsUpdatingStatus(false);
    }
  };

  // Create Leaflet Custom DivIcon for users
  const createAvatarMarkerIcon = (user: "Grace" | "Rio", isSelf: boolean) => {
    const isGrace = user === "Grace";
    const bgGradient = isGrace
      ? "from-rose-500 to-pink-600"
      : "from-teal-500 to-emerald-600";
    const ringColor = isGrace ? "border-pink-400" : "border-teal-400";
    const userAvatar = isGrace ? state.partner1?.avatar : state.partner2?.avatar;
    const name = user;

    let avatarHtml = `<div class="w-10 h-10 rounded-full bg-gradient-to-tr ${bgGradient} text-white font-bold flex items-center justify-center text-sm shadow-lg border-2 ${ringColor}">${name[0]}</div>`;

    if (userAvatar && (userAvatar.startsWith("http") || userAvatar.startsWith("data:"))) {
      avatarHtml = `<img src="${userAvatar}" class="w-10 h-10 rounded-full object-cover shadow-lg border-2 ${ringColor}" />`;
    }

    const html = `
      <div class="relative flex flex-col items-center justify-center group cursor-pointer">
        <div class="absolute -inset-2 rounded-full ${isGrace ? 'bg-pink-500/20' : 'bg-teal-500/20'} animate-ping"></div>
        <div class="relative z-10 transform transition group-hover:scale-110">
          ${avatarHtml}
        </div>
        <div class="mt-1 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md border border-white/20 flex items-center space-x-1">
          <span>${name}</span>
          ${isSelf ? '<span class="text-emerald-400">(Kamu)</span>' : ''}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-leaflet-marker",
      iconSize: [44, 54],
      iconAnchor: [22, 27]
    });
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultLat = myLocation?.lat || -6.315;
    const defaultLng = myLocation?.lng || 106.823;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Render / Update My Marker
    if (myLocation && myLocation.isSharing) {
      const myLatLng: L.LatLngExpression = [myLocation.lat, myLocation.lng];
      if (!myMarkerRef.current) {
        myMarkerRef.current = L.marker(myLatLng, {
          icon: createAvatarMarkerIcon(activeUser, true)
        }).addTo(map);
      } else {
        myMarkerRef.current.setLatLng(myLatLng);
        myMarkerRef.current.setIcon(createAvatarMarkerIcon(activeUser, true));
      }
      myMarkerRef.current.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
          <strong>📍 Lokasi Kamu (${activeUser})</strong><br/>
          <span>${myLocation.addressName || 'Lokasi GPS'}</span><br/>
          <small style="color: #666;">Status: ${myLocation.statusNote || '-'}</small>
        </div>
      `);
    } else if (myMarkerRef.current) {
      map.removeLayer(myMarkerRef.current);
      myMarkerRef.current = null;
    }

    // Render / Update Partner Marker
    if (partnerLocation && partnerLocation.isSharing) {
      const partnerLatLng: L.LatLngExpression = [partnerLocation.lat, partnerLocation.lng];
      if (!partnerMarkerRef.current) {
        partnerMarkerRef.current = L.marker(partnerLatLng, {
          icon: createAvatarMarkerIcon(partnerUser, false)
        }).addTo(map);
      } else {
        partnerMarkerRef.current.setLatLng(partnerLatLng);
        partnerMarkerRef.current.setIcon(createAvatarMarkerIcon(partnerUser, false));
      }
      partnerMarkerRef.current.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
          <strong>💖 Lokasi ${partnerUser}</strong><br/>
          <span>${partnerLocation.addressName || 'Lokasi GPS'}</span><br/>
          <small style="color: #666;">Status: ${partnerLocation.statusNote || '-'}</small>
        </div>
      `);
    } else if (partnerMarkerRef.current) {
      map.removeLayer(partnerMarkerRef.current);
      partnerMarkerRef.current = null;
    }

    // Connect line if both are sharing
    if (myLocation?.isSharing && partnerLocation?.isSharing) {
      const latLngs: L.LatLngExpression[] = [
        [myLocation.lat, myLocation.lng],
        [partnerLocation.lat, partnerLocation.lng]
      ];

      if (!lineRef.current) {
        lineRef.current = L.polyline(latLngs, {
          color: "#00A884",
          weight: 3,
          dashArray: "6, 8",
          opacity: 0.85
        }).addTo(map);
      } else {
        lineRef.current.setLatLngs(latLngs);
      }

      // Auto fit bounds to see both partners
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else {
      if (lineRef.current) {
        map.removeLayer(lineRef.current);
        lineRef.current = null;
      }
      if (myLocation?.isSharing) {
        map.setView([myLocation.lat, myLocation.lng], 14);
      } else if (partnerLocation?.isSharing) {
        map.setView([partnerLocation.lat, partnerLocation.lng], 14);
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [myLocation, partnerLocation, activeUser, partnerUser, state.partner1, state.partner2]);

  // Center on Me
  const handleCenterOnMe = () => {
    if (mapInstanceRef.current && myLocation) {
      mapInstanceRef.current.setView([myLocation.lat, myLocation.lng], 15);
    } else {
      handleFetchCurrentGps();
    }
  };

  // Center on Partner
  const handleCenterOnPartner = () => {
    if (mapInstanceRef.current && partnerLocation) {
      mapInstanceRef.current.setView([partnerLocation.lat, partnerLocation.lng], 15);
    }
  };

  // Calculate distance
  const distanceKm = (myLocation?.isSharing && partnerLocation?.isSharing)
    ? calculateDistance(myLocation.lat, myLocation.lng, partnerLocation.lat, partnerLocation.lng)
    : null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E6D5B8] p-4 md:p-6 space-y-6" id="live-location-card">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-[#008069] rounded-2xl border border-emerald-100">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#2A2421] flex items-center space-x-2">
              <span>Live Location Pasangan</span>
              <span className="text-xs bg-emerald-100 text-[#008069] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                GPS Real-Time
              </span>
            </h3>
            <p className="text-xs text-[#8B7E74]">
              Saling berbagi dan mengetahui keberadaan lokasi terkini dengan pasangan secara aman dan privat.
            </p>
          </div>
        </div>

        {/* Distance Badge Banner */}
        {distanceKm !== null ? (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3 flex items-center space-x-3 shadow-xs">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-bounce" />
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Jarak Kalian Berdua</span>
              <span className="text-sm font-extrabold text-[#008069]">
                {distanceKm < 0.1 ? "Sedang Bersama! ( < 100m ) 🥰" : `${distanceKm} km apart 💖`}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-center space-x-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Aktifkan GPS kedua pasangan untuk melihat jarak langsung!</span>
          </div>
        )}
      </div>

      {/* GPS Error Alert */}
      {gpsError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button
            onClick={handleFetchCurrentGps}
            className="px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
          >
            Izinkan / Coba Lagi
          </button>
        </div>
      )}

      {/* Main Content Layout: Interactive Map + Status Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Leaflet Map Container */}
        <div className="lg:col-span-2 flex flex-col space-y-3">
          <div className="relative w-full h-[380px] md:h-[460px] bg-slate-100 rounded-3xl overflow-hidden border border-gray-200 shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Map Action Quick Overlays */}
            <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2">
              <button
                onClick={handleCenterOnMe}
                className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-gray-800 rounded-2xl shadow-md border border-gray-200 transition cursor-pointer flex items-center space-x-1.5 text-xs font-bold"
                title="Fokus Lokasi Saya"
              >
                <LocateFixed className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Lokasi Saya</span>
              </button>

              {partnerLocation?.isSharing && (
                <button
                  onClick={handleCenterOnPartner}
                  className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-gray-800 rounded-2xl shadow-md border border-gray-200 transition cursor-pointer flex items-center space-x-1.5 text-xs font-bold"
                  title={`Fokus Lokasi ${partnerUser}`}
                >
                  <Navigation className="w-4 h-4 text-teal-600" />
                  <span className="hidden sm:inline">{partnerUser}</span>
                </button>
              )}
            </div>

            {/* Map Live Indicator Legend */}
            <div className="absolute bottom-3 left-3 z-10 bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl border border-white/20 text-[11px] font-medium flex items-center space-x-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Peta Koordinat GPS Langsung</span>
            </div>
          </div>

          {/* Quick Google Maps Direction Link */}
          {partnerLocation?.isSharing && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${partnerLocation.lat},${partnerLocation.lng}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-[#008069] border border-emerald-200 rounded-2xl transition font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka Rute &amp; Petunjuk Arah ke {partnerUser} di Google Maps 🗺️</span>
            </a>
          )}
        </div>

        {/* Partner & Self Location Cards Sidebar */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Active Partner Location Card */}
          <div className="bg-[#F7FAF9] border border-emerald-100 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-100/80 pb-2.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm border border-teal-300">
                  {partnerUser[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">
                    Lokasi {partnerUser} {activeUser === "Grace" ? "👨" : "👩"}
                  </h4>
                  <span className="text-[10px] text-gray-500 block">
                    Diperbarui: {formatTimeAgo(partnerLocation?.updatedAt)}
                  </span>
                </div>
              </div>

              {partnerLocation?.isSharing ? (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Aktif</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full border border-gray-200">
                  Tidak Aktif
                </span>
              )}
            </div>

            {partnerLocation?.isSharing ? (
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-start space-x-2">
                  <MapPinIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold text-gray-900 line-clamp-2">
                    {partnerLocation.addressName || "Lokasi GPS Terdeteksi"}
                  </span>
                </div>

                {partnerLocation.statusNote && (
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-[11px] text-gray-600 italic">
                    "{partnerLocation.statusNote}"
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  {partnerLocation.batteryLevel !== undefined && (
                    <div className="flex items-center space-x-1 text-emerald-700 font-medium">
                      <Battery className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Baterai: {partnerLocation.batteryLevel}%</span>
                    </div>
                  )}
                  {partnerLocation.accuracy && (
                    <span className="text-gray-400">Akurasi ±{Math.round(partnerLocation.accuracy)}m</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-3 text-center italic">
                {partnerUser} belum mengaktifkan atau membagikan lokasi GPS.
              </p>
            )}
          </div>

          {/* Self GPS Location & Control Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 text-white font-bold flex items-center justify-center text-sm shadow-sm border border-pink-300">
                  {activeUser[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">
                    Lokasi Saya ({activeUser})
                  </h4>
                  <span className="text-[10px] text-gray-500 block">
                    Diperbarui: {formatTimeAgo(myLocation?.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Toggle Sharing Button */}
              <button
                type="button"
                onClick={handleToggleSharing}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-2xs ${
                  myLocation?.isSharing ?? true
                    ? "bg-[#00A884] hover:bg-[#008069] text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{myLocation?.isSharing ?? true ? "Berbagi" : "Mati"}</span>
              </button>
            </div>

            {/* Current Address & Refresh Button */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <MapPinIcon className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                  <span className="font-semibold text-gray-800 line-clamp-2">
                    {myLocation?.addressName || "Lokasi GPS Saya"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleFetchCurrentGps}
                  disabled={isGpsLoading}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition cursor-pointer shrink-0"
                  title="Perbarui GPS Sekarang"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGpsLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Status Note Input Form */}
              <form onSubmit={handleSaveStatusNote} className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Status Lokasi Singkat:
                </label>
                <div className="flex space-x-1.5">
                  <input
                    type="text"
                    value={statusNoteInput}
                    onChange={(e) => setStatusNoteInput(e.target.value)}
                    placeholder="misal: Di kampus UI, Di jalan, dll..."
                    className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0 flex items-center space-x-1"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>

              {/* Battery & GPS Accuracy */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                {batteryLevel !== undefined && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Battery className="w-3.5 h-3.5 text-gray-500" />
                    <span>Baterai HP: {batteryLevel}%</span>
                  </div>
                )}
                {myLocation?.accuracy && (
                  <span>Akurasi GPS: ±{Math.round(myLocation.accuracy)}m</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
