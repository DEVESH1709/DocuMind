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
        <div className="w-full max-w-4xl mx-auto bg-black rounded-xl overflow-hidden shadow-2xl mt-6 border border-white/10">
           
            <video
                ref={videoRef}
                key={url} 
                src={url}
                controls
                className="w-full h-auto max-h-[600px] object-contain"
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
