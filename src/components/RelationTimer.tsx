import { useState } from "react";
import { Heart, Calendar, Sparkles, Check, Edit2 } from "lucide-react";
import { motion } from "motion/react";
import { Partner } from "../types";

interface RelationTimerProps {
  startDateStr: string;
  partner1: Partner;
  partner2: Partner;
  onUpdateStartDate: (date: string) => void;
  onUpdatePartners: (p1: Partial<Partner>, p2: Partial<Partner>) => void;
  activeUser: string;
}

export default function RelationTimer({
  startDateStr,
  partner1,
  partner2,
  onUpdateStartDate,
  onUpdatePartners,
  activeUser
}: RelationTimerProps) {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newDate, setNewDate] = useState(startDateStr);
  const [isEditingProfiles, setIsEditingProfiles] = useState(false);
  
  // Local profile states for editing
  const [p1Name, setP1Name] = useState(partner1.name);
  const [p1Address, setP1Address] = useState(partner1.address);
  const [p1Office, setP1Office] = useState(partner1.office);
  const [p2Name, setP2Name] = useState(partner2.name);
  const [p2Address, setP2Address] = useState(partner2.address);
  const [p2Office, setP2Office] = useState(partner2.office);

  const startDate = new Date(startDateStr);
  const today = new Date();
  
  // Calculate exact days together
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate years and remaining days
  const yearsTogether = Math.floor(diffDays / 365);
  const remainingDaysInYear = diffDays % 365;

  // Calculate next anniversary
  const currentYear = today.getFullYear();
  let nextAnnivYear = currentYear;
  const annivMonth = startDate.getMonth(); // 0-indexed
  const annivDate = startDate.getDate();
  
  let nextAnniv = new Date(nextAnnivYear, annivMonth, annivDate);
  if (nextAnniv.getTime() < today.getTime()) {
    nextAnnivYear = currentYear + 1;
    nextAnniv = new Date(nextAnnivYear, annivMonth, annivDate);
  }

  const diffNextAnnivTime = nextAnniv.getTime() - today.getTime();
  const daysToNextAnniv = Math.ceil(diffNextAnnivTime / (1000 * 60 * 60 * 24));
  const nextAnnivNumber = nextAnnivYear - startDate.getFullYear();

  const handleSaveDate = () => {
    onUpdateStartDate(newDate);
    setIsEditingDate(false);
  };

  const handleSaveProfiles = () => {
    onUpdatePartners(
      { name: p1Name, address: p1Address, office: p1Office },
      { name: p2Name, address: p2Address, office: p2Office }
    );
    setIsEditingProfiles(false);
  };

  // Profile avatar selector map matching Natural Tones design
  const getAvatarBg = (name: string) => {
    const isGrace = name.toLowerCase().includes("grace");
    return isGrace ? "bg-[#D4A373]" : "bg-[#CCD5AE]";
  };

  const formattedStartDate = startDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E6D5B8] p-6 md:p-8" id="relation-timer-card">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left column: Couple Info styled like mockup header */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start justify-center">
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#FAF3E0]/40 p-4 rounded-3xl border border-[#E6D5B8] w-full">
            <div className="flex -space-x-3">
              <div className={`w-14 h-14 rounded-full border-2 border-white ${getAvatarBg(partner1.name)} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                {partner1.name.slice(0, 1).toUpperCase()}
              </div>
              <div className={`w-14 h-14 rounded-full border-2 border-white ${getAvatarBg(partner2.name)} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                {partner2.name.slice(0, 1).toUpperCase()}
              </div>
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-base font-bold text-[#8B7E74] uppercase tracking-wider font-display">
                {partner1.name} & {partner2.name}
              </h1>
              <p className="text-xs text-[#A89F91] font-serif italic mt-0.5">
                Sejak {formattedStartDate}
              </p>
            </div>

            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E6D5B8] text-[#BC8F8F]"
            >
              <Heart className="w-4 h-4 fill-current" />
            </motion.div>
          </div>

          {/* Edit Profiles Button / Panel */}
          {isEditingProfiles ? (
            <div className="mt-4 w-full p-4 bg-[#FAF3E0] rounded-2xl border border-[#E6D5B8] text-sm space-y-3">
              <h4 className="font-serif italic font-bold text-[#8B7E74] text-center">Ubah Profil Pasangan</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Nama Partner 1</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-[#E6D5B8] rounded-xl text-xs text-[#4A403A] focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
                      value={p1Name}
                      onChange={(e) => setP1Name(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Nama Partner 2</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-[#E6D5B8] rounded-xl text-xs text-[#4A403A] focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
                      value={p2Name}
                      onChange={(e) => setP2Name(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Rumah Partner 1</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-[#E6D5B8] rounded-xl text-xs text-[#4A403A] focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
                      value={p1Address}
                      onChange={(e) => setP1Address(e.target.value)}
                      placeholder="Alamat rumah"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Rumah Partner 2</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-[#E6D5B8] rounded-xl text-xs text-[#4A403A] focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
                      value={p2Address}
                      onChange={(e) => setP2Address(e.target.value)}
                      placeholder="Alamat rumah"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Kantor Partner 1</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-[#E6D5B8] rounded-xl text-xs text-[#4A403A] focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
                      value={p1Office}
                      onChange={(e) => setP1Office(e.target.value)}
                      placeholder="Tujuan kantor"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Kantor Partner 2</label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-[#E6D5B8] rounded-xl text-xs text-[#4A403A] focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
                      value={p2Office}
                      onChange={(e) => setP2Office(e.target.value)}
                      placeholder="Tujuan kantor"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setIsEditingProfiles(false)}
                  className="px-3 py-1.5 text-xs text-[#8B7E74] hover:bg-white rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfiles}
                  className="px-3 py-1.5 text-xs bg-[#D4A373] text-white hover:bg-[#BC8F8F] rounded-lg font-bold shadow-sm transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingProfiles(true)}
              className="mt-3 flex items-center space-x-1.5 text-xs text-[#A89F91] hover:text-[#8B7E74] transition-colors self-center lg:self-start"
            >
              <Edit2 className="w-3 h-3" />
              <span>Atur Profil & Lokasi Safe Arrival</span>
            </button>
          )}
        </div>

        {/* Center column: Primary relationship counter with Natural Tones colors & fonts */}
        <div className="lg:col-span-4 text-center py-6 px-4 bg-[#FAEDCD] rounded-3xl border border-[#E6D5B8] flex flex-col justify-center items-center shadow-sm">
          <span className="text-[10px] uppercase tracking-widest text-[#8B7E74] font-bold flex items-center mb-1.5">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[#D4A373]" /> HARI BERSAMA <Sparkles className="w-3.5 h-3.5 ml-1 text-[#D4A373]" />
          </span>
          <div className="flex items-baseline justify-center space-x-1">
            <span className="text-5xl md:text-6xl font-bold font-serif text-[#BC8F8F] leading-tight tracking-tight">{diffDays}</span>
            <span className="text-lg font-serif italic text-[#A89F91] ml-1">Hari</span>
          </div>
          <p className="text-xs text-[#6D625B] mt-2 font-medium">
            Atau sekitar <span className="text-[#8B7E74] font-bold">{yearsTogether} Tahun</span>,{" "}
            <span className="text-[#8B7E74] font-bold">{remainingDaysInYear} Hari</span>
          </p>

          {isEditingDate ? (
            <div className="mt-4 flex items-center space-x-2 bg-white p-1 rounded-xl border border-[#E6D5B8]">
              <input
                type="date"
                className="px-2 py-1 text-xs text-[#4A403A] bg-transparent focus:outline-none"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <button
                onClick={handleSaveDate}
                className="p-1 bg-[#D4A373] text-white rounded-lg hover:bg-[#BC8F8F] transition"
                title="Simpan"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingDate(true)}
              className="mt-3 text-[10px] text-[#8B7E74] hover:text-[#4A403A] transition-colors flex items-center space-x-1 bg-white/40 px-2 py-1 rounded-lg border border-[#E6D5B8]/40"
            >
              <Calendar className="w-3 h-3 text-[#D4A373]" />
              <span>Jadian: {startDateStr}</span>
            </button>
          )}
        </div>

        {/* Right column: Countdown to anniversary with Coral/Rose styling */}
        <div className="lg:col-span-3 flex flex-col justify-center text-center lg:text-left">
          <div className="bg-[#FEFAE0] text-[#4A403A] p-5 rounded-3xl border border-[#E6D5B8] shadow-sm relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-4 translate-y-4 text-[#8B7E74]">
              <Heart className="w-32 h-32 fill-current" />
            </div>

            <span className="text-[10px] text-[#8B7E74] uppercase tracking-widest font-bold">Anniversary ke-{nextAnnivNumber}</span>
            <div className="mt-1 flex items-baseline justify-center lg:justify-start">
              <span className="text-4xl font-serif font-bold text-[#BC8F8F] leading-tight">{daysToNextAnniv}</span>
              <span className="text-sm font-serif italic text-[#A89F91] ml-1.5">Hari Lagi</span>
            </div>
            
            <p className="text-[10px] text-[#8B7E74] mt-2 font-serif italic leading-tight">
              Yaitu pada {nextAnniv.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
