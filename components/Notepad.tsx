import React, { useState } from 'react';
import { Save, Trash2, Copy, Search, X, FileText, Edit } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Note } from '../types';

const Notepad: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useData();
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!note.trim()) return;

    if (editingId) {
      await updateNote(editingId, {
        content: note,
        timestamp: new Date().toLocaleString('bn-BD') + ' (সম্পাদিত)'
      });
      setEditingId(null);
    } else {
      await addNote({
        content: note,
        timestamp: new Date().toLocaleString('bn-BD'),
      });
    }
    setNote('');
  };

  const handleEdit = (noteToEdit: Note) => {
    setNote(noteToEdit.content);
    setEditingId(noteToEdit.id);
  };

  const handleCancelEdit = () => {
    setNote('');
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    if (editingId === id) {
      handleCancelEdit();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredNotes = notes.filter(n =>
    n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.timestamp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-80px)] min-h-full">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="text-blue-400" />
            নোটপ্যাড
          </h2>
          <p className="text-slate-400 mt-2 max-w-2xl">
            এখানে নিজের আইডিয়া, টাস্ক এবং রিমাইন্ডার বানিয়ে রাখতে পারবেন। নোটটি তৈরি করুন, খুঁজুন, কপি করুন বা সহজে এডিট করুন।
          </p>
        </div>
        <div className="text-slate-400 text-sm font-mono bg-slate-900 px-4 py-2 rounded-full border border-slate-800 shadow-sm">
          {notes.length} টি নোট
        </div>
      </header>

      {/* Editor Section */}
      <div className="bg-slate-950/80 backdrop-blur-xl rounded-[32px] border border-slate-800 shadow-2xl mb-6 overflow-hidden">
        <div className="px-5 py-4 bg-slate-900/95 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-slate-300 font-semibold">নতুন নোট</p>
            <p className="text-slate-500 text-sm">আপনার গুরুত্বপূর্ণ তথ্য সংরক্ষণ করুন</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-slate-400 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">সম্পাদনা: {editingId ? 'চলছে' : 'নতুন'}</span>
            <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">অক্ষর: {note.length}</span>
          </div>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="এখানে আপনার নোট লিখুন..."
          className="w-full min-h-[200px] bg-transparent p-6 text-slate-100 text-lg resize-none focus:outline-none font-sans leading-relaxed placeholder-slate-500"
        />
        <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/80 border border-slate-800">
              <FileText size={16} /> নোট প্রস্তুতি
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-2xl font-semibold transition text-sm"
              >
                বাতিল
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!note.trim()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-semibold transition text-sm"
            >
              <Save size={18} /> {editingId ? 'আপডেট করুন' : 'সেভ করুন'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="mb-4 relative shrink-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নোট খুঁজুন..."
            className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar pb-4 min-h-0">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((noteItem) => (
              <div
                key={noteItem.id}
                className={`bg-slate-900/95 border ${editingId === noteItem.id ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-800'} p-5 rounded-3xl group hover:border-slate-700 transition relative`}
              >
                <p className="text-slate-200 whitespace-pre-wrap mb-4 font-sans text-sm leading-7">{noteItem.content}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-800/50">
                  <span className="text-xs text-slate-500 font-mono">{noteItem.timestamp}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(noteItem)}
                      className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-2xl transition"
                      title="এডিট"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleCopy(noteItem.content)}
                      className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-2xl transition"
                      title="কপি"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(noteItem.id)}
                      className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition"
                      title="মুছুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : notes.length > 0 ? (
            <div className="text-center text-slate-500 py-10 rounded-3xl border border-dashed border-slate-800 bg-slate-900/70">
              কোনো নোট পাওয়া যায়নি
            </div>
          ) : (
            <div className="text-center text-slate-500 py-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-800 bg-slate-900/70">
              <div className="p-4 bg-slate-900 rounded-full">
                <FileText size={32} className="text-slate-700" />
              </div>
              <p className="text-slate-200 font-medium">আপনার নোটপ্যাড এখন খালি</p>
              <p className="text-slate-400 text-sm">উপরের বাক্সে ক্লিক করে প্রথম নোট তৈরি করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notepad;
