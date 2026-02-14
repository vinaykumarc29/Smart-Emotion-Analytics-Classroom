import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, BookOpen, ChevronDown } from 'lucide-react';

const FacultySchedule = () => {
  // State for Groups
  const [groups, setGroups] = useState([]);
  
  // Refs for triggering the date/time pickers programmatically
  const dateInputRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  // Form State
  const [lectureName, setLectureName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [lectureDate, setLectureDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auth Headers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    const fetchGroups = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/faculty/groups/', {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (res.ok) setGroups(data.groups);
        } catch (error) {
            console.error("Failed to load groups", error);
        }
    };
    fetchGroups();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!lectureName || !selectedGroupId || !lectureDate || !startTime || !endTime) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    const startDateTime = `${lectureDate} ${startTime}:00`;
    const endDateTime = `${lectureDate} ${endTime}:00`;

    try {
        const res = await fetch('http://localhost:5000/api/faculty/lectures/create', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                group_id: selectedGroupId,
                topic: lectureName,
                scheduled_start: startDateTime,
                scheduled_end: endDateTime
            })
        });

        const data = await res.json();
        if (res.ok) {
            alert("Lecture scheduled successfully!");
            setLectureName('');
            setSelectedGroupId('');
            setLectureDate('');
            setStartTime('');
            setEndTime('');
        } else {
            alert(data.error || "Failed to schedule lecture");
        }
    } catch (error) {
        console.error("Error scheduling lecture:", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      
      {/* 🟢 CSS Trick to hide browser native icons so yours show perfectly */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          display: none;
        }
      `}</style>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-[#1B3B6F] mb-2">Schedule a Lecture</h1>
          <p className="text-gray-400 font-serif italic">Plan your upcoming academic sessions</p>
        </div>

        <form onSubmit={handleSchedule} className="space-y-6 max-w-3xl mx-auto">
          
          {/* Lecture Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lecture Topic</label>
            <div className="relative">
                <input 
                    type="text" 
                    required
                    value={lectureName}
                    onChange={(e) => setLectureName(e.target.value)}
                    placeholder="e.g. Introduction to Data Structures"
                    className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-4 focus:ring-[#1B3B6F]/5 outline-none text-gray-700 transition-all"
                />
                <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Group Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Group</label>
            <div className="relative">
                <select 
                    required
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 bg-white focus:border-[#1B3B6F] outline-none appearance-none text-gray-700 transition-all cursor-pointer"
                >
                    <option value="">Choose a class group...</option>
                    {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lecture Date</label>
            <div className="relative cursor-pointer" onClick={() => dateInputRef.current?.showPicker()}>
                <input 
                    ref={dateInputRef}
                    type="date" 
                    required
                    value={lectureDate}
                    onChange={(e) => setLectureDate(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] outline-none text-gray-700 transition-all cursor-pointer"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Time Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Time</label>
                <div className="relative cursor-pointer" onClick={() => startTimeRef.current?.showPicker()}>
                    <input 
                      ref={startTimeRef}
                      type="time" 
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] outline-none text-gray-700 transition-all cursor-pointer" 
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Time</label>
                <div className="relative cursor-pointer" onClick={() => endTimeRef.current?.showPicker()}>
                    <input 
                      ref={endTimeRef}
                      type="time" 
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] outline-none text-gray-700 transition-all cursor-pointer" 
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-6">
             <button 
                type="submit" 
                disabled={isLoading}
                className="px-10 py-3 bg-[#2C4C88] text-white font-bold rounded-lg shadow-lg shadow-blue-900/10 hover:bg-[#1B3B6F] transition-all disabled:opacity-50"
             >
                {isLoading ? 'Scheduling...' : 'Schedule Lecture'}
             </button>
             <button 
                type="button" 
                onClick={() => {
                  setLectureName('');
                  setSelectedGroupId('');
                  setLectureDate('');
                  setStartTime('');
                  setEndTime('');
                }}
                className="px-10 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all"
             >
                Cancel
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultySchedule;