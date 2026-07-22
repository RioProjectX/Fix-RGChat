import React, { useState } from "react";
import { CheckSquare, Square, Trash2, Calendar, Bell, Plus, Star } from "lucide-react";
import { Todo } from "../types";

interface SharedTodosProps {
  todos: Todo[];
  onAddTodo: (text: string, dueDate: string, reminder: boolean) => Promise<void>;
  onToggleTodo: (id: string, completed: boolean) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  activeUser: string;
}

export default function SharedTodos({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  activeUser
}: SharedTodosProps) {
  const [newTodoText, setNewTodoText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminder, setReminder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Statistics
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddTodo(newTodoText.trim(), dueDate, reminder);
      setNewTodoText("");
      setDueDate("");
      setReminder(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E6D5B8] p-6 md:p-8" id="shared-todos-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif italic text-[#8B7E74] flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#BC8F8F]" />
            To-Do List Bersama
          </h2>
          <p className="text-sm text-[#A89F91] mt-1">
            Kerjakan tugas atau rancang persiapan kencan bareng. Selesaikan bersama pasangan!
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="flex items-center space-x-3 bg-[#FAF3E0] border border-[#E6D5B8] p-3 rounded-2xl w-full md:w-64 shadow-sm">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold text-[#8B7E74] mb-1">
              <span>Progres Agenda</span>
              <span>{completed}/{total} ({completionPercentage}%)</span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-2">
              <div
                className="bg-[#BC8F8F] h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Add New Todo form */}
        <form onSubmit={handleSubmit} className="lg:col-span-4 bg-[#FAF3E0]/30 rounded-2xl border border-[#E6D5B8] p-4 space-y-4 h-fit">
          <h3 className="font-serif italic font-bold text-[#8B7E74] text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#D4A373]" /> Tambah To-Do Baru
          </h3>
          
          <div>
            <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Nama Agenda / Aktivitas</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A373] placeholder:text-[#A89F91] text-[#4A403A]"
              placeholder="Contoh: Beli kado anniversary, booking hotel..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#8B7E74] uppercase mb-1">Tenggat Waktu (Opsional)</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-white border border-[#E6D5B8] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A373] text-[#4A403A]"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 bg-white/80 p-2 border border-[#E6D5B8]/60 rounded-xl">
            <input
              type="checkbox"
              id="reminder"
              className="w-4 h-4 text-[#D4A373] border-[#E6D5B8] rounded focus:ring-[#D4A373]"
              checked={reminder}
              onChange={(e) => setReminder(e.target.checked)}
            />
            <label htmlFor="reminder" className="text-xs text-[#6D625B] font-medium select-none flex items-center gap-1 cursor-pointer">
              <Bell className="w-3.5 h-3.5 text-[#BC8F8F]" />
              Aktifkan Pengingat
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#D4A373] hover:bg-[#BC8F8F] text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isSubmitting ? "Menambahkan..." : "Tambahkan ke Checklist"}
          </button>
        </form>

        {/* Right column: To-Do list scroll */}
        <div className="lg:col-span-8 space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {todos.length === 0 ? (
            <div className="text-center py-12 bg-[#FAF3E0]/20 rounded-2xl border border-[#E6D5B8]/60">
              <CheckSquare className="w-12 h-12 text-[#A89F91]/50 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#8B7E74]">Belum ada To-Do list</p>
              <p className="text-xs text-[#A89F91] mt-1">Gunakan formulir di samping untuk menambahkan agenda bersama!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-start justify-between p-4 rounded-2xl border transition-all ${
                  todo.completed
                    ? "bg-gray-50/60 border-gray-200 text-gray-400"
                    : "bg-white border-[#E6D5B8] hover:border-[#D4A373] text-[#4A403A] shadow-sm"
                }`}
              >
                <div className="flex items-start space-x-3 flex-1">
                  {/* Custom checkmark button */}
                  <button
                    onClick={() => onToggleTodo(todo.id, !todo.completed)}
                    className="mt-0.5 text-[#BC8F8F] hover:scale-105 transition active:scale-95 flex-shrink-0"
                    title={todo.completed ? "Tandai belum selesai" : "Tandai selesai"}
                  >
                    {todo.completed ? (
                      <CheckSquare className="w-5 h-5 fill-[#FAF3E0] text-[#BC8F8F]" />
                    ) : (
                      <Square className="w-5 h-5 text-[#A89F91]" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <p className={`text-sm font-medium leading-snug ${todo.completed ? "line-through text-gray-400 font-serif italic" : "text-[#4A403A]"}`}>
                      {todo.text}
                    </p>
                    
                    {/* Metadata indicators */}
                    <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-gray-400 font-medium">
                      <span className="bg-[#FAF3E0] px-2 py-0.5 rounded-full text-[#8B7E74]">
                        Oleh: {todo.createdBy}
                      </span>
                      
                      {todo.dueDate && (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                          todo.completed 
                            ? "bg-gray-100 text-gray-400" 
                            : new Date(todo.dueDate) < new Date() 
                              ? "bg-red-50 text-red-500 font-bold" 
                              : "bg-[#FAEDCD] text-[#8B7E74]"
                        }`}>
                          <Calendar className="w-2.5 h-2.5" />
                          Tenggat: {new Date(todo.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          {new Date(todo.dueDate) < new Date() && !todo.completed && " (Terlewat!)"}
                        </span>
                      )}

                      {todo.reminder && !todo.completed && (
                        <span className="flex items-center gap-0.5 text-[#D4A373] bg-[#FEFAE0] px-1.5 py-0.5 rounded-full border border-[#E6D5B8]/40">
                          <Bell className="w-2.5 h-2.5 animate-bounce" />
                          Pengingat Aktif
                        </span>
                      )}

                      {todo.completed && (
                        <span className="bg-[#E9EDC6] text-[#588157] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 border border-[#CCD5AE]">
                          <Star className="w-2.5 h-2.5 fill-[#588157]" />
                          Diselesaikan oleh: {todo.completedBy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="text-gray-300 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition ml-2 flex-shrink-0"
                  title="Hapus Agenda"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
