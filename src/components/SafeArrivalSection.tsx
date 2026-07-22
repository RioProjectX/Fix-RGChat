import React, { useState } from "react";
import { ShieldCheck, MapPin, Navigation, Clock, Home, Briefcase, Heart, BellOff } from "lucide-react";
import { SafeArrival, Partner } from "../types";

interface SafeArrivalSectionProps {
  arrivals: SafeArrival[];
  partner1: Partner;
  partner2: Partner;
  onArrive: (locationName: string, type: "home" | "office" | "other") => Promise<void>;
  activeUser: string;
}

export default function SafeArrivalSection({
  arrivals,
  partner1,
  partner2,
  onArrive,
  activeUser
}: SafeArrivalSectionProps) {
  const [customLoc, setCustomLoc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine active partner's addresses
  const actingAsP1 = activeUser === partner1.name;
  const currentHome = actingAsP1 ? partner1.address : partner2.address;
  const currentOffice = actingAsP1 ? partner1.office : partner2.office;

  const handleArrivalCheckin = async (location: string, type: "home" | "office" | "other") => {
    if (!location) return;
    setIsSubmitting(true);
    try {
      await onArrive(location, type);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomArrival = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLoc.trim()) return;
    
    await handleArrivalCheckin(customLoc.trim(), "other");
    setCustomLoc("");
  };

  const getArrivalTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4 text-[#588157]" />;
      case "office":
        return <Briefcase className="w-4 h-4 text-[#8B7E74]" />;
      default:
        return <MapPin className="w-4 h-4 text-[#BC8F8F]" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E6D5B8] p-6 md:p-8" id="safe-arrival-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif italic text-[#8B7E74] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#BC8F8F]" />
            Safe Arrival (Kabar Sampai)
          </h2>
          <p className="text-sm text-[#A89F91] mt-1">
            Kabari pasanganmu dalam sekali sentuh saat kamu sampai di tempat tujuan. Pasanganmu akan mendapat notifikasi otomatis secara real-time!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Quick Actions for active user */}
        <div className="lg:col-span-5 bg-[#FAF3E0]/40 rounded-2xl border border-[#E6D5B8] p-5 space-y-4 h-fit">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#8B7E74] bg-[#FEFAE0] border border-[#E6D5B8]/50 px-2 py-0.5 rounded-full uppercase">
              {activeUser}
            </span>
            <h3 className="font-serif italic font-bold text-[#8B7E74] text-xs">Pilih Lokasi Kedatanganmu:</h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Quick Home checkin */}
            <button
              onClick={() => handleArrivalCheckin(currentHome || "Rumah", "home")}
              disabled={isSubmitting}
              className="flex items-start space-x-3 p-3 bg-white hover:bg-[#FEFAE0]/40 border border-[#E6D5B8] rounded-xl transition text-left group disabled:opacity-50 cursor-pointer"
            >
              <div className="p-2 bg-[#E9EDC6] group-hover:bg-[#CCD5AE] rounded-lg text-[#588157] flex-shrink-0 transition">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#4A403A]">Tiba di Rumah 🏠</p>
                <p className="text-[10px] text-[#A89F91] mt-0.5 max-w-[200px] truncate">{currentHome || "Atur alamat di menu Profil Beranda"}</p>
              </div>
            </button>

            {/* Quick Office/Campus checkin */}
            <button
              onClick={() => handleArrivalCheckin(currentOffice || "Kantor/Kampus", "office")}
              disabled={isSubmitting}
              className="flex items-start space-x-3 p-3 bg-white hover:bg-[#FEFAE0]/40 border border-[#E6D5B8] rounded-xl transition text-left group disabled:opacity-50 cursor-pointer"
            >
              <div className="p-2 bg-[#FAEDCD] group-hover:bg-[#E6D5B8] rounded-lg text-[#8B7E74] flex-shrink-0 transition">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#4A403A]">Tiba di Kantor / Kampus 💼</p>
                <p className="text-[10px] text-[#A89F91] mt-0.5 max-w-[200px] truncate">{currentOffice || "Atur alamat di menu Profil Beranda"}</p>
              </div>
            </button>
          </div>

          <hr className="border-[#E6D5B8]/40" />

          {/* Custom location form */}
          <form onSubmit={handleCustomArrival} className="space-y-2">
            <label className="block text-xs font-bold text-[#8B7E74] uppercase">Tiba di Lokasi Lain / Tempat Kencan:</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="Contoh: Starbucks Depok, FX Sudirman..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] text-[#4A403A]"
                  value={customLoc}
                  onChange={(e) => setCustomLoc(e.target.value)}
                  disabled={isSubmitting}
                />
                <Navigation className="w-3.5 h-3.5 text-[#BC8F8F] absolute left-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !customLoc.trim()}
                className="px-4 py-1.5 bg-[#D4A373] text-white rounded-xl text-xs font-bold hover:bg-[#BC8F8F] transition disabled:opacity-50 cursor-pointer"
              >
                Kirim
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Arrival history logs */}
        <div className="lg:col-span-7 space-y-4 max-h-[460px] overflow-y-auto pr-1">
          <h3 className="font-serif italic font-bold text-[#8B7E74] text-sm flex items-center gap-1.5 px-1 border-b border-[#E6D5B8]/40 pb-2">
            <Clock className="w-4 h-4 text-[#BC8F8F]" /> Riwayat Kedatangan Terakhir ({arrivals.length})
          </h3>

          {arrivals.length === 0 ? (
            <div className="text-center py-12 bg-[#FAF3E0]/20 rounded-2xl border border-[#E6D5B8]/60">
              <ShieldCheck className="w-12 h-12 text-[#A89F91]/50 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#8B7E74]">Belum ada riwayat check-in</p>
              <p className="text-xs text-[#A89F91] mt-1">Gunakan tombol kedatangan di samping saat kalian tiba!</p>
            </div>
          ) : (
            arrivals.map((arrival) => {
              const date = new Date(arrival.arrivedAt);
              const isPartner = arrival.user !== activeUser;
              
              return (
                <div
                  key={arrival.id}
                  className={`flex items-start justify-between p-3.5 rounded-2xl border transition shadow-inner ${
                    isPartner
                      ? "bg-[#FAF3E0]/30 border-[#E6D5B8]"
                      : "bg-white border-[#E6D5B8]/40"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${
                      isPartner ? "bg-[#FAEDCD] text-[#BC8F8F]" : "bg-gray-100 text-[#8B7E74]"
                    }`}>
                      {getArrivalTypeIcon(arrival.type)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#4A403A]">
                        {arrival.user}{" "}
                        <span className="text-[#588157] font-semibold text-[10px] bg-[#E9EDC6] border border-[#CCD5AE] px-2 py-0.5 rounded-full ml-1">
                          ✓ Sudah Sampai
                        </span>
                      </p>
                      <p className="text-xs text-[#6D625B] mt-0.5">
                        Tiba di <span className="font-semibold text-[#4A403A]">{arrival.locationName}</span>
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-2 text-[9px] text-[#A89F91] font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        <span>
                          {date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}{" "}
                          {date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                        </span>
                        <span>•</span>
                        <span className="text-[#BC8F8F] font-bold">
                          {isPartner ? "Menentramkan hatimu 💖" : "Mengabari pacarmu"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
