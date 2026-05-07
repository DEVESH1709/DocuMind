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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              DM
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                DocuMind
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {token && (
              <button onClick={() => { setToken(null); setFiles([]); }} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                Logout
              </button>
            )}
            <p className="text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
              Multi-Document Workspace
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        {!token && (
          <div className="flex flex-col items-center justify-center py-12 relative z-10 space-y-8">
            <div className="text-center max-w-2xl">
              <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
                Unlock Knowledge from Your Files.
              </h2>
              <p className="text-lg text-slate-400">
                Upload multiple documents, audio, or video. Get AI cross-references and ask questions across all of them.
              </p>
            </div>

            <Auth onLoginSuccess={handleAuthSuccess} />
          </div>
        )}

        {token && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            <div className="lg:col-span-8 space-y-6">
              <section>
                <FileUploader token={token} onUploadSuccess={handleUploadSuccess} />
              </section>

              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DocumentLibrary files={files} loading={loadingFiles} onDelete={handleDeleteFile} />
              </section>
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-24">
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
