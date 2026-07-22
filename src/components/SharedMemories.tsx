import React, { useState } from "react";
import { Camera, Calendar, MapPin, Plus, Trash2, Heart, Sparkles } from "lucide-react";
import { Memory } from "../types";

interface SharedMemoriesProps {
  memories: Memory[];
  onAddMemory: (title: string, imageUrl: string, date: string, caption: string, location: string) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  activeUser: string;
}

export default function SharedMemories({
  memories,
  onAddMemory,
  onDeleteMemory,
  activeUser
}: SharedMemoriesProps) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [date, setDate] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim() || !date) return;

    setIsSubmitting(true);
    try {
      await onAddMemory(title.trim(), imageUrl.trim(), date, caption.trim(), location.trim());
      setTitle("");
      setImageUrl("");
      setDate("");
      setCaption("");
      setLocation("");
      setIsExpanded(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E6D5B8] p-6 md:p-8" id="shared-memories-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif italic text-[#8B7E74] flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#BC8F8F]" />
            Kenangan Bersama (Timeline Album)
          </h2>
          <p className="text-sm text-[#A89F91] mt-1">
            Abadikan lembar demi lembar perjalanan romantis kalian dalam buku kliping kenangan virtual.
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-[#D4A373] text-white font-bold text-xs rounded-xl shadow hover:bg-[#BC8F8F] transition flex items-center gap-1.5 self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{isExpanded ? "Tutup Form" : "Abadikan Momen Baru"}</span>
        </button>
      </div>

      {/* Expandable Add Memory Form */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-[#FAF3E0]/40 rounded-2xl border border-[#E6D5B8] space-y-4">
          <h3 className="font-serif italic font-bold text-[#8B7E74] text-sm flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#D4A373]" /> Potret Momen Bahagia Baru
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Judul Kenangan</label>
              <input
                type="text"
                required
                placeholder="Contoh: Kencan Pertama, Piknik Sore..."
                className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] text-[#4A403A]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Tautan Foto (URL)</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] text-[#4A403A]"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Tanggal Kejadian</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] text-[#4A403A]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Caption / Catatan Manis</label>
              <textarea
                rows={2}
                placeholder="Tulis cerita manis dibalik foto ini..."
                className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] resize-none h-14 text-[#4A403A]"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Lokasi Kejadian (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Pantai Kuta, Bali"
                className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] text-[#4A403A]"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-xs text-[#8B7E74] hover:bg-white rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#D4A373] hover:bg-[#BC8F8F] text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Abadikan Kenangan ✨"}
            </button>
          </div>
        </form>
      )}

      {/* Timeline view */}
      <div className="relative border-l-2 border-[#E6D5B8] ml-4 md:ml-8 space-y-8 py-4">
        {memories.length === 0 ? (
          <div className="text-center py-12 bg-[#FAF3E0]/20 rounded-2xl border border-[#E6D5B8]/60 ml-4">
            <Camera className="w-12 h-12 text-[#A89F91]/50 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#8B7E74]">Belum ada kenangan terabadikan</p>
            <p className="text-xs text-[#A89F91] mt-1">Gunakan tombol 'Abadikan Momen Baru' untuk merekam kisah kalian!</p>
          </div>
        ) : (
          memories.map((memory) => {
            const memDate = new Date(memory.date);
            const formattedDate = memDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
            
            return (
              <div key={memory.id} className="relative pl-6 md:pl-10 group">
                {/* Timeline node heart indicator */}
                <span className="absolute left-0 top-1.5 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#E6D5B8] flex items-center justify-center text-[#BC8F8F] group-hover:bg-[#BC8F8F] group-hover:text-white transition duration-300 shadow-sm z-10">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </span>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#FAF3E0]/10 rounded-2xl border border-[#E6D5B8]/60 p-4 md:p-6 shadow-sm hover:shadow-md transition duration-300">
                  
                  {/* Image/Polaroid framing */}
                  <div className="md:col-span-4 bg-white p-3 pb-8 rounded-lg shadow border border-[#E6D5B8]/40 flex flex-col justify-between transform -rotate-1 group-hover:rotate-0 duration-300">
                    <div className="rounded overflow-hidden border border-gray-100 bg-slate-50 aspect-[4/3] flex items-center justify-center">
                      <img
                        src={memory.imageUrl}
                        alt={memory.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[9px] text-[#A89F91] font-mono text-center mt-3 tracking-wider">★ MOMENT POLAROID ★</span>
                  </div>

                  {/* Detail details */}
                  <div className="md:col-span-8 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-serif font-bold text-[#8B7E74] text-lg md:text-xl flex items-center gap-1.5 leading-tight">
                            {memory.title}
                            <Sparkles className="w-4 h-4 text-[#D4A373] animate-pulse" />
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#8B7E74] font-semibold">
                            <span className="bg-[#FAEDCD] text-[#BC8F8F] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#E6D5B8]/40">
                              <Calendar className="w-3 h-3 text-[#BC8F8F]" />
                              {formattedDate}
                            </span>
                            {memory.location && (
                              <span className="bg-[#E9EDC6] text-[#588157] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#CCD5AE]">
                                <MapPin className="w-3 h-3 text-[#588157]" />
                                {memory.location}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete memory */}
                        <button
                          onClick={() => onDeleteMemory(memory.id)}
                          className="text-gray-300 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition flex-shrink-0"
                          title="Hapus Momen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {memory.caption && (
                        <p className="text-sm text-[#6D625B] leading-relaxed italic border-l-2 border-[#E6D5B8] pl-3">
                          "{memory.caption}"
                        </p>
                      )}
                    </div>

                    <div className="text-[10px] text-[#A89F91] font-medium mt-4 pt-3 border-t border-[#E6D5B8]/30 flex justify-between items-center">
                      <span>Diabadikan oleh: <span className="font-bold text-[#8B7E74]">{memory.createdBy}</span></span>
                      <span>{new Date(memory.createdAt).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
