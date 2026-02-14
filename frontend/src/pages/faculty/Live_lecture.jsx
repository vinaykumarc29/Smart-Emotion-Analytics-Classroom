import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, ExternalLink, Users, 
  Activity, Brain, Wifi, WifiOff, ChevronDown, ChevronRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';

const LiveLecture = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();

  // --- Auth Helper ---
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });
  
  // APIs
  const FACULTY_GROUPS_URL = 'http://localhost:5000/api/faculty/groups';
  const LECTURES_URL = 'http://localhost:5000/api/faculty/lectures';
  
  // --- Core State ---
  // If URL has an ID, use it. Otherwise null.
  const [activeGroupId, setActiveGroupId] = useState(groupId ? parseInt(groupId.replace(':', '')) : null);
  const [activeGroupName, setActiveGroupName] = useState("Loading...");
  
  // --- Data State ---
  const [myGroups, setMyGroups] = useState([]); // List of faculty's groups
  const [scheduledLectures, setScheduledLectures] = useState([]); // Lectures for selected group
  
  // --- UI State ---
  const [showGroupSelector, setShowGroupSelector] = useState(!groupId); // Show selector if no ID in URL
  const [showStartModal, setShowStartModal] = useState(false);
  const [instantTopic, setInstantTopic] = useState("");

  // --- Session State ---
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isConnected, setIsConnected] = useState(true); 
  const [lectureId, setLectureId] = useState(null);
  const [topic, setTopic] = useState("Ready to Start");
  
  // --- Live Metrics State ---
  const [studentCount, setStudentCount] = useState(0);
  const [engagementScore, setEngagementScore] = useState(0);
  const [students, setStudents] = useState([]);
  const [moodData, setMoodData] = useState([
    { name: 'Focused', value: 0, color: '#10B981' }, 
    { name: 'Confused', value: 0, color: '#F59E0B' }, 
    { name: 'Bored', value: 0, color: '#94A3B8' },   
    { name: 'Distracted', value: 0, color: '#EF4444' }, 
  ]);


  // ================= EFFECTS =================

  // 1. Fetch ALL Faculty Groups on Load
  useEffect(() => {
    const fetchGroups = async () => {
        try {
            const res = await fetch(`${FACULTY_GROUPS_URL}/`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setMyGroups(data.groups);
                
                // If we have an active ID, find the name
                if (activeGroupId) {
                    const current = data.groups.find(g => g.id === activeGroupId);
                    if (current) setActiveGroupName(current.name);
                }
            }
        } catch (error) {
            console.error("Failed to fetch groups", error);
        }
    };
    fetchGroups();
  }, [activeGroupId]);

  // 2. Fetch Scheduled Lectures whenever Active Group Changes
  // 1. Fetch Group Data & Check for EXISTING Live Session
  
    // REPLACES the first useEffect
  useEffect(() => {
    if (!activeGroupId) return;

    const initPage = async () => {
        try {
            // 1. Fetch Scheduled
            const schedRes = await fetch(`${LECTURES_URL}/group/${activeGroupId}`, { headers: getAuthHeaders() });
            if (schedRes.ok) {
                const data = await schedRes.json();
                setScheduledLectures(data.scheduled_lectures);
            }

            // 2. CHECK FOR CRASH RECOVERY (Fixing the Refresh Bug)
            const liveRes = await fetch(`${LECTURES_URL}/group/${activeGroupId}/current`, { headers: getAuthHeaders() });
            if (liveRes.ok) {
                const liveData = await liveRes.json();
                if (liveData.active) {
                    // RESTORE STATE!
                    setLectureId(liveData.lecture_id);
                    setTopic(liveData.topic);
                    setIsActive(true);
                    setIsConnected(true);
                    // Calculate elapsed time for the timer
                    const startTime = new Date(liveData.start_time);
                    const now = new Date();
                    const elapsedSeconds = Math.floor((now - startTime) / 1000);
                    setTimer(elapsedSeconds);
                }
            }
        } catch (error) {
            console.error("Initialization error:", error);
        }
    };
    initPage();
  }, [activeGroupId]);
  // 3. Timer Logic
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // 4. REAL Live Data Polling Logic
  useEffect(() => {
    if (!isActive || !lectureId) return;

    const fetchLiveStats = async () => {
        try {
            const res = await fetch(`${LECTURES_URL}/${lectureId}/live_status`, {
                headers: getAuthHeaders()
            });
            
            if (res.ok) {
                const data = await res.json();
                setStudents(data.students);
                setStudentCount(data.total_active);
                setEngagementScore(data.engagement_score);
                setMoodData([
                    { name: 'Focused', value: data.mood_distribution.Focused || 0, color: '#10B981' },
                    { name: 'Confused', value: data.mood_distribution.Confused || 0, color: '#F59E0B' },
                    { name: 'Bored', value: data.mood_distribution.Bored || 0, color: '#94A3B8' },
                    { name: 'Distracted', value: data.mood_distribution.Distracted || 0, color: '#EF4444' },
                ]);
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        } catch (error) {
            setIsConnected(false);
        }
    };

    fetchLiveStats();
    const dataInterval = setInterval(fetchLiveStats, 3000); // here to change the time of live stats
    return () => clearInterval(dataInterval);
  }, [isActive, lectureId]);


  // ================= HANDLERS =================

  // Select a Group from the Modal
  const handleGroupSelect = (group) => {
      setActiveGroupId(group.id);
      setActiveGroupName(group.name);
      setShowGroupSelector(false);
      // Reset session state when switching groups
      setIsActive(false);
      setLectureId(null);
      setTopic("Ready to Start");
      setTimer(0);
  };

  // Start Instant Lecture
  const handleInstantStart = async () => {
      if (!instantTopic.trim()) return alert("Please enter a topic");
      
      try {
          const res = await fetch(`${LECTURES_URL}/start_instant`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ group_id: activeGroupId, topic: instantTopic })
          });
          
          const data = await res.json();
          if (res.ok) {
              setLectureId(data.lecture_id);
              setTopic(instantTopic);
              setIsActive(true);
              setIsConnected(true);
              setShowStartModal(false); 
          } else {
              alert(data.error || "Failed to start lecture");
          }
      } catch (error) { console.error(error); }
  };

  // Start Scheduled Lecture
  const handleScheduledStart = async (selectedLectureId, selectedTopic) => {
      try {
          const res = await fetch(`${LECTURES_URL}/${selectedLectureId}/start`, {
              method: 'POST',
              headers: getAuthHeaders()
          });
          const data = await res.json();
          if (res.ok) {
              setLectureId(selectedLectureId);
              setTopic(selectedTopic);
              setIsActive(true);
              setIsConnected(true);
              setShowStartModal(false); 
          } else alert(data.error);
      } catch (error) { console.error(error); }
  };

  // End Session
  const handleEndSession = async () => {
      if (!window.confirm("Are you sure you want to end this live session?")) return;

      try {
          await fetch(`${LECTURES_URL}/${lectureId}/end`, {
              method: 'POST',
              headers: getAuthHeaders()
          });
          
          setIsActive(false);
          setTimer(0);
          navigate('/faculty/dashboard'); 
      } catch (error) {
          console.error("Error ending lecture:", error);
      }
  };


  // --- Helper Functions ---
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDominantMood = () => {
      const total = moodData.reduce((acc, curr) => acc + curr.value, 0);
      if (total === 0) return { name: "Waiting...", value: 0 };
      const dominant = moodData.reduce((prev, current) => (prev.value > current.value) ? prev : current);
      return { name: dominant.name, value: Math.round((dominant.value / total) * 100) };
  };

  const StatCard = ({ icon: Icon, label, value, subtext, colorClass, bgClass }) => (
    <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${bgClass} ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 font-serif">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col xl:flex-row h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans relative">
      
      {/* --- LEFT PANEL --- */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto scrollbar-hide">
        
        {/* Header with Group Switcher */}
        <div className="flex justify-between items-center shrink-0">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 font-serif tracking-tight">Live Command Center</h1>
                <div 
                    onClick={() => !isActive && setShowGroupSelector(true)}
                    className={`flex items-center gap-2 text-sm mt-1 ${isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-blue-600 transition-colors'}`}
                >
                    <span className="font-bold text-gray-500 uppercase tracking-wider">Class:</span>
                    <span className="font-bold text-[#1B3B6F] flex items-center gap-1">
                        {activeGroupName} 
                        {!isActive && <ChevronDown className="w-4 h-4" />}
                    </span>
                </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isConnected ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span className="text-xs font-bold">{isConnected ? 'System Online' : 'Reconnecting...'}</span>
            </div>
        </div>

        {/* Hero Section */}
        <div className={`relative rounded-2xl p-8 overflow-hidden shadow-sm transition-all duration-500 border border-gray-200 bg-white shrink-0`}>
            {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 animate-pulse"></div>}
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left space-y-2">
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                        {isActive ? (
                             <span className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 border border-red-200 text-xs font-bold uppercase rounded-md shadow-sm">
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> Live Session
                             </span>
                        ) : (
                             <span className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold uppercase rounded-md">
                                Session Paused
                             </span>
                        )}
                        <span className="text-gray-400 text-xs font-mono font-bold uppercase tracking-wider">ID: {lectureId || '---'}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight leading-tight">{topic}</h2>
                </div>

                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-5xl md:text-6xl font-mono font-bold text-[#1B3B6F] tabular-nums tracking-tighter leading-none py-1">
                        {formatTime(timer)}
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Duration</p>
                </div>
            </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
            <StatCard 
                icon={Users} 
                label="Students Connected" 
                value={studentCount} 
                subtext={isActive ? "Live camera feeds" : "Waiting..."}
                colorClass="text-blue-600" 
                bgClass="bg-blue-100"
            />
            <StatCard 
                icon={Brain} 
                label="Overall Engagement" 
                value={`${engagementScore}%`} 
                subtext="Based on facial analysis"
                colorClass={engagementScore > 70 ? "text-emerald-600" : engagementScore > 50 ? "text-amber-600" : "text-red-600"} 
                bgClass={engagementScore > 70 ? "bg-emerald-100" : engagementScore > 50 ? "bg-amber-100" : "bg-red-100"} 
            />
        </div>

        {/* Live Student Table */}
        <div className="bg-white border border-gray-200 rounded-xl p-0 shadow-sm flex-1 min-h-[300px] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#1B3B6F]" /> Live Student Emotion Monitor
                 </h3>
            </div>
            <div className="overflow-y-auto flex-1 p-0">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll No</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Current Emotion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {students.map((student, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-3 font-bold text-gray-900 text-sm">{student.name}</td>
                                <td className="px-6 py-3 text-sm text-gray-500 font-mono">{student.rollNo}</td>
                                <td className="px-6 py-3 text-right">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-gray-50 text-gray-700">
                                        {student.emotion}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && isActive && (
                            <tr><td colSpan="3" className="text-center py-10 text-gray-500 italic">Waiting for students...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* --- RIGHT PANEL --- */}
      <div className="w-full xl:w-[400px] bg-white border-l border-gray-200 flex flex-col p-6 gap-6 overflow-y-auto z-10 shadow-lg shrink-0">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex-1 flex flex-col min-h-[320px]">
            <h3 className="text-center text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Real-time Emotion Distribution</h3>
            <div className="flex-1 w-full relative min-h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={moodData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                            {moodData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-900 font-serif">{getDominantMood().value}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{getDominantMood().name}</span>
                </div>
            </div>
            {/* --- LEGEND SECTION --- */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 pt-4 border-t border-gray-50">
                {moodData.map((item) => {
                    // Auto-calculate percentage for the UI
                    const total = moodData.reduce((acc, curr) => acc + curr.value, 0);
                    const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    
                    return (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                {/* Colored Dot */}
                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                <span className="text-gray-600 font-bold tracking-wide">{item.name}</span>
                            </div>
                            {/* Percentage Value */}
                            <span className="font-mono font-bold text-gray-400">{percentage}%</span>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="mt-auto space-y-3 pb-2">
            <div className="grid grid-cols-2 gap-3">
                {!isActive ? (
                    <button 
                        onClick={() => setShowStartModal(true)} 
                        className="col-span-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Play className="w-4 h-4 fill-current" /> START SESSION
                    </button>
                ) : (
                    <>
                        <button className="py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-not-allowed opacity-50">
                            <Pause className="w-4 h-4 fill-current" /> PAUSE
                        </button>
                        <button onClick={handleEndSession} className="py-3 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                            <Square className="w-4 h-4 fill-current" /> END
                        </button>
                    </>
                )}
            </div>
            <button onClick={() => window.open('https://meet.google.com/new', '_blank')} className="w-full py-3 bg-[#2C4C88] hover:bg-[#1B3B6F] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md group border border-blue-800">
                Open Google Meet <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
        </div>
      </div>

      {/* --- MODAL 1: GROUP SELECTOR --- */}
      {showGroupSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-gray-100 text-center bg-gray-50">
                    <h2 className="text-2xl font-serif font-bold text-[#1B3B6F] mb-2">Select a Class</h2>
                    <p className="text-gray-500 text-sm">Choose the group you want to start a live session for.</p>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                    {myGroups.map(group => (
                        <button 
                            key={group.id} 
                            onClick={() => handleGroupSelect(group)}
                            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{group.name}</h3>
                                <p className="text-xs text-gray-400 font-mono mt-1">CODE: {group.join_code}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                        </button>
                    ))}
                    {myGroups.length === 0 && <p className="text-center text-gray-400 py-4">No groups found. Create one in the dashboard!</p>}
                </div>
                <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                    <button onClick={() => navigate('/faculty/dashboard')} className="text-sm text-gray-500 hover:text-gray-900 font-bold">Back to Dashboard</button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL 2: START SESSION --- */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-6 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Start Live Session</h2>
                
                {/* Pre-Scheduled */}
                {scheduledLectures.length > 0 && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase">Pre-Scheduled Lectures</label>
                        {scheduledLectures.map(lec => (
                            <div key={lec.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div>
                                    <p className="font-bold text-sm text-[#1B3B6F]">{lec.topic}</p>
                                    <p className="text-xs text-gray-500">{lec.scheduled_start}</p>
                                </div>
                                <button 
                                    onClick={() => handleScheduledStart(lec.id, lec.topic)}
                                    className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded shadow hover:bg-emerald-700"
                                >
                                    Start This
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {scheduledLectures.length > 0 && <div className="text-center text-xs font-bold text-gray-400 uppercase">OR</div>}

                {/* Instant Start */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase">Start Instant Lecture</label>
                    <input 
                        type="text" 
                        placeholder="Enter new topic name..." 
                        value={instantTopic}
                        onChange={(e) => setInstantTopic(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#1B3B6F]"
                    />
                    <button onClick={handleInstantStart} className="w-full py-2 bg-[#2C4C88] text-white font-bold rounded-lg hover:bg-[#1B3B6F]">Go Live Instantly</button>
                </div>
                <button onClick={() => setShowStartModal(false)} className="w-full py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default LiveLecture;