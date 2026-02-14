import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import "./App.css";

// --- PAGES ---
import Auth from "./pages/auth";
import Faculty_Dashboard from "./pages/faculty/Faculty_Dashboard";
import StudentDashboard from "./pages/student/student_Dashboard";
import StudentLiveLecture from './pages/student/join_lecture';
import LiveLecture from "./pages/faculty/Live_lecture";
import FacultySchedule from "./pages/faculty/Faculty_schedule";

// --- COMPONENTS ---
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

// --- LAYOUT COMPONENT ---
const DashboardLayout = () => {
  const location = useLocation();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { role: "student", name: "User" };

  // --- 1. NEW: Manage Sidebar State ---
  // Default: Open on Desktop (>768px), Closed on Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Auto-resize listener
  useEffect(() => {
    const handleResize = () => {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
        if (!mobile) setIsSidebarOpen(true); // Auto-open on desktop
        else setIsSidebarOpen(false);       // Auto-close on mobile
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      
      {/* 2. Sidebar gets the state and the toggle function */}
      <Sidebar 
          userRole={user.role} 
          isOpen={isSidebarOpen} 
          toggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobile={isMobile}
      />

      {/* 3. Main Content Wrapper */}
      {/* Dynamic Margin: 64 (Open) vs 20 (Collapsed) vs 0 (Mobile) */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out h-screen overflow-hidden
            ${isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-20'}
        `}
      >
        
        {/* Header gets the toggle function for the Mobile Hamburger button */}
        <Header 
            userRole={user.role} 
            userName={user.name} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            isSidebarOpen={isSidebarOpen}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <Outlet /> 
        </main>

        {/* Mobile Overlay (Click to close sidebar) */}
        {isMobile && isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
            ></div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="App font-sans text-gray-900">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route element={<DashboardLayout />}>
            <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/live/:lectureId" element={<ProtectedRoute><StudentLiveLecture /></ProtectedRoute>} />
            <Route path="/faculty/dashboard" element={<ProtectedRoute><Faculty_Dashboard /></ProtectedRoute>} />
            <Route path="/faculty/live" element={<ProtectedRoute><LiveLecture /></ProtectedRoute>} />
            <Route path="/faculty/live/:groupId" element={<ProtectedRoute><LiveLecture /></ProtectedRoute>} />
            <Route path="/faculty/schedule" element={<ProtectedRoute> <FacultySchedule /></ProtectedRoute>
  }
/>
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;