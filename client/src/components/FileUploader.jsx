import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Music, Video, File, Loader2, X, Plus, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';

const MAX_FILE_SIZE_MB = 100;
const ALLOWED_EXTENSIONS = ['.pdf', '.mp3', '.wav', '.mp4', '.m4a', '.txt'];

function FileUploader({ token, onUploadSuccess }) {
    const { success, error, warning } = useToast();
    const [stagedFiles, setStagedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'indexing'
    const [dragActive, setDragActive] = useState(false);

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const validateAndAddFiles = (incomingFiles) => {
        const valid = [];
        for (const file of incomingFiles) {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                warning(`"${file.name}" has an unsupported format. Supported: ${ALLOWED_EXTENSIONS.join(', ')}`, 'Unsupported File');
                continue;
            }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                warning(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit (${formatFileSize(file.size)}).`, 'File Too Large');
                continue;
            }
            // Avoid duplicates
            if (!stagedFiles.some(f => f.name === file.name && f.size === file.size)) {
                valid.push(file);
            }
        }
        if (valid.length > 0) {
            setStagedFiles(prev => [...prev, ...valid]);
        }
    };

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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndAddFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndAddFiles(Array.from(e.target.files));
            e.target.value = ''; // Reset input to allow re-uploading same file if deleted
        }
    };

    const removeStagedFile = (index) => {
        setStagedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (ext === 'pdf') return <FileText size={18} className="text-red-500" />;
        if (['mp3', 'wav', 'm4a'].includes(ext)) return <Music size={18} className="text-blue-500" />;
        if (['mp4', 'mov', 'webm'].includes(ext)) return <Video size={18} className="text-indigo-500" />;
        return <File size={18} className="text-slate-400" />;
    };

    const handleUpload = async () => {
        if (stagedFiles.length === 0) return;
        setUploading(true);
        setUploadProgress(0);
        setUploadStage('uploading');

        const formData = new FormData();
        stagedFiles.forEach(f => {
            formData.append('files', f);
        });

        // Detect if any multimedia files require speech transcription
        const hasMedia = stagedFiles.some(f => /\.(mp4|mp3|wav|m4a)$/i.test(f.name));

        try {
            const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: token
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
                    setUploadProgress(percentCompleted);
                    if (percentCompleted >= 100) {
                        setUploadStage(hasMedia ? 'processing' : 'indexing');
                    }
                }
            });

            success(`Successfully uploaded and indexed ${stagedFiles.length} file(s)!`, 'Upload Complete');

            if (onUploadSuccess) {
                const augmented = (response.data.files || []).map(rf => {
                    const localFile = stagedFiles.find(f => f.name === rf.filename);
                    const localBlobUrl = localFile ? URL.createObjectURL(localFile) : null;
                    return {
                        ...rf,
                        url: rf.media_url || localBlobUrl,
                        media_url: rf.media_url || localBlobUrl
                    };
                });
                onUploadSuccess(augmented);
            }
            setStagedFiles([]);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || 'Upload failed. Ensure the backend server is running.';
            error(msg, 'Upload Failed');
        } finally {
            setUploading(false);
            setUploadStage('idle');
            setUploadProgress(0);
        }
    };

    return (
        <div className="p-5 sm:p-6 rounded-3xl border-shining-dark-blue relative overflow-hidden" style={{ background: '#0f1624' }}>
            {/* Header info */}
            <div className="flex items-center justify-between mb-3.5">
                <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#f0f4ff] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Upload Knowledge Base</h3>
                    <p className="text-xs text-[#8899bb] mt-0.5">Supports PDF documents, audio recordings, and video files (Max {MAX_FILE_SIZE_MB}MB)</p>
                </div>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border border-blue-500/30 text-blue-400" style={{ background: 'rgba(37,99,235,0.1)' }}>
                    Whisper & LPU Powered
                </span>
            </div>

            {/* Drop Zone */}
            <div
                className={`relative group p-5 sm:p-7 rounded-2xl border-2 border-dashed transition-all duration-300 text-center ${
                    dragActive
                        ? 'border-blue-500 bg-blue-900/20 scale-[1.005] shadow-[0_0_25px_rgba(37,99,235,0.35)]'
                        : 'border-blue-900/40 hover:border-blue-600/60 hover:bg-blue-900/10 hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                }`}
                style={dragActive ? {} : { background: 'rgba(8,12,20,0.6)' }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    accept=".pdf,.mp3,.wav,.mp4,.m4a,.txt"
                    onChange={handleFileChange}
                    disabled={uploading}
                />

                <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm border border-blue-500/30 shadow-[0_0_12px_rgba(37,99,235,0.2)] ${dragActive ? 'bg-blue-600 text-white' : 'text-blue-400'}`} style={dragActive ? {} : { background: 'rgba(37,99,235,0.15)' }}>
                        <UploadCloud size={24} />
                    </div>

                    <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-semibold text-[#f0f4ff]">
                            Drag & drop files here, or{' '}
                            <label htmlFor="file-upload" className="text-blue-400 hover:text-blue-300 underline cursor-pointer font-bold">
                                browse computer
                            </label>
                        </p>
                        <p className="text-[11px] sm:text-xs text-[#8899bb]">
                            PDF, MP3, WAV, MP4, M4A up to {MAX_FILE_SIZE_MB}MB each
                        </p>
                    </div>
                </div>
            </div>

            {/* Staged Files Preview List */}
            {stagedFiles.length > 0 && (
                <div className="mt-4 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between text-xs font-bold text-[#8899bb] px-1">
                        <span>Selected Files ({stagedFiles.length})</span>
                        <label htmlFor="file-upload" className="text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1 font-semibold text-xs">
                            <Plus size={12} /> Add More
                        </label>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 no-scrollbar pr-1">
                        {stagedFiles.map((file, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 rounded-2xl border border-blue-900/30 hover:border-blue-600/50 transition-colors"
                                style={{ background: 'rgba(22,31,51,0.6)' }}
                            >
                                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                                    <div className="p-1.5 rounded-xl border border-blue-900/40 shrink-0" style={{ background: 'rgba(8,12,20,0.8)' }}>
                                        {getFileIcon(file.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm font-bold text-[#f0f4ff] truncate" title={file.name}>
                                            {file.name}
                                        </p>
                                        <p className="text-[11px] text-[#8899bb] font-medium">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>

                                {!uploading && (
                                    <button
                                        type="button"
                                        onClick={() => removeStagedFile(idx)}
                                        className="p-1 text-[#8899bb] hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                        title="Remove file"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Multi-Stage Upload Progress Bar */}
                    {uploading && (
                        <div className="p-3.5 rounded-2xl border border-blue-500/30 space-y-2 animate-in fade-in duration-200" style={{ background: 'rgba(37,99,235,0.1)' }}>
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="flex items-center gap-2 text-blue-300">
                                    <Loader2 size={13} className="animate-spin" />
                                    {uploadStage === 'uploading' && `Uploading to server (${uploadProgress}%)...`}
                                    {uploadStage === 'processing' && 'Whisper transcription processing...'}
                                    {uploadStage === 'indexing' && 'Vector indexing...'}
                                </span>
                                <span className="text-blue-400 font-mono text-xs">{uploadProgress}%</span>
                            </div>

                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(8,12,20,0.8)' }}>
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 rounded-full"
                                    style={{ width: `${uploadProgress}%`, boxShadow: '0 0 10px rgba(59,130,246,0.5)' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!uploading && (
                        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setStagedFiles([])}
                                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#8899bb] hover:text-[#f0f4ff] hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                Clear All
                            </button>
                            <button
                                type="button"
                                onClick={handleUpload}
                                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 border border-blue-500/50 active:scale-95 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
                            >
                                <Sparkles size={14} className="text-blue-200" />
                                <span>Upload & Process ({stagedFiles.length})</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default FileUploader;




