import React, { useState, useEffect } from 'react';
import { 
    BookOpen, Plus, LogOut, Video, Wifi 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Auth Headers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const API_BASE_URL = 'http://localhost:5000/api/student/groups';

  // 1. Fetch Enrolled Groups (and check for LIVE classes)
  const fetchGroups = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/`, { headers: getAuthHeaders() });
          if (res.ok) {
              const data = await res.json();
              setGroups(data.enrolled_groups);
          }
      } catch (error) {
          console.error("Failed to fetch groups", error);
      }
  };

  useEffect(() => {
      fetchGroups();
      // Poll every 5 seconds to check if a class has started!
      const interval = setInterval(fetchGroups, 5000);
      return () => clearInterval(interval);
  }, []);

  // 2. Join a New Group
  const handleJoinGroup = async () => {
      if (!joinCode.trim()) return alert("Please enter a code");
      try {
          const res = await fetch(`${API_BASE_URL}/join`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ join_code: joinCode })
          });
          const data = await res.json();
          if (res.ok) {
              alert("Joined successfully!");
              setJoinCode("");
              setShowJoinModal(false);
              fetchGroups();
          } else {
              alert(data.error);
          }
      } catch (error) { console.error(error); }
  };

  // 3. Leave a Group
  const handleLeaveGroup = async (groupId) => {
      if(!window.confirm("Are you sure you want to leave this group?")) return;
      try {
          const res = await fetch(`${API_BASE_URL}/${groupId}/leave`, {
              method: 'DELETE',
              headers: getAuthHeaders()
          });
          if (res.ok) fetchGroups();
      } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-10">
            <div>
                <h1 className="text-4xl font-serif font-bold text-[#1B3B6F]">My Classroom</h1>
                <p className="text-gray-500 mt-1">Track your attendance and join live sessions.</p>
            </div>
            <button 
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-3 bg-[#2C4C88] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#1B3B6F] shadow-lg shadow-blue-900/10 transition-all active:scale-95"
            >
                <Plus className="w-5 h-5" /> Join New Class
            </button>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
                <div key={group.id} className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-lg relative overflow-hidden ${group.live_lecture_id ? 'border-red-200 shadow-red-100 ring-4 ring-red-50' : 'border-gray-200 shadow-sm'}`}>
                    
                    {/* LIVE BADGE */}
                    {group.live_lecture_id && (
                        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 animate-pulse">
                            <Wifi className="w-3 h-3" /> LIVE NOW
                        </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${group.live_lecture_id ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            <BookOpen className="w-8 h-8" />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h3>
                    <p className="text-xs text-gray-400 font-mono uppercase tracking-wider mb-6">Faculty ID: {group.faculty_id}</p>

                    <div className="flex gap-3">
                        {group.live_lecture_id ? (
                            <button 
                                onClick={() => navigate(`/student/live/${group.live_lecture_id}`)}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
                            >
                                <Video className="w-4 h-4" /> JOIN CLASS
                            </button>
                        ) : (
                            <button disabled className="flex-1 py-2.5 bg-gray-100 text-gray-400 rounded-lg font-bold text-sm cursor-not-allowed">
                                No Active Session
                            </button>
                        )}
                        
                        <button 
                            onClick={() => handleLeaveGroup(group.id)}
                            className="p-2.5 border border-gray-200 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
                            title="Leave Group"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}

            {groups.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p>You haven't joined any classes yet.</p>
                </div>
            )}
        </div>
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-gray-900">Join a Class</h2>
                <p className="text-sm text-gray-500">Enter the 6-character code provided by your faculty.</p>
                
                <input 
                    type="text" 
                    placeholder="e.g. A1B2C3"
                    className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest uppercase border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none"
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                />

                <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowJoinModal(false)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-lg">Cancel</button>
                    <button onClick={handleJoinGroup} className="flex-1 py-2 bg-[#2C4C88] text-white font-bold rounded-lg hover:bg-[#1B3B6F]">Join</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;