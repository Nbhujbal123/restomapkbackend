import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaShoppingCart, FaUtensils, FaUser } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
// import {lg} from 'Logo.png';
 
const Navbar: React.FC = () => {
  const { getTotalItems, cartAnimation, tableNumber } = useCart()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <Link className="navbar-brand" to="/admin/dashboard">
            <FaUtensils className="me-2" />
            Restaurant Admin
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/menu">Menu Management</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/analytics">Analytics</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/reports">Reports</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    )
  }
 
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-0 position-sticky top-0" style={{ zIndex: 1000 }}>
      <div className="container d-flex justify-content-between align-items-center">
       
        {/* 🍴 Brand */}
        <Link className="navbar-brand fw-bold text-success fs-4 d-flex align-items-center" to="/">
          <img
            src="/assets/images/Logo.png"
            alt="Logo"
            className="me-2"
            style={{ width: '200px', height: '70px', objectFit: 'cover' }}
          />
          {/* <span className="text-primary">RestoM</span> */}
        </Link>

        {/* Table Indicator - Show when QR code scanned */}
        {tableNumber && (
          <div
            className="position-absolute start-50 translate-middle-x"
            style={{ top: '80px', zIndex: 1001 }}
          >
            <span
              className="badge px-3 py-2"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '20px',
                boxShadow: '0 2px 10px rgba(79, 70, 229, 0.4)'
              }}
            >
              🍽 Table {tableNumber}
            </span>
          </div>
        )}
 
        {/* 🛒 Cart and Profile - aligned right */}
        <div className="d-none d-lg-flex align-items-center gap-3">
          <style>
            {`
              .profile-icon-btn {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                text-decoration: none;
              }
              .profile-icon-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
                color: white;
              }
              .profile-icon-btn:active {
                transform: scale(0.95);
              }
              @media (max-width: 991px) {
                .table-indicator-mobile {
                  position: absolute !important;
                  top: 10px !important;
                  left: 50% !important;
                  transform: translateX(-50%) !important;
                }
              }
            `}
          </style>
          
          <Link
            to="/profile"
            className="profile-icon-btn"
            title="My Profile"
          >
            <FaUser size={18} />
          </Link>

          <Link
            to="/cart"
            className={`position-relative text-dark nav-link ${cartAnimation ? 'cart-bounce' : ''}`}
            style={{
              transition: 'transform 0.2s',
              background: 'linear-gradient(90deg, #4F46E5, #6366F1)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'white'
            }}
          >
            <FaShoppingCart size={22} className="me-1" />
            {getTotalItems() > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-white text-dark fw-bold">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
 
        {/* 📱 Mobile Cart and Profile */}
        <div className="d-lg-none d-flex align-items-center gap-2">
          {tableNumber && (
            <span
              className="badge table-indicator-mobile px-2 py-1"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '15px'
              }}
            >
              🍽 {tableNumber}
            </span>
          )}
          <Link
            to="/profile"
            className="profile-icon-btn"
            title="My Profile"
          >
            <FaUser size={16} />
          </Link>
          <Link
            className={`nav-link position-relative text-white ${cartAnimation ? 'cart-bounce' : ''}`}
            to="/cart"
            style={{
              background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          >
            <FaShoppingCart size={20} />
            {getTotalItems() > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-white text-dark fw-bold">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
 
export default Navbar