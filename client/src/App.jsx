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
        <div className="text-center mt-20">
          <h2 className="text-2xl">Welcome! Dashboard coming soon...</h2>
          <button onClick={() => setToken(null)} className="mt-4 text-slate-400">Logout</button>
        </div>
      )}
    </div>
  )
}

export default App
