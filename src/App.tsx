import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tag as TagIcon, 
  X, 
  Clock, 
  Hash,
  StickyNote,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

// --- Constants ---
const STORAGE_KEY = "mymemo.notes";

const SEED_DATA: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "디자인 시안 작업 시 준수해야 할 타이포그래피 및 컬러 시스템 가이드라인을 정리합니다.",
    tags: ["디자인", "가이드"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "1. 클린 코드\n2. 리팩터링\n3. 디자인 패턴의 활용\n4. 모던 자바스크립트 Deep Dive",
    tags: ["독서", "자기개발"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "브라우저 기반의 협업 가능한 실시간 캔버스 도구 기획안.",
    tags: ["업무", "개발"],
    updatedAt: new Date().toISOString(),
  }
];

export default function App() {
  // --- States ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    tags: ""
  });

  // --- Effects ---
  // Initial Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notes", e);
        setNotes(SEED_DATA);
      }
    } else {
      setNotes(SEED_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  // --- Handlers ---
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      title: formData.title,
      body: formData.body,
      tags: formData.tags.split(",").map(t => t.trim()).filter(t => t !== ""),
      updatedAt: new Date().toISOString(),
    };

    setNotes(prev => [newNote, ...prev]);
    setIsModalOpen(false);
    setFormData({ title: "", body: "", tags: "" });
  };

  const handleDeleteNote = (id: number) => {
    if (window.confirm("정말로 이 메모를 삭제하시겠습니까?")) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  // --- Computed ---
  const tagsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        note.title.toLowerCase().includes(searchLower) ||
        note.body.toLowerCase().includes(searchLower) ||
        note.tags.some(t => t.toLowerCase().includes(searchLower));
      
      return matchesTag && matchesSearch;
    });
  }, [notes, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <StickyNote className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">MyMemo</h1>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="제목, 내용, 태그 검색..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">새 메모</span>
          </motion.button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-24 space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3 flex items-center gap-2">
                <Filter className="w-3 h-3" />
                필터
              </h2>
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedTag === null 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    전체 메모
                  </span>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
                    {notes.length}
                  </span>
                </button>

                {tagsWithCounts.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedTag === tag 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <TagIcon className="w-4 h-4 shrink-0" />
                      {tag}
                    </span>
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">
                      {count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-default overflow-hidden flex flex-col min-h-[200px]"
                  >
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-3 right-3 p-1.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-all translate-y-[-4px] group-hover:translate-y-0"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1 pr-6">
                      {note.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1 whitespace-pre-wrap line-clamp-4">
                      {note.body}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {note.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded"
                          >
                            <Hash className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Clock className="w-3 h-3" />
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-lg">검색 결과가 없습니다.</p>
              <p className="text-sm">다른 키워드로 검색하거나 새 메모를 추가해보세요.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">새 메모 추가</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNote} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">제목</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    placeholder="메모 제목을 입력하세요"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">본문</label>
                  <textarea
                    rows={6}
                    placeholder="여기에 메모 내용을 입력하세요..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">태그 (쉼표로 구분)</label>
                  <div className="relative">
                    <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="예: 업무, 중요, 개인"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">엔터나 쉼표로 태그를 구분할 수 있습니다.</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    메모 저장
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
