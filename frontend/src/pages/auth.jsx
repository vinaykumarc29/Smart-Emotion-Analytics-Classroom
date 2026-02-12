import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  // CONFIGURATION: Change this if your backend runs on a different port or prefix
  const BASE_URL = 'http://127.0.0.1:5000/api/auth';

  const [activeRole, setActiveRole] = useState('student');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register States
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Save Token
        localStorage.setItem('token', data.access_token);
        
        // 2. Save User Info (optional, but helpful)
        localStorage.setItem('user', JSON.stringify(data.user));

        // 3. Update App State
        if (onLogin) onLogin(data.user.role);

        // 4. Navigate based on the role returned from backend
        if (data.user.role === 'student') {
            navigate('/student/dashboard');
        } else {
            navigate('/faculty/dashboard');
        }
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("An error occurred while connecting to the server.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Frontend Validation
    if (!fullName || !regEmail || !institution || !regPassword) {
        alert("Please fill in all required fields.");
        return;
    }

    if (activeRole === 'student' && !rollNumber) {
        alert("Please enter your Student Roll Number.");
        return;
    }

    if (activeRole === 'faculty' && !facultyId) {
        alert("Please enter your Faculty ID.");
        return;
    }

    if (!agreedToTerms) {
        alert("You must agree to the Terms of Service and Privacy Policy.");
        return;
    }

    // Determine the ID based on role
    const idToSubmit = activeRole === 'student' ? rollNumber : facultyId;

    try {
      const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email: regEmail,
          password: regPassword,
          role: activeRole,
          collage: institution, // Note: Using 'collage' to match your backend spelling
          roll_no: idToSubmit
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        alert("Registration successful! Please login.");
        // Switch to login view
        setIsRegistering(false);
        // Optional: Pre-fill login email
        setEmail(regEmail);
        setPassword(''); 
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("An error occurred while connecting to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Marketing Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <span className="text-3xl font-bold font-serif text-[#1B3B6F]">E-analytics</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-[#1B3B6F] leading-tight">
            Emotion-aware classroom analytics for better learning
          </h1>
          <p className="text-xl text-gray-600 font-light font-serif italic">
            Empowering educators with real-time insights into student engagement and emotional well-being.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-auto">
          
          {/* Role Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
            <button
              onClick={() => setActiveRole('student')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeRole === 'student'
                  ? 'bg-white text-[#1B3B6F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setActiveRole('faculty')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeRole === 'faculty'
                  ? 'bg-white text-[#1B3B6F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Faculty
            </button>
          </div>

          {!isRegistering ? (
            /* Login Form */
            <>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Welcome Back</h2>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                    placeholder="name@university.edu"
                    required
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                    <a href="#" className="text-xs text-[#1B3B6F] hover:underline">Forgot?</a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2C4C88] text-white font-medium rounded-lg hover:bg-[#1B3B6F] transition-colors shadow-lg shadow-blue-900/10"
                >
                  Login
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                Don't have an account? <button onClick={() => setIsRegistering(true)} className="text-[#1B3B6F] font-bold hover:underline">Create an account</button>
              </div>
            </>
          ) : (
            /* Registration Form */
            <>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Create Account</h2>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                        placeholder="name@university.edu"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Institution / University</label>
                    <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                        placeholder="University of Technology"
                        required
                    />
                </div>

                {activeRole === 'student' ? (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Roll Number</label>
                        <input
                            type="text"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                            placeholder="Enter Student Roll Number"
                            required
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Faculty ID</label>
                        <input
                            type="text"
                            value={facultyId}
                            onChange={(e) => setFacultyId(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                            placeholder="Enter Faculty ID"
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                    <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 text-[#1B3B6F] border-gray-300 rounded focus:ring-[#1B3B6F]"
                    />
                    <label htmlFor="terms" className="text-xs text-gray-500">
                        I agree to the <a href="#" className="text-[#1B3B6F] hover:underline">Terms of Service</a> and <a href="#" className="text-[#1B3B6F] hover:underline">Privacy Policy</a>
                    </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2C4C88] text-white font-medium rounded-lg hover:bg-[#1B3B6F] transition-colors shadow-lg shadow-blue-900/10"
                >
                  Create Account
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                Already have an account? <button onClick={() => setIsRegistering(false)} className="text-[#1B3B6F] font-bold hover:underline">Back to Login</button>
              </div>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
             <p className="text-xs text-gray-400">Jignasa helps educators understand classroom engagement through emotion-aware analytics.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;