import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Music, Video, Globe, Sparkles, LayoutDashboard, History as HistoryIcon, LogOut } from 'lucide-react';
import Chatbot from './components/Chatbot';
import FileUploader from './components/FileUploader';
import MediaPlayer from './components/MediaPlayer';
import DocumentLibrary from './components/DocumentLibrary';
import SummaryDisplay from './components/SummaryDisplay';
import Auth from './components/Auth';
import HistoryView from './components/HistoryView';
import ProModal from './components/ProModal';
import { useToast } from './context/ToastContext';
import { API_BASE_URL } from './config';


const getMediaUrl = (file) => {
  if (!file) return null;
  if (file.url) return file.url;
  if (file.media_url) return file.media_url;
  if (file.filename) return `${API_BASE_URL}/media/${encodeURIComponent(file.filename)}`;
  return null;
};

function App() {
  const { success, error, info } = useToast();
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('documind_token');
    } catch {
      return null;
    }
  });
  const [seekCommand, setSeekCommand] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'history'
  const [showProModal, setShowProModal] = useState(false);

  const fetchFiles = async (authToken) => {
    if (!authToken) return;
    try {
      setLoadingFiles(true);
      const response = await axios.get(`${API_BASE_URL}/files/`, {
        headers: { Authorization: authToken }
      });
      setFiles(response.data);
      // Auto-select first media file if available
      const firstMedia = response.data.find(f => f.type === 'audio' || f.type === 'video' || (f.filename && /\.(mp4|mp3|wav|m4a)$/i.test(f.filename)));
      if (firstMedia && !activeMedia) {
        setActiveMedia(firstMedia);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('documind_token');
        setToken(null);
        error("Your session has expired. Please sign in again.", "Session Expired");
      }
    } finally {
      setLoadingFiles(false);
    }
  };

  React.useEffect(() => {
    if (token) {
      fetchFiles(token);
    }
  }, [token]);

  const handleAuthSuccess = (newToken) => {
    try {
      localStorage.setItem('documind_token', newToken);
    } catch (e) {
      console.error("Could not save token:", e);
    }
    setToken(newToken);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('documind_token');
    } catch (e) {
      console.error("Could not remove token:", e);
    }
    setToken(null);
    setFiles([]);
    setActiveMedia(null);
    setActiveTab('workspace');
    info("You have been signed out.", "Session Ended");
  };

  const handleUploadSuccess = (newFiles) => {
    setFiles(prev => [...newFiles, ...prev]);
    const media = newFiles.find(f => f.type === 'audio' || f.type === 'video' || (f.filename && /\.(mp4|mp3|wav|m4a)$/i.test(f.filename)));
    if (media) {
      setActiveMedia(media);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`${API_BASE_URL}/files/${fileId}`, {
        headers: { Authorization: token }
      });
      setFiles(prev => prev.filter(f => (f._id || f.id) !== fileId));
      if (activeMedia && (activeMedia._id === fileId || activeMedia.id === fileId)) {
        setActiveMedia(null);
      }
      success("Document removed from library.", "Document Deleted");
    } catch (err) {
      console.error("Error deleting file:", err);
      error("Failed to delete file from server.", "Delete Failed");
    }
  };

  const handleSelectMedia = (file) => {
    setActiveMedia(file);
    setTimeout(() => {
      document.getElementById('media-player-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleTimestampClick = (seconds) => {
    if (!activeMedia) {
      const foundMedia = files.find(f => f.type === 'audio' || f.type === 'video' || (f.filename && /\.(mp4|mp3|wav|m4a)$/i.test(f.filename)));
      if (foundMedia) {
        setActiveMedia(foundMedia);
      }
    }
    setSeekCommand({ time: seconds, id: Date.now() });
    setTimeout(() => {
      document.getElementById('media-player-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500 selection:text-white overflow-hidden">
      {/* Decorative background blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-400/10 blur-[100px] rounded-full" />
      </div>

      <header className="flex-none sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-blue-100 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30 transform hover:rotate-3 transition-transform cursor-default">
              DM
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Docu<span className="text-blue-600">Mind</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 text-xs sm:text-sm font-semibold">
              <button 
                onClick={() => {
                  if (!token) {
                    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveTab('workspace');
                  }
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'workspace' 
                    ? 'bg-white text-blue-600 shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <LayoutDashboard size={15} />
                <span>Workspace</span>
              </button>
              <button 
                onClick={() => {
                  if (!token) {
                    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveTab('history');
                  }
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'history' 
                    ? 'bg-white text-blue-600 shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <HistoryIcon size={15} />
                <span>History</span>
              </button>
            </nav>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2 sm:gap-3">
              {token && (
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 transition-all cursor-pointer px-3 py-2 rounded-xl border border-red-100"
                  title="Log out of DocuMind"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}

              <button 
                onClick={() => setShowProModal(true)}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer border border-blue-500/30"
                title="View Pro Workspace Status & Features"
              >
                <Sparkles size={14} className="text-amber-300 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Pro Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-6 overflow-hidden relative z-10">
        {!token && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center h-full py-6 lg:py-8 overflow-y-auto no-scrollbar">
            <div className="space-y-6 lg:text-left text-center">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest">
                Next-Gen Document AI
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Understand your files <br/> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">faster than ever.</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-xl lg:mx-0 mx-auto leading-relaxed">
                The most powerful AI tool for cross-referencing documents, audio, and video in one unified workspace. Join thousands of users today.
              </p>
              
              <div className="flex flex-wrap items-center lg:justify-start justify-center gap-4 pt-4">
                 {[
                   { icon: <FileText size={18} />, label: "PDF Documents" },
                   { icon: <Music size={18} />, label: "Audio Files" },
                   { icon: <Video size={18} />, label: "Video Q&A" }
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <div className="text-blue-600">{item.icon}</div>
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                   </div>
                 ))}
              </div>
            </div>

            <div id="auth-section" className="w-full max-w-md lg:ml-auto mx-auto">
              <Auth onLoginSuccess={handleAuthSuccess} />
            </div>
          </div>
        )}



        {token && activeTab === 'history' && (
          <div className="h-full py-6 overflow-y-auto no-scrollbar">
            <HistoryView 
              files={files} 
              onBackToWorkspace={() => setActiveTab('workspace')}
              onSelectMedia={(file) => {
                handleSelectMedia(file);
                setActiveTab('workspace');
              }}
              onTimestampClick={(sec) => {
                handleTimestampClick(sec);
                setActiveTab('workspace');
              }}
            />
          </div>
        )}

        {token && activeTab === 'workspace' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full py-10">
            {/* Left Side: Scrollable */}
            <div className="lg:col-span-8 space-y-10 overflow-y-auto pr-4 no-scrollbar pb-20">
              <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <FileUploader token={token} onUploadSuccess={handleUploadSuccess} />
              </section>

              {activeMedia && (
                <section id="media-player-section" className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 truncate max-w-sm sm:max-w-md">
                          Now Playing: <span className="text-blue-600">{activeMedia.filename}</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">Click any timestamp in the chat to jump directly to that point</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveMedia(null)}
                      className="px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-100"
                    >
                      Close Player
                    </button>
                  </div>
                  <MediaPlayer url={getMediaUrl(activeMedia)} seekCommand={seekCommand} />
                </section>
              )}

              <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <DocumentLibrary 
                  files={files} 
                  loading={loadingFiles} 
                  onDelete={handleDeleteFile}
                  onSelectMedia={handleSelectMedia}
                  activeMediaId={activeMedia?._id || activeMedia?.id}
                />
              </section>
            </div>

            {/* Right Side: Static */}
            <div className="lg:col-span-4 h-full flex items-start">
              <div className="w-full sticky top-0">
                <Chatbot token={token} onTimestampClick={handleTimestampClick} files={files} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pro Modal */}
      <ProModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)} 
        totalFiles={files.length} 
      />
    </div>
  );
}

export default App;
