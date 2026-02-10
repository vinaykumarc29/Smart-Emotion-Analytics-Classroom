import React, { useState } from 'react';

const Login = () => {
  const [activeRole, setActiveRole] = useState('student');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register States
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [regPassword, setRegPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');
  // const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();


    // here we need to submit data to froontend using fetch
    console.log('Form submitted');
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Marketing Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             {/* Raw SVG replacement for BookOpen */}
             <svg 
               xmlns="http://www.w3.org/2000/svg" 
               width="24" 
               height="24" 
               viewBox="0 0 24 24" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="2" 
               strokeLinecap="round" 
               strokeLinejoin="round" 
               className="w-10 h-10 text-[#1B3B6F]"
             >
               <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
               <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
             </svg>
             <span className="text-3xl font-bold font-serif text-[#1B3B6F]">Jignasa</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-[#1B3B6F] leading-tight">
            Emotion-aware classroom analytics for better learning
          </h1>
          <p className="text-xl text-gray-600 font-light font-serif italic">
            Empowering educators with real-time insights into student engagement and emotional well-being.
          </p>
          <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Auth Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-auto">
          
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                    placeholder="name@university.edu"
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                        placeholder="John Doe"
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
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1B3B6F] focus:ring-2 focus:ring-[#1B3B6F]/20 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
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