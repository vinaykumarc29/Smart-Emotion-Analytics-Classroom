import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Menu,
  Settings, 
  Calendar, 
  Users, 
  FileText, 
  AlertTriangle, 
  Info, 
  Check,
  HelpCircle,
  LogOut,
  X,
  BookOpen,
  BarChart2
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = ({ userRole, userName ,toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for dropdown visibility
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);

  // Animation States
  const [isClearing, setIsClearing] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  // Refs for click outside detection
  const notificationRef = useRef(null);
  const settingsRef = useRef(null);

  // Notification Data State
  const [notifications, setNotifications] = useState([]);

  // Initial Data Definitions (Mock Data)
  const initialStudentNotifications = [
    {
      id: 1,
      title: 'Lecture Scheduled',
      description: 'Data Structures scheduled for tomorrow at 9:00 AM',
      time: 'Today',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      unread: true
    },
    {
      id: 2,
      title: 'Assignment Deadline',
      description: 'Lab 4: Linked Lists due in 2 hours',
      time: 'Today',
      icon: AlertTriangle,
      color: 'bg-orange-50 text-orange-600',
      unread: true
    },
    {
      id: 3,
      title: 'Attendance Update',
      description: 'Your attendance in Algorithms is now 92%',
      time: 'Yesterday',
      icon: Check,
      color: 'bg-green-50 text-green-600',
      unread: false
    },
    {
      id: 4,
      title: 'New Announcement',
      description: 'Prof. Smith posted a new announcement in CS-301',
      time: 'Yesterday',
      icon: Info,
      color: 'bg-purple-50 text-purple-600',
      unread: true
    },
    {
      id: 5,
      title: 'Faculty Feedback',
      description: 'New feedback: Algorithm Quiz',
      time: '2 days ago',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
      unread: false
    }
  ];

  const initialFacultyNotifications = [
    {
      id: 1,
      title: 'Lecture Reminder',
      description: 'Your Data Structures lecture starts at 9:00 AM',
      time: 'Today',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      unread: true
    },
    {
      id: 2,
      title: 'Report Ready',
      description: 'Attendance report for Algorithms is ready to download',
      time: 'Today',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600',
      unread: true
    },
    {
      id: 3,
      title: 'Engagement Alert',
      description: 'Engagement dropped below 70% in CS-301',
      time: 'Yesterday',
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      unread: true
    },
    {
      id: 4,
      title: 'New Students',
      description: '5 new students joined CS-301',
      time: 'Yesterday',
      icon: Users,
      color: 'bg-green-50 text-green-600',
      unread: false
    },
    {
      id: 5,
      title: 'Submission Summary',
      description: '45/50 students submitted Lab 3',
      time: '2 days ago',
      icon: Check,
      color: 'bg-orange-50 text-orange-600',
      unread: false
    }
  ];

  // Initialize notifications based on role
  useEffect(() => {
    if (userRole === 'student') {
      setNotifications(initialStudentNotifications);
    } else {
      setNotifications(initialFacultyNotifications);
    }
  }, [userRole]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getBreadcrumb = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return 'Portal';
    
    // Capitalize and format
    const formatted = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
    return `${userRole === 'student' ? 'Student Portal' : 'Faculty Portal'} / ${formatted.split(' / ')[1] || 'Dashboard'}`;
  };

  const handleProfileClick = () => {
    if (userRole === 'student') {
        navigate('/student/profile');
    } else {
        navigate('/faculty/profile');
    }
  };

  const handleLogout = () => {
    // 1. Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 2. Redirect to Login
    navigate('/');
  };

  const handleMarkAllRead = () => {
    setIsClearing(true);
    // Wait for animation to finish before updating state
    setTimeout(() => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        setIsClearing(false);
    }, 300);
  };

  const handleViewAll = () => {
    setShowAllModal(true);
    setShowNotifications(false);
  };

  const handleCloseModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
        setShowAllModal(false);
        setIsModalClosing(false);
    }, 250);
  };

  // Filter for dropdown: Only show unread notifications
  const dropdownNotifications = notifications.filter(n => n.unread);
  const unreadCount = dropdownNotifications.length;

  // Additional Data for Modal
  const additionalStudentData = [
    {
        id: 101,
        title: 'Assignment Feedback',
        description: 'Assignment feedback available for Database Systems',
        time: '3 days ago',
        icon: FileText,
        color: 'bg-indigo-50 text-indigo-600',
        unread: false
    },
    {
        id: 102,
        title: 'Class Material',
        description: 'New class material uploaded for Operating Systems',
        time: '4 days ago',
        icon: BookOpen,
        color: 'bg-teal-50 text-teal-600',
        unread: false
    }
  ];

  const additionalFacultyData = [
    {
        id: 201,
        title: 'Grading Completed',
        description: 'Assignment grading completed for CS-101',
        time: '3 days ago',
        icon: Check,
        color: 'bg-green-50 text-green-600',
        unread: false
    },
    {
        id: 202,
        title: 'Analytics Report',
        description: 'Lecture analytics report generated for last week',
        time: '4 days ago',
        icon: BarChart2,
        color: 'bg-blue-50 text-blue-600',
        unread: false
    }
  ];

  const modalNotifications = [
    ...notifications,
    ...(userRole === 'student' ? additionalStudentData : additionalFacultyData)
  ];

  return (
    <>

    <header className="h-16 bg-[#F9F7F2] border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      
      {/* LEFT SIDE: Breadcrumb + Mobile Menu */}
      <div className="flex items-center gap-3">
          
          {/* ✅ HAMBURGER BUTTON (Mobile Only) */}
          <button 
            onClick={toggleSidebar} 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="text-sm text-gray-500 font-serif italic hidden md:block">
            {getBreadcrumb()}
          </div>
      </div>

      {/* RIGHT SIDE: Icons & Profile (Same as before) */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* ... (Your existing Bell, Settings, Profile code) ... */}
      </div>
    </header>

    {/* View All Notifications Modal */}
    {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Fade */}
            <div 
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isModalClosing ? 'opacity-0' : 'opacity-100'}`}
                onClick={handleCloseModal}
            ></div>
            
            {/* Modal Content with Scale/Fade */}
            <div 
                className={`bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[80vh] flex flex-col relative z-10 ${isModalClosing ? 'opacity-0 transition-opacity' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 font-serif">All Notifications</h2>
                        <p className="text-xs text-gray-500 font-serif italic">History of your alerts and updates</p>
                    </div>
                    <button 
                        onClick={handleCloseModal}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-2">
                    {modalNotifications.map((notif) => (
                        <div 
                            key={notif.id} 
                            className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex gap-4"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.color}`}>
                                <notif.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm font-bold ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>{notif.title}</h4>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{notif.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">{notif.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-right">
                    <button 
                        onClick={handleCloseModal}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default Header;