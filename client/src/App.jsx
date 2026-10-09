import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Music, Video, Globe, LayoutDashboard, History as HistoryIcon, LogOut, Layers, PanelLeftClose, PanelLeftOpen, PanelLeft, X } from 'lucide-react';
import Chatbot from './components/Chatbot';
import FileUploader from './components/FileUploader';
import MediaPlayer from './components/MediaPlayer';
import DocumentLibrary from './components/DocumentLibrary';
import SummaryDisplay from './components/SummaryDisplay';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import HistoryView from './components/HistoryView';
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
  const [showMobileFiles, setShowMobileFiles] = useState(false); // Mobile inline files panel
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true); // Desktop sidebar

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
    setTimeout(() => {
      document.getElementById('chatbot-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
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
    <div className="h-screen h-[100dvh] max-h-[100dvh] flex flex-col bg-[#080c14] text-[#f0f4ff] font-sans selection:bg-blue-500 selection:text-white overflow-hidden">
      {/* Decorative background blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', filter: 'blur(120px)' }} />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <header className="flex-none sticky top-0 z-50 backdrop-blur-xl border-b border-blue-900/30" style={{ background: 'rgba(8,12,20,0.92)' }}>
        <div className="max-w-[1600px] mx-auto px-2.5 sm:px-6 py-2 sm:py-3.5 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-[11px] sm:text-xs shadow-md border border-blue-500/40 transform hover:rotate-3 transition-transform cursor-default shrink-0" style={{ boxShadow: '0 0 14px rgba(37,99,235,0.4)' }}>
              DM
            </div>
            <h1 className="text-sm sm:text-lg font-black tracking-tight text-[#f0f4ff]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Docu<span className="text-blue-500">Mind</span>
            </h1>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <nav className="flex items-center gap-0.5 sm:gap-1.5 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border-shining-dark-blue-subtle text-xs font-semibold shrink-0" style={{ background: 'rgba(15,22,36,0.85)' }}>
              <button 
                onClick={() => {
                  if (!token) {
                    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveTab('workspace');
                  }
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                  activeTab === 'workspace' 
                    ? 'bg-[#161f33] text-blue-400 shadow-sm border border-blue-500/30 font-bold' 
                    : 'text-[#8899bb] hover:text-[#f0f4ff] hover:bg-[#161f33]/50'
                }`}
                title="Workspace"
              >
                <LayoutDashboard size={13} className="shrink-0" />
                <span className="text-[11px] sm:text-xs hidden min-[360px]:inline">Workspace</span>
              </button>
              <button 
                onClick={() => {
                  if (!token) {
                    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveTab('history');
                  }
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                  activeTab === 'history' 
                    ? 'bg-[#161f33] text-blue-400 shadow-sm border border-blue-500/30 font-bold' 
                    : 'text-[#8899bb] hover:text-[#f0f4ff] hover:bg-[#161f33]/50'
                }`}
                title="History"
              >
                <HistoryIcon size={13} className="shrink-0" />
                <span className="text-[11px] sm:text-xs hidden min-[360px]:inline">History</span>
              </button>
            </nav>

            <div className="h-4 w-px bg-blue-900/40 hidden sm:block" />

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {token && (
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-all cursor-pointer px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-red-500/30 shrink-0"
                  style={{ background: 'rgba(239,68,68,0.1)' }}
                  title="Log out of DocuMind"
                >
                  <LogOut size={13} className="shrink-0" />
                  <span className="hidden min-[400px]:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-3 sm:px-6 relative z-10 flex flex-col overflow-y-auto lg:overflow-hidden">
        {activeTab === 'history' && (
          <div className="h-full py-4 sm:py-6 overflow-y-auto no-scrollbar">
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
          <div className="h-full flex flex-col py-2 sm:py-3 min-h-0">
            {/* Main Workspace: Left Sidebar + Hero Chatbot */}
            <div className="flex-1 flex gap-3.5 lg:gap-5 min-h-0 relative">
              
              {/* Desktop Knowledge Base Sidebar */}
              <aside 
                className={`hidden lg:flex flex-col h-full rounded-3xl border-shining-dark-blue overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
                  desktopSidebarOpen ? 'w-[360px] xl:w-[410px]' : 'w-0 border-none opacity-0 pointer-events-none'
                }`} 
                style={{ background: '#0b101d' }}
              >
                {/* Sidebar Header */}
                <div className="p-3.5 border-b border-blue-900/40 flex items-center justify-between shrink-0" style={{ background: 'rgba(8,12,20,0.6)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl border border-blue-500/30 text-blue-400" style={{ background: 'rgba(37,99,235,0.15)' }}>
                      <Layers size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#f0f4ff]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Knowledge Base</h3>
                      <p className="text-[10px] text-[#8899bb] font-semibold">{files.length} {files.length === 1 ? 'file' : 'files'} attached</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDesktopSidebarOpen(false)}
                    className="p-1.5 rounded-xl text-[#8899bb] hover:text-[#f0f4ff] hover:bg-white/10 transition-colors cursor-pointer border border-blue-900/30"
                    title="Collapse Sidebar"
                  >
                    <PanelLeftClose size={15} />
                  </button>
                </div>

                {/* Sidebar Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                  <section className="rounded-2xl border-shining-dark-blue overflow-hidden" style={{ background: '#0f1624' }}>
                    <FileUploader token={token} onUploadSuccess={handleUploadSuccess} />
                  </section>

                  {activeMedia && (
                    <section id="media-player-section" className="rounded-2xl p-3.5 border-shining-dark-blue overflow-hidden animate-in fade-in duration-300" style={{ background: '#0f1624' }}>
                      <div className="flex items-center justify-between pb-2 border-b border-blue-900/40 mb-2.5">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                          <h4 className="text-xs font-bold text-[#f0f4ff] truncate">{activeMedia.filename}</h4>
                        </div>
                        <button 
                          onClick={() => setActiveMedia(null)}
                          className="px-2 py-0.5 rounded-lg text-[#8899bb] hover:text-[#f0f4ff] text-[11px] font-bold cursor-pointer border border-blue-900/30 shrink-0"
                          style={{ background: 'rgba(22,31,51,0.8)' }}
                        >
                          Close
                        </button>
                      </div>
                      <MediaPlayer url={getMediaUrl(activeMedia)} seekCommand={seekCommand} />
                    </section>
                  )}

                  <section>
                    <DocumentLibrary 
                      files={files} 
                      loading={loadingFiles} 
                      onDelete={handleDeleteFile}
                      onSelectMedia={handleSelectMedia}
                      activeMediaId={activeMedia?._id || activeMedia?.id}
                    />
                  </section>
                </div>
              </aside>

              {/* Right Hero Stage: AI Analyst Chatbot */}
              <div className="flex-1 h-full min-w-0 flex flex-col">
                {/* Mobile Top Context Strip (< lg screens) */}
                <div className="lg:hidden flex items-center justify-between px-3 py-2 rounded-2xl border-shining-dark-blue-subtle mb-2.5 shrink-0" style={{ background: 'rgba(15,22,36,0.95)' }}>
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="p-1 rounded-lg border border-blue-500/30 text-blue-400 shrink-0" style={{ background: 'rgba(37,99,235,0.15)' }}>
                      <Layers size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#f0f4ff] truncate block">
                        Knowledge Base ({files.length})
                      </span>
                      {files.length > 0 && (
                        <span className="text-[10px] text-blue-300 font-medium truncate block max-w-[150px]">
                          {files[0].filename}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMobileFiles(!showMobileFiles)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-bold cursor-pointer shadow-sm active:scale-95 shrink-0"
                    style={{ background: 'rgba(37,99,235,0.15)' }}
                  >
                    <span>{showMobileFiles ? 'Hide Files ✕' : '+ Manage Files ▾'}</span>
                  </button>
                </div>

                {/* Mobile Inline Files Panel (Smooth Inline Expand, NO OVERLAY!) */}
                {showMobileFiles && (
                  <div className="lg:hidden mb-3 p-3.5 rounded-2xl border-shining-dark-blue space-y-4 max-h-[380px] overflow-y-auto no-scrollbar animate-in fade-in duration-200 shrink-0" style={{ background: '#0b101d' }}>
                    <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
                      <span className="text-xs font-bold text-[#f0f4ff]">Attached Files & Upload</span>
                      <button
                        onClick={() => setShowMobileFiles(false)}
                        className="text-[11px] font-bold text-[#8899bb] hover:text-[#f0f4ff]"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <FileUploader token={token} onUploadSuccess={(newFiles) => {
                      handleUploadSuccess(newFiles);
                      setShowMobileFiles(false);
                    }} />

                    <DocumentLibrary 
                      files={files} 
                      loading={loadingFiles} 
                      onDelete={handleDeleteFile}
                      onSelectMedia={(file) => {
                        handleSelectMedia(file);
                        setShowMobileFiles(false);
                      }}
                      activeMediaId={activeMedia?._id || activeMedia?.id}
                    />
                  </div>
                )}

                {/* Mobile Mini Player if media is active (< lg screens) */}
                {activeMedia && (
                  <div className="lg:hidden mb-2.5 p-3 rounded-2xl border-shining-dark-blue flex flex-col gap-2 shrink-0 animate-in fade-in duration-200" style={{ background: '#0f1624' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                        <span className="text-xs font-bold text-[#f0f4ff] truncate">Playing: {activeMedia.filename}</span>
                      </div>
                      <button 
                        onClick={() => setActiveMedia(null)}
                        className="px-2 py-0.5 rounded-lg text-[#8899bb] hover:text-[#f0f4ff] text-[10px] font-bold border border-blue-900/30 shrink-0"
                      >
                        Close
                      </button>
                    </div>
                    <MediaPlayer url={getMediaUrl(activeMedia)} seekCommand={seekCommand} />
                  </div>
                )}

                {/* The Chatbot Component (MAIN HERO STAGE) */}
                <div className="flex-1 min-h-0 flex flex-col h-full">
                  <Chatbot 
                    token={token} 
                    onTimestampClick={handleTimestampClick} 
                    files={files}
                    onOpenSidebar={() => setShowMobileFiles(!showMobileFiles)}
                    desktopSidebarOpen={desktopSidebarOpen}
                    onToggleDesktopSidebar={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
                  />
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

    </div>
  );
}

export default App;


