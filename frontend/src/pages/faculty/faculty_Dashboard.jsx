import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Terminal, Database, Cloud, X, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Faculty_Dashboard = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data States
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);
  
  // Create Group Form State
  const [newGroupName, setNewGroupName] = useState('');

  // IMPORTANT: We need the backend URL since React runs on a different port
  const API_BASE_URL = 'http://localhost:5000/api/faculty/groups';

  // Helper to get the token for our requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // Assumes token is saved here on login
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // 1. Fetch all groups on load
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      } else {
        console.error("Failed to fetch groups. Are you logged in?");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  // 2. View Group Students
  const handleViewGroup = async (group) => {
    setSelectedGroup(group);
    setShowViewModal(true);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/${group.id}/students`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setGroupStudents(data.students);
      } else {
        setGroupStudents([]);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Create a New Group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newGroupName })
      });

      if (response.ok) {
        setNewGroupName(''); // Clear input
        setShowCreateModal(false); // Close modal
        fetchGroups(); // Refresh the list to show the new group
      } else {
        alert("Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  // 4. Delete a Group
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group? All students will be removed.")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${groupId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        fetchGroups(); // Refresh the list
      } else {
        alert("Failed to delete group");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
        <h1 className="text-4xl font-serif font-bold text-[#1B3B6F]">Manage Groups</h1>
        <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-[#2C4C88] text-white rounded-lg font-bold flex items-center gap-2 hover:bg-[#1B3B6F] shadow-sm transition-colors"
             >
                <Plus className="w-5 h-5" />
                Create New Group
            </button>
        </div>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          


            <div key={group.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                    <Users className="w-8 h-8" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-serif font-bold text-gray-900">{group.name}</h3>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-1">
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded text-xs font-mono font-bold text-gray-600">
                            <span className="text-gray-400">JOIN CODE:</span> {group.join_code}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => handleViewGroup(group)}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-[#2C4C88] text-white rounded-lg font-bold hover:bg-[#1B3B6F] transition-colors"
                    >
                        View Students
                    </button>
                    <button 
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-2.5 border border-gray-200 text-gray-400 rounded-lg hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        ))}
        {groups.length === 0 && (
            <p className="text-center text-gray-500 py-10">You haven't created any groups yet.</p>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-serif font-bold text-gray-900">Create New Group</h2>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Group Name</label>
                        <input 
                            type="text" 
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="e.g., Advanced AI - Spring 2024"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] outline-none text-gray-700 bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>
                    <p className="mt-2 text-xs text-gray-400 italic">The 6-character Join Code will be generated automatically by the database.</p>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button 
                        onClick={() => setShowCreateModal(false)}
                        className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateGroup}
                        className="px-6 py-2 bg-[#2C4C88] text-white font-bold rounded-lg hover:bg-[#1B3B6F] shadow-lg shadow-blue-900/10 transition-colors"
                    >
                        Save Group
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* View Group Details Modal */}
      {showViewModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900">{selectedGroup.name}</h2>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {selectedGroup.join_code}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                             <RefreshCw className="w-8 h-8 animate-spin mb-2 opacity-50" />
                             <p>Loading students from database...</p>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1">
                                <div className="overflow-x-auto h-full">
                                    <table className="w-full text-left min-w-[600px] sm:min-w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Roll Number</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {groupStudents.map((student, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{student.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{student.roll_no}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{student.email}</td>
                                                </tr>
                                            ))}
                                            {groupStudents.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400 text-sm italic">
                                                        No students enrolled yet. Give them the join code!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button 
                        onClick={() => setShowViewModal(false)}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Faculty_Dashboard;