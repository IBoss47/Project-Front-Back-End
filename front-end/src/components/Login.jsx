import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from '../api/auth';


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = (e) => {
    e.preventDefault();
    let hasError = false;
    let newError = { username: "", password: "" };
    
    if (!username) {
      newError.username = "กรุณากรอกชื่อผู้ใช้";
      hasError = true;
    }
    if (!password) {
      newError.password = "กรุณากรอกรหัสผ่าน";
      hasError = true;
    }
    
    setError(newError); 
    if (hasError) return;
    
    // เริ่ม loading
    setLoading(true);
    
    // Logic login
    authAPI.login({ username, password })
      .then((response) => {
        console.log('🔍 Full response:', response);
        
        // ตรวจสอบว่ามี data หรือไม่
        if (!response.data || !response.data.user) {
          throw new Error('Invalid response structure');
        }
        
        const userWithRoles = response.data.user;
        const user = userWithRoles.User || userWithRoles;
        const roles = userWithRoles.Roles || userWithRoles.roles || [];
        
        console.log('👤 User:', user);
        console.log('🎭 Roles:', roles);
        console.log('🔑 Access Token:', response.data.access_token ? 'Saved' : 'Missing');
        console.log('🔄 Refresh Token:', response.data.refresh_token ? 'Saved' : 'Missing');
        
        // เก็บข้อมูลเพิ่มเติม (tokens ถูกเก็บอัตโนมัติโดย authAPI.login แล้ว)
        localStorage.setItem("token", response.data.access_token); // เพิ่ม token สำหรับ Navbar
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", user.username);
        localStorage.setItem("email", user.email);
        localStorage.setItem("name", user.full_name);
        localStorage.setItem("roles", JSON.stringify(roles));

        // Debug logs
        console.log('✅ Saved username:', localStorage.getItem("username"));
        console.log('✅ Saved name:', localStorage.getItem("name"));
        console.log('✅ Saved roles:', localStorage.getItem("roles"));
        
        // Navigate based on role
        if (roles.includes('admin')) navigate('/');
        else navigate('/');
      })
      .catch((err) => {
        console.error('❌ Login error:', err);
        setError({ 
          username: "", 
          password: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' 
        });
      })
      .finally(() => {
        // ปิด loading
        setLoading(false);
      });
      
  };

  return (
    <div className="min-h-screen flex items-center w-xl justify-center  ">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username */}
          <div>
            <label className=" block text-sm font-medium mb-1 items-start">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
            />
            {error.username && (
              <p className="text-red-500 text-xs mt-1">{error.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
            {error.password && (
              <p className="text-red-500 text-xs mt-1">{error.password}</p>
            )}
          </div>

          {/* ลืมรหัส */}
          <div className="text-right">
            <a href="#"  className="text-sm text-gray-400 hover:underline pointer-events-none">
              ลืมรหัสผ่าน?
            </a>
          </div>

          {/* Login button */}
          <button
            type="submit" 
            disabled={loading}
            className={`w-full py-2 rounded-lg transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                กำลังเข้าสู่ระบบ...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>
        {/* Signup */}
        <p className="mt-4 text-center text-sm text-gray-600">
          ยังไม่มีบัญชี?{" "}
          <button 
            onClick={() => navigate('/register')}
            className="text-blue-500 hover:underline"
          >
            สมัครสมาชิก
          </button>
        </p>
       
      </div>
    </div>
  );
}
export default Login;