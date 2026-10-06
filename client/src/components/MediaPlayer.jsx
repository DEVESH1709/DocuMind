import React, { useRef, useEffect } from 'react';

function MediaPlayer({ url, seekCommand }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (seekCommand && videoRef.current) {
            console.log(`🎥 Seek to: ${seekCommand.time}s`);

            videoRef.current.currentTime = seekCommand.time;

            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Auto-play prevented:", error);
                });
            }
        }
    }, [seekCommand]);

    if (!url) return null;

    return (
        <div className="w-full bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
            <video
                ref={videoRef}
                key={url} 
                src={url}
                controls
                className="w-full h-auto max-h-[380px] object-contain mx-auto"
                style={{ display: 'block' }}
            >
                <p className="text-white p-4 text-center">
                    Your browser does not support the video tag.
                </p>
            </video>
        </div>
    );
}

export default MediaPlayer;
