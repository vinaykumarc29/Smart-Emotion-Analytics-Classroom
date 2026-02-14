import React from 'react';
import { LayoutDashboard, Users, BarChart2, BookOpen, Video, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ userRole, isOpen, toggle, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const studentLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { name: 'Groups', icon: Users, path: '/student/groups' },
    { name: 'Statistics', icon: BarChart2, path: '/student/statistics' },
  ];

  const facultyLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/faculty/dashboard' },
    { name: 'Groups', icon: Users, path: '/faculty/groups' },
    { name: 'Analytics', icon: BarChart2, path: '/faculty/analytics' },
    { name: 'Schedule', icon: BookOpen, path: '/faculty/schedule' },
    { name: 'Live Monitor', icon: Video, path: '/faculty/live' },
  ];

  const links = userRole === 'student' ? studentLinks : facultyLinks;

  return (
    <div 
        className={`
            fixed top-0 left-0 h-screen bg-[#F9F7F2] border-r border-gray-200 flex flex-col z-30 transition-all duration-300 ease-in-out shadow-xl
            ${isMobile 
                ? (isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64') 
                : (isOpen ? 'w-64' : 'w-20') 
            }
        `}
    >
      {/* 1. Logo Area */}
      <div className={`h-16 flex items-center border-b border-gray-100 ${isOpen ? 'px-6 justify-between' : 'justify-center'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
             <BookOpen className="w-8 h-8 text-[#1B3B6F] shrink-0" />
             <h1 className={`text-2xl font-bold font-serif text-[#1B3B6F] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                Jignasa
             </h1>
        </div>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={() => isMobile && toggle()} 
            // Removed 'title' attribute to fix the double-text bug!
            className={`
                flex items-center py-3 px-3 rounded-lg transition-all duration-200 group relative
                ${isActive(link.path) ? 'bg-[#E5E7EB] text-[#1B3B6F]' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
                ${isOpen ? 'justify-start' : 'justify-center'}
            `}
          >
            <link.icon className={`w-6 h-6 shrink-0 transition-colors ${isActive(link.path) ? 'text-[#1B3B6F]' : 'text-gray-400 group-hover:text-gray-600'}`} />
            
            {/* Text Label (Only shows when OPEN) */}
            <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'}`}>
                {link.name}
            </span>

            {/* Custom Tooltip (Only shows when CLOSED + DESKTOP) */}
            {!isOpen && !isMobile && (
                <div className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-lg">
                    {link.name}
                </div>
            )}
          </Link>
        ))}
      </nav>

      {/* 3. Collapse Toggle Button (Desktop Only) */}
      {!isMobile && (
          <button 
            onClick={toggle}
            className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50 text-gray-500 z-50 transform hover:scale-110 transition-transform"
          >
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
      )}

      {/* 4. Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full py-3 px-3 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors ${isOpen ? 'justify-start' : 'justify-center'} group relative`}
        >
          <LogOut className="w-6 h-6 shrink-0" />
          
          <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
            Logout
          </span>

          {/* Logout Tooltip for collapsed state */}
          {!isOpen && !isMobile && (
                <div className="absolute left-14 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-lg">
                    Logout
                </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;