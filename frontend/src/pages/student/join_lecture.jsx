import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Video, Wifi, Play, LogOut, Activity, Radio } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const StudentLiveLecture = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  
  // --- Auth Headers ---
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  // --- State ---
  const [hasPermission, setHasPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Waiting to join...");
  const [lastEmotion, setLastEmotion] = useState("Initializing...");
  const [captureCount, setCaptureCount] = useState(0);
  
  // --- Refs ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTracking();
  }, []);

  // --- Attach Stream when Permission is Granted ---
  useEffect(() => {
    if (hasPermission && streamRef.current && videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.error("Play error:", e));
        startSilentTracking();
    }
  }, [hasPermission]);

  // 1. Initialize Camera (Request Access ONLY)
  const initializeSession = async () => {
    setStatusMessage("Requesting camera access...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 }, 
        audio: false 
      });
      
      streamRef.current = stream;
      setHasPermission(true);
      
    } catch (err) {
      console.error("Camera permission denied:", err);
      setStatusMessage("Camera access denied.");
      alert("Please allow camera access to join the class session.");
    }
  };

  // 2. Start Sending Data
  const startSilentTracking = () => {
    setIsTracking(true);
    setStatusMessage("Connected. Analyzing engagement...");
    
    // Capture frame every 5 seconds
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(captureFrame, 5000);
  };

  // 3. Stop Everything
  const stopTracking = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsTracking(false);
  };

  // 4. Capture & Send to Backend (WITH AUTO-STOP)
  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      const imageSrc = canvasRef.current.toDataURL('image/jpeg', 0.7);

      try {
        const res = await fetch(`http://localhost:5000/api/student/lectures/${lectureId}/log_emotion`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ image: imageSrc })
        });

        // ✅ CASE 1: Success (Class is Live)
        if (res.ok) {
            const data = await res.json();
            setLastEmotion(data.emotion);
            setCaptureCount(prev => prev + 1);
        } 
        // ✅ CASE 2: Class Ended (400 Error)
        else if (res.status === 400) {
            const data = await res.json();
            // Check specifically if the backend says the lecture isn't live
            if (data.error === "Lecture is not currently live.") {
                stopTracking(); // Cut the camera immediately
                alert("Class Dismissed: The faculty has ended this session.");
                navigate('/student/dashboard'); // Send them home
            }
        }
      } catch (err) {
        console.error("Failed to log emotion", err);
      }
    }
  };

  const handleLeave = () => {
      stopTracking();
      navigate('/student/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 font-sans">
      <canvas ref={canvasRef} width="320" height="240" className="hidden" />

      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600 w-full"></div>
        
        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-500 ${isTracking ? 'bg-green-50' : 'bg-blue-50'}`}>
            {isTracking ? (
                <Radio className="w-8 h-8 text-green-600 animate-pulse" />
            ) : (
                <Video className="w-8 h-8 text-blue-600" />
            )}
          </div>

          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Live Class Session</h1>
          <p className="text-gray-500 font-medium">Lecture ID: {lectureId}</p>

          <div className="my-8 space-y-4">
             <div className={`
                flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300
                ${isTracking ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}
             `}>
                <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {isTracking && <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>}
                </div>
                <div className="text-left">
                    <p className={`text-sm font-bold ${isTracking ? 'text-green-800' : 'text-gray-600'}`}>
                        {isTracking ? "Analytics Active" : statusMessage}
                    </p>
                    <p className="text-xs text-gray-500">
                        {isTracking ? `Sent ${captureCount} data points.` : "Enable camera to proceed."}
                    </p>
                </div>
             </div>
          </div>

          {!hasPermission ? (
            <button 
                onClick={initializeSession}
                className="w-full py-4 bg-[#2C4C88] hover:bg-[#1B3B6F] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
            >
                <Play className="w-5 h-5 fill-current" />
                Join Class
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner bg-black aspect-video">
                    <video 
                        ref={videoRef} 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover transform scale-x-[-1]" 
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                        LIVE FEED
                    </div>
                </div>

                {/* <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <span className="text-xs font-bold text-gray-500 uppercase">Your Status</span>
                    <span className="text-sm font-bold text-[#1B3B6F] flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {lastEmotion}
                    </span>
                </div> */}

                <button 
                    onClick={handleLeave}
                    className="w-full py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Leave Class
                </button>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-400 max-w-xs mx-auto">
             * Camera is used for real-time engagement scoring only.
          </p>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-start gap-3">
             <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
             <p className="text-xs text-left text-gray-500 leading-relaxed">
                <span className="font-bold text-gray-700">Privacy Safe:</span> No video is stored. We only analyze facial expressions to calculate class engagement metrics.
             </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLiveLecture;