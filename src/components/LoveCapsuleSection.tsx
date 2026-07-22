import React, { useState } from "react";
import { Lock, Unlock, Clock, Image, FileText, Send, Calendar, Check, AlertCircle } from "lucide-react";
import { LoveCapsule } from "../types";

interface LoveCapsuleSectionProps {
  capsules: LoveCapsule[];
  onAddCapsule: (message: string, mediaUrl: string, unlockDate: string) => Promise<void>;
  onOpenCapsule: (id: string) => Promise<boolean>;
  activeUser: string;
}

export default function LoveCapsuleSection({
  capsules,
  onAddCapsule,
  onOpenCapsule,
  activeUser
}: LoveCapsuleSectionProps) {
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!message.trim() || !unlockDate) {
      setErrorMsg("Pesan dan tanggal pembukaan wajib diisi!");
      return;
    }

    if (unlockDate <= todayStr) {
      setErrorMsg("Tanggal pembukaan harus di masa depan!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddCapsule(message.trim(), mediaUrl.trim(), unlockDate);
      setMessage("");
      setMediaUrl("");
      setUnlockDate("");
      setSuccessMsg("Kapsul waktu berhasil disegel! 🔒 Tersimpan aman hingga waktu yang ditentukan.");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      setErrorMsg("Gagal menyimpan kapsul waktu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpen = async (id: string) => {
    setErrorMsg("");
    const success = await onOpenCapsule(id);
    if (!success) {
      setErrorMsg("Gagal membuka kapsul waktu. Pastikan sudah melewati tanggal buka!");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E6D5B8] p-6 md:p-8" id="love-capsule-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif italic text-[#8B7E74] flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#BC8F8F]" />
            Love Capsule (Kapsul Waktu Cinta)
          </h2>
          <p className="text-sm text-[#A89F91] mt-1">
            Kirim surat cinta, foto kenangan, atau pesan rahasia yang disegel rapat dan hanya bisa dibuka oleh pasangan pada tanggal tertentu di masa depan!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Create Capsule Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-[#FAF3E0]/40 rounded-2xl border border-[#E6D5B8] p-5 space-y-4 h-fit">
          <h3 className="font-serif italic font-bold text-[#8B7E74] text-sm flex items-center gap-1.5">
            <Send className="w-4 h-4 text-[#D4A373]" /> Segel Kapsul Waktu Baru
          </h3>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-1.5 font-medium border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs flex items-center gap-1.5 font-medium border border-emerald-100">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Pesan / Surat Cinta Rahasia</label>
            <textarea
              required
              rows={4}
              className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] h-24 text-[#4A403A]"
              placeholder="Tulis pesan rahasia, janji suci, atau ungkapan sayang terdalammu di sini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Tautan Foto Kenangan (Opsional)</label>
            <div className="relative">
              <input
                type="url"
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] placeholder:text-gray-400 text-[#4A403A]"
                placeholder="https://images.unsplash.com/photo-..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
              <Image className="w-3.5 h-3.5 text-[#BC8F8F] absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Tanggal Segel Dibuka 🔒</label>
            <div className="relative">
              <input
                type="date"
                required
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#D4A373] text-[#4A403A]"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
              />
              <Calendar className="w-3.5 h-3.5 text-[#BC8F8F] absolute left-2.5 top-2.5" />
            </div>
            <span className="text-[10px] text-[#A89F91] mt-1 block">Tentukan kapan pasanganmu bisa membuka isi kapsul ini.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#D4A373] hover:bg-[#BC8F8F] text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isSubmitting ? "Menyegel Kapsul..." : "Segel Kapsul Waktu 🔒"}
          </button>
        </form>

        {/* Right column: Capsule Vault */}
        <div className="lg:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-1">
          <h3 className="font-serif italic font-bold text-[#8B7E74] text-sm flex items-center gap-1.5 px-1 border-b border-[#E6D5B8]/40 pb-2">
            <Lock className="w-4 h-4 text-[#BC8F8F]" /> Lemari Penyimpanan Kapsul ({capsules.length})
          </h3>

          {capsules.length === 0 ? (
            <div className="text-center py-12 bg-[#FAF3E0]/20 rounded-2xl border border-[#E6D5B8]/60">
              <Clock className="w-12 h-12 text-[#A89F91]/55 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#8B7E74]">Lemari kapsul masih kosong</p>
              <p className="text-xs text-[#A89F91] mt-1">Segel kapsul waktu kejutan pertamamu di sebelah kiri!</p>
            </div>
          ) : (
            capsules.map((capsule) => {
              const isLocked = capsule.unlockDate > todayStr;
              const dateObj = new Date(capsule.unlockDate);
              const formattedDate = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
              
              return (
                <div
                  key={capsule.id}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                    capsule.isOpened
                      ? "bg-[#FAF3E0]/20 border-[#E6D5B8]"
                      : isLocked
                        ? "bg-gray-50/40 border-gray-100"
                        : "bg-[#FAEDCD]/30 border-[#E6D5B8] hover:shadow-md"
                  }`}
                >
                  {/* Capsule header */}
                  <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2 ${
                    capsule.isOpened
                      ? "bg-[#FAF3E0]/30 border-[#E6D5B8]"
                      : isLocked
                        ? "bg-gray-100/60 border-gray-150"
                        : "bg-[#FAEDCD]/40 border-[#E6D5B8]"
                  }`}>
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg ${
                        capsule.isOpened ? "bg-[#FAF3E0] text-[#8B7E74] border border-[#E6D5B8]/40" : isLocked ? "bg-gray-200 text-gray-500" : "bg-[#FAEDCD] text-[#BC8F8F] animate-pulse"
                      }`}>
                        {capsule.isOpened ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-[#4A403A]">
                        Kapsul Kejutan dari <span className="text-[#BC8F8F] font-bold">{capsule.sender}</span>
                      </span>
                    </div>

                    <div className="text-[10px] font-semibold text-gray-500">
                      {isLocked ? (
                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                          🔒 Terkunci s.d {formattedDate}
                        </span>
                      ) : capsule.isOpened ? (
                        <span className="text-[#588157] bg-[#E9EDC6] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#CCD5AE]">
                          ✅ Dibuka pada {formattedDate}
                        </span>
                      ) : (
                        <span className="text-[#BC8F8F] bg-[#FAEDCD] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold border border-[#E6D5B8]/40">
                          ✨ Siap Dibuka!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Capsule body */}
                  <div className="p-4">
                    {capsule.isOpened ? (
                      <div className="space-y-3">
                        <p className="text-sm text-[#6D625B] leading-relaxed font-serif whitespace-pre-line italic border-l-2 border-[#E6D5B8] pl-3">
                          "{capsule.message}"
                        </p>
                        {capsule.mediaUrl && (
                          <div className="rounded-xl overflow-hidden border border-[#E6D5B8]/55 max-h-48 shadow-inner bg-gray-50">
                            <img
                              src={capsule.mediaUrl}
                              alt="Kapsul Media"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <p className="text-[9px] text-[#A89F91] font-mono text-right">
                          Dibuat pada: {new Date(capsule.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4 space-y-3">
                        <p className="text-xs text-[#6D625B] font-medium">
                          {isLocked
                            ? `Pesan ini disegel erat dan hanya bisa diakses oleh pasangannya pada tanggal ${formattedDate}. Bersabarlah ya! 😉`
                            : "Kapsul waktu sudah siap dibuka! Pasangan sudah mengizinkan isinya dibaca sekarang."}
                        </p>

                        {!isLocked && (
                          <button
                            onClick={() => handleOpen(capsule.id)}
                            className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-[#D4A373] text-white font-bold text-xs rounded-xl shadow hover:bg-[#BC8F8F] active:scale-95 transition"
                          >
                            <span>Buka Kapsul Waktu 🎁</span>
                          </button>
                        )}
                      </div>
                    )}
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
