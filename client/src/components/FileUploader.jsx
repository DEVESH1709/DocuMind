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
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            {/* Header info */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Upload Knowledge Base</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Supports PDF documents, audio recordings, and video files (Max {MAX_FILE_SIZE_MB}MB)</p>
                </div>
                <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider border border-blue-100">
                    Whisper & LPU Powered
                </span>
            </div>

            {/* Drop Zone */}
            <div
                className={`relative group p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-300 text-center ${
                    dragActive
                        ? 'border-blue-500 bg-blue-50/70 scale-[1.005]'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
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
                    multiple
                    accept=".pdf,.mp3,.wav,.mp4,.m4a,.txt"
                    onChange={handleFileChange}
                    disabled={uploading}
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className={`p-4 rounded-2xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110 shadow-sm ${dragActive ? 'bg-blue-600 text-white' : ''}`}>
                        <UploadCloud size={28} />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800">
                            Drag & drop files here, or{' '}
                            <label htmlFor="file-upload" className="text-blue-600 hover:text-blue-700 underline cursor-pointer font-bold">
                                browse computer
                            </label>
                        </p>
                        <p className="text-[11px] text-slate-400">
                            PDF, MP3, WAV, MP4, M4A up to {MAX_FILE_SIZE_MB}MB each
                        </p>
                    </div>
                </div>
            </div>

            {/* Staged Files Preview List */}
            {stagedFiles.length > 0 && (
                <div className="mt-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                        <span>Selected Files ({stagedFiles.length})</span>
                        <label htmlFor="file-upload" className="text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 font-semibold">
                            <Plus size={13} /> Add More
                        </label>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 no-scrollbar pr-1">
                        {stagedFiles.map((file, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0 pr-3">
                                    <div className="p-2 rounded-xl bg-white border border-slate-100 shrink-0">
                                        {getFileIcon(file.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                                            {file.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>

                                {!uploading && (
                                    <button
                                        type="button"
                                        onClick={() => removeStagedFile(idx)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white transition-colors cursor-pointer"
                                        title="Remove file"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Multi-Stage Upload Progress Bar */}
                    {uploading && (
                        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2.5 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="flex items-center gap-2 text-blue-700">
                                    <Loader2 size={14} className="animate-spin" />
                                    {uploadStage === 'uploading' && `Uploading to server (${uploadProgress}%)...`}
                                    {uploadStage === 'processing' && 'Whisper transcription & speech processing in progress...'}
                                    {uploadStage === 'indexing' && 'Vector indexing & summary generation...'}
                                </span>
                                <span className="text-blue-600 font-mono">{uploadProgress}%</span>
                            </div>

                            <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>

                            <p className="text-[11px] text-slate-500">
                                Large audio/video files are transcribed locally using Whisper STT. Please keep this tab open.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!uploading && (
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setStagedFiles([])}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Clear All
                            </button>
                            <button
                                type="button"
                                onClick={handleUpload}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
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

