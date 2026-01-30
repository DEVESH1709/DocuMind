import React, { useState } from 'react';
import axios from 'axios';
import Chatbot from './components/Chatbot';
import FileUploader from './components/FileUploader';
import MediaPlayer from './components/MediaPlayer';
import SummaryDisplay from './components/SummaryDisplay';
import Auth from './components/Auth'; 


function App() {
  const [token, setToken] = useState(null);
  const [seekCommand, setSeekCommand] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  // const [loginLoading, setLoginLoading] = useState(false);

  const handleAuthSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleUploadSuccess = (data) => {
    setCurrentFile({
      url: data.url || null,
      summary: data.summary || "Summary will appear here after backend implementation.",
      type: data.type || 'unknown'
    });
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
              <button onClick={() => setToken(null)} className="text-sm text-slate-400 hover:text-white transition-colors">
                Logout
              </button>
            )}
            <p className="text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
              AI-Powered Workspace
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
                Upload documents, audio, or video. Get AI summaries and ask questions instantly.
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

              {currentFile && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {['audio', 'video', 'mp3', 'wav', 'mp4'].some(ext => currentFile.type?.includes(ext)) && currentFile.url && (
                    <div className="bg-slate-800/50 p-1 rounded-2xl border border-white/5 shadow-2xl">
                      <MediaPlayer url={currentFile.url} seekCommand={seekCommand} />
                    </div>
                  )}

                  <div className="mt-6">
                    <SummaryDisplay summary={currentFile.summary} />
                  </div>
                </section>
              )}
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <Chatbot token={token} onTimestampClick={handleTimestampClick} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
