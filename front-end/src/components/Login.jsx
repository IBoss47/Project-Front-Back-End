import React, { useState } from "react";
import { useNavigate } from "react-router-dom";



const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({ username: "", password: "" });
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
    // Logic login
    fetch('http://localhost:8080/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(err.error || 'Login failed');
        }
        return res.json();
      })
      .then((data) => {
        alert(data.message || 'Login success');
        console.log(data);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);
        localStorage.setItem("name", data.name);
        if (data.emp_id) {
          localStorage.setItem("emp_id", data.emp_id);
        }
          // Debug logs

        console.log('local == ', localStorage.getItem("role"));
        console.log('local name == ', localStorage.getItem("name"));
        console.log('local emp_id == ', localStorage.getItem("emp_id"));
        if (data.role === 'admin') navigate('/kpi');
        else navigate('/kpi');
      })
      .catch((err) => {
        alert(err.message);
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
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>
        {/* Signup */}
        <p className="mt-4 text-center text-sm text-gray-600">
          ยังไม่มีบัญชี?{" "}
          <a href="#" className="text-blue-500 hover:underline">
            สมัครสมาชิก
          </a>
        </p>
       
      </div>
    </div>
  );
}
export default Login;