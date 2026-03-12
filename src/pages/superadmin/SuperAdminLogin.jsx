import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";

const SuperAdminLogin = () => {

  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: credentials.email,
          password: credentials.password,
          siteCode: "SUPERADMIN"
        }
      );

      localStorage.setItem("token", res.data.token);

      navigate("/superadmin/dashboard");

    } catch (error) {
      alert("Login failed");
    }
  };

  return (

    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg,#667eea,#764ba2)"
      }}
    >

      <div
        className="bg-white p-5 shadow-lg"
        style={{
          width: "420px",
          borderRadius: "15px"
        }}
      >

        <div className="text-center mb-4">
          <FaUserShield size={45} color="#667eea" />
          <h3 className="mt-2 fw-bold">Super Admin</h3>
          <p className="text-muted" style={{fontSize:"14px"}}>
            Login to manage restaurants
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
            />
          </div>

          <button
            className="btn w-100"
            style={{
              background:"#667eea",
              color:"#fff",
              padding:"10px",
              fontWeight:"600",
              borderRadius:"8px"
            }}
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
};

export default SuperAdminLogin;