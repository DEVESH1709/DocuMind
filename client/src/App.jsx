import {useState} from "react";
import Auth from "./components/Auth.jsx";

function App() {
 const [token, setToken] = useState(null);

  return (
   <div className="min-h-screen bg-slate-900 text-white p-10">
      {!token ? (
        <div className="max-w-md mx-auto">
           <h1 className="text-3xl font-bold mb-6 text-center">DocuMind</h1>
           <Auth onLoginSuccess={setToken} />
        </div>
      ) : (
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
    </div>
      )}
   </div>
  )
}

export default App
