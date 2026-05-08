import React, { useState } from 'react';
import axios from 'axios';
import Chatbot from './components/Chatbot';
import FileUploader from './components/FileUploader';
import MediaPlayer from './components/MediaPlayer';
import DocumentLibrary from './components/DocumentLibrary';
import SummaryDisplay from './components/SummaryDisplay';
import Auth from './components/Auth';


function App() {
  const [token, setToken] = useState(null);
  const [seekCommand, setSeekCommand] = useState(null);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const fetchFiles = async (authToken) => {
    try {
      setLoadingFiles(true);
      const response = await axios.get('http://localhost:8000/files/', {
        headers: { Authorization: authToken }
      });
      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleAuthSuccess = (newToken) => {
    setToken(newToken);
    fetchFiles(newToken);
  };

  const handleUploadSuccess = (newFiles) => {
    // newFiles is an array of objects from the backend
    setFiles(prev => [...newFiles, ...prev]);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`http://localhost:8000/files/${fileId}`, {
        headers: { Authorization: token }
      });
      setFiles(prev => prev.filter(f => (f._id || f.id) !== fileId));
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete file.");
    }
  };

  const handleTimestampClick = (seconds) => {
    setSeekCommand({ time: seconds, id: Date.now() });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden">
      {/* Decorative background blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-400/10 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
                <a href="#" className="hover:text-blue-600 transition-colors">Workspace</a>
                <a href="#" className="hover:text-blue-600 transition-colors">History</a>
            </nav>
            <div className="h-6 w-px bg-slate-200 hidden md:block" />
            <div className="flex items-center gap-4">
              {token && (
                <button onClick={() => { setToken(null); setFiles([]); }} className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer px-4 py-2 hover:bg-red-50 rounded-lg">
                  Logout
                </button>
              )}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20">
                <span className="text-xs font-bold uppercase tracking-widest">Pro Workspace</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {!token && (
          <div className="flex flex-col items-center justify-center py-20 space-y-10">
            <div className="text-center max-w-3xl space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
                Next-Gen Document AI
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-tight">
                Understand your files <br/> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">faster than ever.</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                The most powerful AI tool for cross-referencing documents, audio, and video in one unified workspace.
              </p>
            </div>

            <Auth onLoginSuccess={handleAuthSuccess} />
          </div>
        )}

        {token && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <FileUploader token={token} onUploadSuccess={handleUploadSuccess} />
              </section>

              <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <DocumentLibrary files={files} loading={loadingFiles} onDelete={handleDeleteFile} />
              </section>
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-28">
                <Chatbot token={token} onTimestampClick={handleTimestampClick} files={files} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
