import React, { useState } from "react";
import { Calendar, Heart, Gift, Sparkles, Plus, Trash2, Tag } from "lucide-react";
import { CalendarEvent } from "../types";

interface SharedCalendarProps {
  events: CalendarEvent[];
  onAddEvent: (title: string, type: string, date: string, description: string) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  activeUser: string;
}

export default function SharedCalendar({
  events,
  onAddEvent,
  onDeleteEvent,
  activeUser
}: SharedCalendarProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"anniversary" | "birthday" | "date" | "other">("date");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);
    try {
      await onAddEvent(title.trim(), type, date, description.trim());
      setTitle("");
      setDate("");
      setDescription("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "anniversary":
        return <Heart className="w-5 h-5 text-[#BC8F8F] fill-[#BC8F8F]" />;
      case "birthday":
        return <Gift className="w-5 h-5 text-[#D4A373]" />;
      case "date":
        return <Sparkles className="w-5 h-5 text-[#588157]" />;
      default:
        return <Tag className="w-5 h-5 text-[#8B7E74]" />;
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case "anniversary":
        return <span className="text-[10px] bg-[#FAEDCD] text-[#BC8F8F] font-bold px-2 py-0.5 rounded-full border border-[#E6D5B8]">Hari Jadi ❤️</span>;
      case "birthday":
        return <span className="text-[10px] bg-[#FEFAE0] text-[#8B7E74] font-bold px-2 py-0.5 rounded-full border border-[#E6D5B8]">Ulang Tahun 🎂</span>;
      case "date":
        return <span className="text-[10px] bg-[#E9EDC6] text-[#588157] font-bold px-2 py-0.5 rounded-full border border-[#CCD5AE]">Jadwal Kencan 🌹</span>;
      default:
        return <span className="text-[10px] bg-[#FAF3E0] text-[#A89F91] font-bold px-2 py-0.5 rounded-full border border-[#E6D5B8]">Agenda Lain 📍</span>;
    }
  };

  // Sort upcoming events
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E6D5B8] p-6 md:p-8" id="shared-calendar-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif italic text-[#8B7E74] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#BC8F8F]" />
            Kalender Bersama
          </h2>
          <p className="text-sm text-[#A89F91] mt-1">
            Catat ulang tahun, janji kencan berikutnya, hari jadi, dan momen penting yang wajib diingat bersama.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Add Event Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-[#FAF3E0]/30 rounded-2xl border border-[#E6D5B8] p-5 space-y-4 h-fit">
          <h3 className="font-serif italic font-bold text-[#8B7E74] text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#D4A373]" /> Rencanakan Acara Baru
          </h3>

          <div>
            <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Nama Acara / Kegiatan</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A373] text-[#4A403A]"
              placeholder="Contoh: Dinner Romantis, Beli Kado..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Kategori</label>
              <select
                className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] text-[#4A403A]"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="date">🌹 Jadwal Kencan</option>
                <option value="anniversary">❤️ Hari Jadi</option>
                <option value="birthday">🎂 Ulang Tahun</option>
                <option value="other">📍 Agenda Penting</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Tanggal Acara</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] text-[#4A403A]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Deskripsi / Detail Acara (Opsional)</label>
            <textarea
              className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] h-16 resize-none text-[#4A403A]"
              placeholder="Detail lokasi, dresscode, atau rencana kejutan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#D4A373] hover:bg-[#BC8F8F] text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isSubmitting ? "Menambahkan Acara..." : "Jadwalkan Acara"}
          </button>
        </form>

        {/* Right column: Timeline Event cards */}
        <div className="lg:col-span-7 space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-12 bg-[#FAF3E0]/20 rounded-2xl border border-[#E6D5B8]/60">
              <Calendar className="w-12 h-12 text-[#A89F91]/50 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#8B7E74]">Belum ada acara terjadwal</p>
              <p className="text-xs text-[#A89F91] mt-1">Buat jadwal pertama kalian bersama!</p>
            </div>
          ) : (
            sortedEvents.map((event) => {
              const eventDateObj = new Date(event.date);
              const isPast = eventDateObj < new Date(new Date().setHours(0,0,0,0));
              
              return (
                <div
                  key={event.id}
                  className={`flex items-start justify-between p-4 rounded-2xl border transition shadow-sm ${
                    isPast
                      ? "bg-gray-50/50 border-gray-200 text-gray-400"
                      : "bg-white border-[#E6D5B8] hover:border-[#D4A373] text-[#4A403A]"
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-2.5 rounded-xl ${
                      isPast ? "bg-gray-100" : "bg-[#FAF3E0]/50"
                    } flex-shrink-0`}>
                      {getEventIcon(event.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-sm font-bold leading-none ${isPast ? "text-gray-400 line-through font-serif italic" : "text-[#4A403A]"}`}>
                          {event.title}
                        </h4>
                        {getEventBadge(event.type)}
                      </div>

                      {event.description && (
                        <p className={`text-xs leading-relaxed ${isPast ? "text-gray-400" : "text-[#6D625B]"}`}>
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                        <span className="bg-[#FAF3E0] px-2 py-0.5 rounded-full text-[#8B7E74] font-bold">
                          📅 {eventDateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <span>• Dijadwalkan oleh: {event.createdBy}</span>
                        {isPast && <span className="text-gray-400">(Sudah Terlewati)</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="text-gray-300 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition ml-2 flex-shrink-0"
                    title="Hapus Acara"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
