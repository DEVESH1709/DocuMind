import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertCircle, File as FileIcon, Loader2 } from 'lucide-react';

function FileUploader({ token, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setStatus({ type: '', msg: '' });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus({ type: '', msg: '' });
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setStatus({ type: '', msg: '' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: token
                }
            });

            setStatus({ type: 'success', msg: 'Ready to chat!' });

            if (onUploadSuccess) {
                onUploadSuccess({
                    filename: file.name,
                    type: file.name.split('.').pop().toLowerCase(),
                    url: URL.createObjectURL(file),
                    summary: response.data.summary,
                });
            }

        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', msg: 'Upload failed. Ensure backend is running.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            className={`relative group bg-slate-800/40 backdrop-blur-sm p-8 rounded-2xl border-2 transition-all duration-300 ${dragActive
                    ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                    : 'border-white/5 hover:border-white/10 hover:bg-slate-800/60'
                }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className={`p-4 rounded-full bg-slate-700/50 mb-2 transition-transform duration-300 group-hover:scale-110 ${dragActive ? 'bg-blue-500/20' : ''}`}>
                    {file ? (
                        <FileIcon size={32} className="text-blue-400" />
                    ) : (
                        <UploadCloud size={32} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-200">
                        {file ? file.name : "Upload Document or Media"}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {file ? (
                            <span className="text-blue-400 font-medium">File selected</span>
                        ) : (
                            "Drag & drop or Click to Browse"
                        )}
                    </p>
                </div>

                <div className="flex gap-3 mt-4 w-full max-w-xs">
                    {!file ? (
                        <label
                            htmlFor="file-upload"
                            className="flex-1 cursor-pointer py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors text-center border border-white/5 hover:border-white/20"
                        >
                            Choose File
                        </label>
                    ) : (
                        <button
                            onClick={() => setFile(null)}
                            disabled={uploading}
                            className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-white/5"
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                        {uploading ? 'Processing...' : 'Upload Now'}
                    </button>
                </div>

                {status.msg && (
                    <div className={`mt-4 flex items-center text-sm font-medium animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {status.type === 'success' ? <CheckCircle size={16} className="mr-2" /> : <AlertCircle size={16} className="mr-2" />}
                        {status.msg}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FileUploader;
