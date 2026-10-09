import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Music, Video, Globe, Sparkles, LayoutDashboard, History as HistoryIcon, LogOut } from 'lucide-react';
import Chatbot from './components/Chatbot';
import FileUploader from './components/FileUploader';
import MediaPlayer from './components/MediaPlayer';
import DocumentLibrary from './components/DocumentLibrary';
import SummaryDisplay from './components/SummaryDisplay';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
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

  if (!token) {
    return <LandingPage onLoginSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#080c14] text-[#f0f4ff] font-sans selection:bg-blue-500 selection:text-white overflow-hidden">
      {/* Decorative background blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', filter: 'blur(120px)' }} />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <header className="flex-none sticky top-0 z-50 backdrop-blur-xl border-b border-blue-900/30" style={{ background: 'rgba(8,12,20,0.9)' }}>
        <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-xs shadow-lg border border-blue-500/40 transform hover:rotate-3 transition-transform cursor-default" style={{ boxShadow: '0 0 16px rgba(37,99,235,0.4)' }}>
              DM
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#f0f4ff]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Docu<span className="text-blue-500">Mind</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl border-shining-dark-blue-subtle text-xs sm:text-[13px] font-semibold" style={{ background: 'rgba(15,22,36,0.8)' }}>
              <button 
                onClick={() => {
                  if (!token) {
                    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveTab('workspace');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'workspace' 
                    ? 'bg-[#161f33] text-blue-400 shadow-sm border border-blue-500/30 font-bold' 
                    : 'text-[#8899bb] hover:text-[#f0f4ff] hover:bg-[#161f33]/50'
                }`}
              >
                <LayoutDashboard size={14} />
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'history' 
                    ? 'bg-[#161f33] text-blue-400 shadow-sm border border-blue-500/30 font-bold' 
                    : 'text-[#8899bb] hover:text-[#f0f4ff] hover:bg-[#161f33]/50'
                }`}
              >
                <HistoryIcon size={14} />
                <span>History</span>
              </button>
            </nav>

            <div className="h-5 w-px bg-blue-900/40 hidden sm:block" />

            <div className="flex items-center gap-2 sm:gap-2.5">
              {token && (
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-all cursor-pointer px-3 py-1.5 rounded-xl border border-red-500/30"
                  style={{ background: 'rgba(239,68,68,0.1)' }}
                  title="Log out of DocuMind"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}

              <button 
                onClick={() => setShowProModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white border border-blue-500/50 active:scale-95 transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 16px rgba(37,99,235,0.35)' }}
                title="View Pro Workspace Status & Features"
              >
                <Sparkles size={13} className="text-amber-300 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Pro Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-6 overflow-hidden relative z-10">
        {activeTab === 'history' && (
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full py-6">
            {/* Left Side: Scrollable */}
            <div className="lg:col-span-8 space-y-8 overflow-y-auto pr-3 no-scrollbar pb-20">
              <section className="rounded-3xl border-shining-dark-blue overflow-hidden" style={{ background: '#0f1624' }}>
                <FileUploader token={token} onUploadSuccess={handleUploadSuccess} />
              </section>

              {activeMedia && (
                <section id="media-player-section" className="rounded-3xl p-4 sm:p-5 border-shining-dark-blue overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500" style={{ background: '#0f1624' }}>
                  <div className="flex items-center justify-between pb-2.5 border-b border-blue-900/40 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-[#f0f4ff] truncate max-w-sm sm:max-w-md">
                          Now Playing: <span className="text-blue-400">{activeMedia.filename}</span>
                        </h3>
                        <p className="text-[11px] text-[#8899bb] font-medium">Click any timestamp in the chat to jump directly to that point</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveMedia(null)}
                      className="px-2.5 py-1 rounded-xl text-[#8899bb] hover:text-[#f0f4ff] text-xs font-bold transition-colors cursor-pointer border border-blue-900/40"
                      style={{ background: 'rgba(22,31,51,0.8)' }}
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


