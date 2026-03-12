import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCrown,
  FaUtensils,
  FaCheckCircle,
  FaShoppingCart,
  FaPlus,
  FaList,
  FaSignOutAlt,
  FaChartLine,
  FaUsers,
  FaRupeeSign,
  FaHome
} from "react-icons/fa";

import { API_BASE_URL } from "../../config/api";

const SuperAdminDashboard = () => {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    ordersToday: 0,
    revenueToday: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/superadmin/login");
      return;
    }

    fetchStats();

  }, []);

  const fetchStats = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/superadmin/dashboard-summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      setStats(data);

    } catch (error) {
      console.log(error);
    }

  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/superadmin/login");
  };

  return (

    <div className="d-flex" style={{ minHeight: "100vh" }}>

      {/* SIDEBAR */}

      <div
        style={{
          width: "260px",
          background: "linear-gradient(180deg,#0f172a,#1e293b)",
          color: "white",
          padding: "25px"
        }}
      >

        <h4 className="mb-4 d-flex align-items-center gap-2">
          <FaCrown color="gold" /> Super Admin
        </h4>

        <div className="d-grid gap-2">

          <button
            className="btn text-start text-white"
            style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px" }}
            onClick={() => navigate("/superadmin/dashboard")}
          >
            <FaHome className="me-2" /> Dashboard
          </button>

          <button
            className="btn text-start text-white"
            style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px" }}
            onClick={() => navigate("/superadmin/create-restaurant")}
          >
            <FaPlus className="me-2" /> Create Restaurant
          </button>

          <button
            className="btn text-start text-white"
            style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px" }}
            onClick={() => navigate("/superadmin/restaurants")}
          >
            <FaList className="me-2" /> Manage Restaurants
          </button>

          <button
            className="btn text-start text-white"
            style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px" }}
            onClick={() => navigate("/superadmin/analytics")}
          >
            <FaChartLine className="me-2" /> Analytics
          </button>

        </div>

        <hr className="text-secondary my-4" />

        <button className="btn btn-danger w-100" onClick={handleLogout}>
          <FaSignOutAlt className="me-2" /> Logout
        </button>

      </div>


      {/* MAIN CONTENT */}

      <div className="flex-grow-1 bg-light">

        {/* HEADER */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >

          <div>
            <h3 className="fw-bold mb-0">Platform Overview 👑</h3>
            <p className="text-muted mb-0">
              Monitor restaurants and system performance
            </p>
          </div>

          <button
            className="btn btn-primary shadow-sm"
            onClick={() => navigate("/superadmin/create-restaurant")}
          >
            <FaPlus className="me-2" />
            Create Restaurant
          </button>

        </div>


        {/* DASHBOARD CONTENT */}

        <div className="container mt-4">

          {/* STATS */}

          <div className="row g-4">

            <StatCard
              title="Total Restaurants"
              value={stats.totalRestaurants}
              icon={<FaUtensils />}
              color="#6366F1"
            />

            <StatCard
              title="Active Restaurants"
              value={stats.activeRestaurants}
              icon={<FaCheckCircle />}
              color="#22C55E"
            />

            <StatCard
              title="Orders Today"
              value={stats.ordersToday}
              icon={<FaShoppingCart />}
              color="#F59E0B"
            />

            <StatCard
              title="Revenue Today"
              value={`₹${stats.revenueToday}`}
              icon={<FaRupeeSign />}
              color="#06B6D4"
            />

            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              icon={<FaUsers />}
              color="#EC4899"
            />

            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue}`}
              icon={<FaChartLine />}
              color="#10B981"
            />

          </div>


          {/* PLATFORM INSIGHTS */}

          <div className="row mt-4">

            <div className="col-md-8">

              <div className="card shadow-sm border-0 p-4">
                <h5 className="fw-bold mb-3">Platform Insights</h5>

                <div className="row">

                  <div className="col-md-4">
                    <p className="text-muted mb-1">New Restaurants</p>
                    <h4 className="fw-bold text-primary">+2</h4>
                  </div>

                  <div className="col-md-4">
                    <p className="text-muted mb-1">Orders Growth</p>
                    <h4 className="fw-bold text-success">+12%</h4>
                  </div>

                  <div className="col-md-4">
                    <p className="text-muted mb-1">Revenue Growth</p>
                    <h4 className="fw-bold text-warning">+8%</h4>
                  </div>

                </div>

              </div>

            </div>


            <div className="col-md-4">

              <div className="card shadow-sm border-0 p-4">

                <h5 className="fw-bold mb-3">System Status</h5>

                <p className="mb-2">API Status</p>
                <span className="badge bg-success">Running</span>

                <p className="mt-3 mb-2">Database</p>
                <span className="badge bg-success">Connected</span>

              </div>

            </div>

          </div>


          {/* RECENT ACTIVITY */}

          <div className="card shadow-sm border-0 mt-4 p-4">

            <h5 className="fw-bold mb-3">Recent Activity</h5>

            <ul className="list-group list-group-flush">

              <li className="list-group-item">
                Restaurant <b>Spice Hub</b> created
              </li>

              <li className="list-group-item">
                New customer registered
              </li>

              <li className="list-group-item">
                Order placed worth ₹450
              </li>

            </ul>

          </div>

        </div>

      </div>

    </div>

  );
};

export default SuperAdminDashboard;


/* STAT CARD COMPONENT */

const StatCard = ({ title, value, icon, color }) => {

  return (

    <div className="col-lg-4 col-md-6">

      <div
        className="card border-0 shadow-sm h-100"
        style={{
          borderRadius: "16px",
          background: "linear-gradient(145deg,#ffffff,#f3f4f6)"
        }}
      >

        <div className="card-body d-flex align-items-center">

          <div
            className="me-3 d-flex align-items-center justify-content-center"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "14px",
              background: color,
              color: "white",
              fontSize: "22px"
            }}
          >
            {icon}
          </div>

          <div>
            <h6 className="text-muted">{title}</h6>
            <h3 className="fw-bold">{value}</h3>
          </div>

        </div>

      </div>

    </div>

  );

};