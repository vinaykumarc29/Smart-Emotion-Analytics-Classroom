import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Auth from './pages/auth'; 
import ProtectedRoute from './components/ProtectedRoute'; // <--- IMPORT THIS

// Create a dummy dashboard for now to test
const StudentDashboard = () => <h1>Welcome Student!</h1>;
const FacultyDashboard = () => <h1>Welcome Faculty!</h1>;

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Auth />} />
          
          {/* --- PROTECT THESE ROUTES --- */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty/dashboard" 
            element={
              <ProtectedRoute>
                <FacultyDashboard />
              </ProtectedRoute>
            } 
          />
          {/* ---------------------------- */}
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;