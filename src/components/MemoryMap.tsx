import React, { useState, useRef } from "react";
import { Map, Pin, Plus, Trash2, Tag, Calendar, Heart, Eye } from "lucide-react";
import { MapPin } from "../types";

interface MemoryMapProps {
  pins: MapPin[];
  onAddPin: (title: string, lat: number, lng: number, description: string, category: string, date: string, photoUrl: string) => Promise<void>;
  onDeletePin: (id: string) => Promise<void>;
}

export default function MemoryMap({ pins, onAddPin, onDeletePin }: MemoryMapProps) {
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(pins[0] || null);
  
  // Placement form states
  const [isPlacing, setIsPlacing] = useState(false);
  const [clickX, setClickX] = useState<number | null>(null);
  const [clickY, setClickY] = useState<number | null>(null);
  const [pinTitle, setPinTitle] = useState("");
  const [pinDesc, setPinDesc] = useState("");
  const [pinCat, setPinCat] = useState<"special" | "holiday" | "date" | "other">("date");
  const [pinDate, setPinDate] = useState("");
  const [pinPhoto, setPinPhoto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    // Get percentage coordinates inside the map container
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    
    setClickX(x);
    setClickY(y);
    setIsPlacing(true);
    // Auto-prefill date
    setPinDate(new Date().toISOString().split('T')[0]);
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clickX === null || clickY === null || !pinTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddPin(
        pinTitle.trim(),
        clickY, // Y is mapped as lat
        clickX, // X is mapped as lng
        pinDesc.trim(),
        pinCat,
        pinDate,
        pinPhoto.trim()
      );
      setPinTitle("");
      setPinDesc("");
      setPinPhoto("");
      setIsPlacing(false);
      setClickX(null);
      setClickY(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPinColor = (category: string) => {
    switch (category) {
      case "special":
        return "text-[#BC8F8F] fill-[#BC8F8F] hover:scale-125 duration-300";
      case "holiday":
        return "text-[#588157] fill-[#588157] hover:scale-125 duration-300";
      case "date":
        return "text-[#D4A373] fill-[#D4A373] hover:scale-125 duration-300";
      default:
        return "text-[#8B7E74] fill-[#8B7E74] hover:scale-125 duration-300";
    }
  };

  const getPinBg = (category: string) => {
    switch (category) {
      case "special": return "bg-[#FAEDCD] border-[#E6D5B8] text-[#BC8F8F]";
      case "holiday": return "bg-[#E9EDC6] border-[#CCD5AE] text-[#588157]";
      case "date": return "bg-[#FEFAE0] border-[#E6D5B8] text-[#8B7E74]";
      default: return "bg-[#FAF3E0] border-[#E6D5B8] text-[#A89F91]";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "special": return "Momen Spesial 💝";
      case "holiday": return "Liburan Berdua ✈️";
      case "date": return "Kencan Berdua 🌹";
      default: return "Agenda Lainnya 📌";
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E6D5B8] p-6 md:p-8" id="memory-map-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif italic text-[#8B7E74] flex items-center gap-2">
            <Map className="w-6 h-6 text-[#BC8F8F]" />
            Peta Kenangan
          </h2>
          <p className="text-sm text-[#A89F91] mt-1">
            Kliping lokasi cinta! Klik di mana saja pada peta koordinat kustom di bawah ini untuk menandai destinasi kencan, makan malam romantis, atau liburan bersama.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left panel: Interactive custom map blueprint */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          
          <div className="flex justify-between items-center text-xs text-[#BC8F8F] font-bold px-1">
            <span>🗺️ Klik di koordinat mana saja pada peta untuk menandai pin baru!</span>
            {isPlacing && <span className="animate-pulse text-[#D4A373] font-bold">📝 Mengisi Form Pin Baru ({clickX}%, {clickY}%)</span>}
          </div>

          <div
            ref={mapRef}
            onClick={handleMapClick}
            className="w-full h-[320px] md:h-[400px] bg-[#2C3531] rounded-2xl relative overflow-hidden cursor-crosshair border border-[#E6D5B8] shadow-inner group"
          >
            {/* Interactive blueprint background grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#116466_1px,transparent_1px),linear-gradient(to_bottom,#116466_1px,transparent_1px)] bg-[size:24px_24px] opacity-45" />
            <div className="absolute inset-0 bg-[radial-gradient(#116466_1px,transparent_1px)] bg-[size:12px_12px] opacity-25" />

            {/* Glowing romantic epicenter */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#D4A373]/10 blur-3xl pointer-events-none animate-pulse-glow" />

            {/* Landmarks references */}
            <div className="absolute top-12 left-16 text-[9px] text-slate-400/50 font-mono pointer-events-none select-none">ZONE NORTH_DEP_01</div>
            <div className="absolute bottom-12 right-20 text-[9px] text-slate-400/50 font-mono pointer-events-none select-none">ZONE SOUTH_KMG_04</div>
            <div className="absolute top-1/2 left-12 text-[9px] text-slate-400/45 font-mono pointer-events-none select-none">SCBD_CENTER</div>
            <div className="absolute bottom-1/4 left-1/3 text-[9px] text-slate-400/45 font-mono pointer-events-none select-none">BOGOR_OUTSKIRTS</div>

            {/* Render placed pins */}
            {pins.map((pin) => (
              <button
                key={pin.id}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent placing a new pin
                  setSelectedPin(pin);
                  setIsPlacing(false);
                }}
                className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer focus:outline-none transition z-10"
                style={{ top: `${pin.lat}%`, left: `${pin.lng}%` }}
              >
                <div className="flex flex-col items-center">
                  {/* Miniature tooltip on hover */}
                  <span className="opacity-0 group-hover:opacity-100 bg-[#FAF3E0] text-[#4A403A] text-[9px] font-bold px-1.5 py-0.5 rounded shadow absolute bottom-full mb-1 whitespace-nowrap transition-all duration-200 pointer-events-none border border-[#E6D5B8]">
                    {pin.title}
                  </span>
                  <Pin className={`w-6 h-6 ${getPinColor(pin.category)} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`} />
                  
                  {/* Pulse wave behind selected pin */}
                  {selectedPin?.id === pin.id && (
                    <div className="w-4 h-4 rounded-full bg-[#BC8F8F] absolute bottom-0 transform translate-y-1/2 opacity-45 animate-ping" />
                  )}
                </div>
              </button>
            ))}

            {/* Visual marker of temporary clicked location */}
            {isPlacing && clickX !== null && clickY !== null && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-full animate-bounce z-20"
                style={{ top: `${clickY}%`, left: `${clickX}%` }}
              >
                <Pin className="w-8 h-8 text-[#D4A373] fill-[#D4A373]/50 filter drop-shadow-[0_0_8px_rgba(212,163,115,0.8)]" />
              </div>
            )}
          </div>
        </div>

        {/* Right side panel: Pin form OR Pin Polaroid View */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          {isPlacing ? (
            /* PLACE PIN FORM */
            <form onSubmit={handleSavePin} className="bg-[#FAF3E0]/40 rounded-2xl border border-[#E6D5B8] p-4 space-y-3">
              <h3 className="font-serif italic font-bold text-[#8B7E74] text-xs flex items-center gap-1.5 bg-[#FAF3E0] px-2 py-1 rounded-lg border border-[#E6D5B8]/40">
                <Plus className="w-4 h-4 text-[#D4A373]" /> Tambah Pin Baru di ({clickX}%, {clickY}%)
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-0.5">Nama Lokasi Kenangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Meja Pojok Kafe Cozy..."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] text-[#4A403A]"
                  value={pinTitle}
                  onChange={(e) => setPinTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-0.5">Kategori</label>
                  <select
                    className="w-full px-2 py-1.5 bg-white border border-[#E6D5B8] rounded-xl text-[10px] focus:outline-none text-[#4A403A]"
                    value={pinCat}
                    onChange={(e) => setPinCat(e.target.value as any)}
                  >
                    <option value="special">💝 Spesial</option>
                    <option value="holiday">✈️ Liburan</option>
                    <option value="date">🌹 Kencan</option>
                    <option value="other">📌 Agenda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-0.5">Tanggal</label>
                  <input
                    type="date"
                    required
                    className="w-full px-2 py-1 bg-white border border-[#E6D5B8] rounded-xl text-[10px] text-[#4A403A]"
                    value={pinDate}
                    onChange={(e) => setPinDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-0.5">Deskripsi Singkat</label>
                <textarea
                  className="w-full px-2.5 py-1 bg-white border border-[#E6D5B8] rounded-xl text-[10px] focus:outline-none h-12 resize-none text-[#4A403A]"
                  placeholder="Cerita singkat dibalik lokasi ini..."
                  value={pinDesc}
                  onChange={(e) => setPinDesc(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-0.5">Link Foto Kenangan</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-2.5 py-1 bg-white border border-[#E6D5B8] rounded-xl text-[10px] focus:outline-none text-[#4A403A]"
                  value={pinPhoto}
                  onChange={(e) => setPinPhoto(e.target.value)}
                />
              </div>

              <div className="flex space-x-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setIsPlacing(false)}
                  className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-1.5 bg-[#D4A373] hover:bg-[#BC8F8F] text-white font-bold rounded-lg transition"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Pin"}
                </button>
              </div>
            </form>
          ) : selectedPin ? (
            /* PIN POLAROID DETAIL VIEW */
            <div className="bg-white rounded-2xl border border-[#E6D5B8] p-4 shadow-md space-y-3 animate-fade-in">
              <div className="flex justify-between items-start gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPinBg(selectedPin.category)}`}>
                  {getCategoryLabel(selectedPin.category)}
                </span>
                <button
                  onClick={async () => {
                    await onDeletePin(selectedPin.id);
                    setSelectedPin(pins.filter(p => p.id !== selectedPin.id)[0] || null);
                  }}
                  className="text-gray-300 hover:text-red-700 p-1 rounded transition"
                  title="Hapus Pin"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-serif font-bold text-[#8B7E74] text-sm flex items-center gap-1">
                <Pin className="w-4 h-4 text-[#BC8F8F] fill-[#BC8F8F] flex-shrink-0" />
                {selectedPin.title}
              </h3>

              {selectedPin.photoUrl ? (
                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-inner max-h-36 bg-gray-50 flex items-center justify-center">
                  <img
                    src={selectedPin.photoUrl}
                    alt={selectedPin.title}
                    className="w-full h-full object-cover aspect-video"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="h-24 bg-[#FAF3E0]/20 rounded-xl border border-dashed border-[#E6D5B8] flex flex-col justify-center items-center text-[#A89F91]">
                  <Map className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-[10px]">Belum ada foto lokasi</span>
                </div>
              )}

              {selectedPin.description && (
                <p className="text-xs text-[#6D625B] leading-relaxed italic border-l-2 border-[#E6D5B8] pl-3">
                  "{selectedPin.description}"
                </p>
              )}

              <div className="flex items-center gap-2 text-[10px] text-[#A89F91] font-medium pt-1 border-t border-gray-100">
                <Calendar className="w-3 h-3 text-[#BC8F8F]" />
                <span>Kunjungan: {new Date(selectedPin.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
          ) : (
            /* NO PIN SELECTED */
            <div className="text-center py-12 bg-[#FAF3E0]/20 rounded-2xl border border-[#E6D5B8]/60 flex flex-col justify-center items-center h-full">
              <Map className="w-10 h-10 text-[#A89F91]/50 mb-2 animate-bounce" />
              <p className="text-xs font-bold text-[#8B7E74]">Klik pin pada peta</p>
              <p className="text-[10px] text-[#A89F91] mt-1 px-4">Pilih pin yang ada untuk melihat polaroid memo cinta, atau klik sembarang koordinat untuk membuat pin baru.</p>
            </div>
          )}

          {/* Pin locations text summary list */}
          <div className="mt-4 space-y-1.5 max-h-[140px] overflow-y-auto pr-1 border-t border-gray-100/60 pt-3">
            <span className="text-[10px] font-bold text-[#A89F91] uppercase tracking-wider block px-1 mb-1">Daftar Peta ({pins.length})</span>
            {pins.map((pin) => (
              <button
                key={pin.id}
                onClick={() => {
                  setSelectedPin(pin);
                  setIsPlacing(false);
                }}
                className={`w-full text-left p-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                  selectedPin?.id === pin.id
                    ? "bg-[#FAF3E0] text-[#BC8F8F] font-bold border border-[#E6D5B8]/40 shadow-sm"
                    : "hover:bg-gray-50 text-[#6D625B]"
                }`}
              >
                <span className="truncate flex items-center gap-1">
                  📍 {pin.title}
                </span>
                <span className="text-[9px] text-[#A89F91] font-mono">
                  {new Date(pin.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
