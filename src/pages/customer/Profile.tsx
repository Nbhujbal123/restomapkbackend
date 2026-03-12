import React, { useState, useEffect } from 'react'
import { FaUser, FaSignOutAlt, FaArrowLeft, FaUtensils, FaList, FaHistory, FaFileInvoice, FaBox, FaClock, FaCheckCircle, FaShippingFast, FaCog } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'

// Types for Order and Bill
interface OrderItem {
  menuItemId: number
  name: string
  price: number
  quantity: number
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  orderStatus: string
  isBilled: boolean
  isPaid?: boolean
  createdAt: string
}

interface BillItem {
  productId: number
  name: string
  price: number
  quantity: number
}

interface Bill {
  _id: string
  items: BillItem[]
  totalAmount: number
  status: string
  createdAt: string
  orderIds?: string[]
  customerId?: {
    _id: string
    name: string
    email: string
  }
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingBills, setLoadingBills] = useState(false)
  const [activeTab, setActiveTab] = useState<'orders' | 'bills'>('orders')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Fetch orders for the logged-in user
  useEffect(() => {
    console.log('Profile: User effect triggered', { userId: user?.id, userEmail: user?.email })
    
    // Try to get orders - first by user ID, then by email as fallback
    if (user?.id) {
      fetchOrders()
    } else if (user?.email) {
      // Fallback: fetch orders by email if ID is not available
      fetchOrdersByEmail()
    } else {
      // Check localStorage for user email or name from previous checkout
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserInfo) {
        try {
          const userInfo = JSON.parse(storedUserInfo)
          if (userInfo.email) {
            fetchOrdersByEmail(userInfo.email)
            fetchBillsByEmail(userInfo.email, userInfo.name)
          } else if (userInfo.name) {
            // For guests - fetch by customer name
            fetchAllOrdersForGuest()
            fetchBillsByEmail('', userInfo.name)
          }
        } catch (e) {
          console.log('Error parsing userInfo:', e)
          // Try fetching all orders for guest
          fetchAllOrdersForGuest()
        }
      } else {
        console.log('Profile: No user logged in')
      }
    }
    
    // Fetch bills
    if (user?.email || user?.name) {
      fetchBills()
    }
  }, [user?.id, user?.email, user?.name])

  const fetchOrders = async () => {
    if (!user?.id) return
    setLoadingOrders(true)
    try {
      const siteCode = localStorage.getItem('siteCode') || ''
      const response = await fetch(`${API_BASE_URL}/orders/user/${user.id}`, {
        headers: {
          'x-site-code': siteCode
        }
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        console.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  // Auto-refresh orders every 10 seconds to keep status updated from admin
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id) {
        fetchOrders()
      } else if (user?.email) {
        fetchOrdersByEmail()
      } else {
        // For guests - fetch orders by customer name from localStorage
        const storedUserInfo = localStorage.getItem('userInfo')
        if (storedUserInfo) {
          try {
            const userInfo = JSON.parse(storedUserInfo)
            if (userInfo.email) {
              fetchOrdersByEmail(userInfo.email)
            } else if (userInfo.name) {
              fetchAllOrdersForGuest()
            }
          } catch (e) {
            fetchAllOrdersForGuest()
          }
        }
      }
      
      // Also refresh bills
      if (user?.email || user?.name) {
        fetchBills()
      } else {
        const storedUserInfo = localStorage.getItem('userInfo')
        if (storedUserInfo) {
          try {
            const userInfo = JSON.parse(storedUserInfo)
            if (userInfo.email) {
              fetchBillsByEmail(userInfo.email, userInfo.name)
            } else if (userInfo.name) {
              fetchBillsByEmail('', userInfo.name)
            }
          } catch (e) {}
        }
      }
    }, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [user?.id, user?.email, user?.name])

  const fetchOrdersByEmail = async (email?: string) => {
    const emailToUse = email || user?.email
    if (!emailToUse) return
    setLoadingOrders(true)
    try {
      const siteCode = localStorage.getItem('siteCode') || ''
      const response = await fetch(`${API_BASE_URL}/orders/email/${emailToUse}`, {
        headers: {
          'x-site-code': siteCode
        }
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        console.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  // Fetch all orders (for guests without login)
  const fetchAllOrdersForGuest = async () => {
    setLoadingOrders(true)
    try {
      const siteCode = localStorage.getItem('siteCode') || ''
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          'x-site-code': siteCode
        }
      })
      if (response.ok) {
        const allOrders = await response.json()
        // Filter by customer name from localStorage
        const storedUserInfo = localStorage.getItem('userInfo')
        if (storedUserInfo) {
          try {
            const userInfo = JSON.parse(storedUserInfo)
            if (userInfo.name) {
              const filtered = allOrders.filter((order: any) => 
                order.customer?.name?.toLowerCase() === userInfo.name.toLowerCase()
              )
              setOrders(filtered)
              return
            }
          } catch (e) {}
        }
        setOrders([])
      } else {
        console.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchBills = async (email?: string, name?: string) => {
    const emailToUse = email || user?.email || ''
    const nameToUse = name || user?.name || ''
    if (!emailToUse && !nameToUse) return
    setLoadingBills(true)
    console.log('Profile: fetchBills called', { userEmail: emailToUse, userName: nameToUse })
    try {
      // Fetch ALL bills and filter on frontend
      const response = await fetch(`${API_BASE_URL}/bills/all-with-info`)
      console.log('Profile: bills response status:', response.status)
      
      if (response.ok) {
        const allBills = await response.json()
        console.log('Profile: total bills fetched:', allBills.length)
        
        // Filter bills by matching email or name
        const userEmail = emailToUse.toLowerCase()
        const userName = nameToUse.toLowerCase()
        
        const filteredBills = allBills.filter((bill: any) => {
          // Check if customerId.email matches
          if (bill.customerId && bill.customerId.email) {
            if (bill.customerId.email.toLowerCase() === userEmail) {
              return true
            }
          }
          // Check if customerEmail matches (for guest orders)
          if (bill.customerEmail) {
            if (bill.customerEmail.toLowerCase() === userEmail) {
              return true
            }
          }
          // Check if customerName matches
          if (bill.customerName) {
            if (bill.customerName.toLowerCase() === userName) {
              return true
            }
          }
          return false
        })
        
        console.log('Profile: filtered bills:', filteredBills.length)
        setBills(filteredBills)
      } else {
        console.error('Failed to fetch bills')
      }
    } catch (error) {
      console.error('Error fetching bills:', error)
    } finally {
      setLoadingBills(false)
    }
  }

  const fetchBillsByEmail = async (email?: string, name?: string) => {
    const emailToUse = email || user?.email || ''
    const nameToUse = name || user?.name || ''
    if (!emailToUse && !nameToUse) return
    setLoadingBills(true)
    console.log('Profile: fetchBillsByEmail called', { userEmail: emailToUse, userName: nameToUse })
    try {
      // Fetch ALL bills and filter on frontend
      const response = await fetch(`${API_BASE_URL}/bills/all-with-info`)
      console.log('Profile: bills response status:', response.status)
      
      if (response.ok) {
        const allBills = await response.json()
        console.log('Profile: total bills fetched:', allBills.length)
        
        // Filter bills by matching email or name
        const userEmail = emailToUse.toLowerCase()
        const userName = nameToUse.toLowerCase()
        
        const filteredBills = allBills.filter((bill: any) => {
          // Check if customerId.email matches
          if (bill.customerId && bill.customerId.email) {
            if (bill.customerId.email.toLowerCase() === userEmail) {
              return true
            }
          }
          // Check if customerEmail matches (for guest orders)
          if (bill.customerEmail) {
            if (bill.customerEmail.toLowerCase() === userEmail) {
              return true
            }
          }
          // Check if customerName matches
          if (bill.customerName) {
            if (bill.customerName.toLowerCase() === userName) {
              return true
            }
          }
          return false
        })
        
        console.log('Profile: filtered bills:', filteredBills.length)
        setBills(filteredBills)
      } else {
        console.error('Failed to fetch bills')
      }
    } catch (error) {
      console.error('Error fetching bills:', error)
    } finally {
      setLoadingBills(false)
    }
  }

  // Get status step for progress indicator
  const getStatusStep = (status: string): number => {
    switch (status) {
      case 'PENDING': return 1
      case 'PREPARING': return 2
      case 'READY': return 3
      case 'COMPLETED': return 4
      case 'DELIVERED': return 4
      default: return 0
    }
  }

  // Render progress indicator for order tracking
  const renderProgressIndicator = (status: string) => {
    const currentStep = getStatusStep(status)
    const steps = [
      { step: 1, label: 'Pending', color: '#F59E0B' },
      { step: 2, label: 'Preparing', color: '#3B82F6' },
      { step: 3, label: 'Ready', color: '#10B981' },
      { step: 4, label: 'Completed', color: '#4F46E5' },
    ]

    return (
      <div className="d-flex align-items-center justify-content-between mt-2" style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10%',
          right: '10%',
          height: '3px',
          backgroundColor: '#e5e7eb',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10%',
          width: `${((currentStep - 1) / 3) * 80}%`,
          height: '3px',
          backgroundColor: '#4F46E5',
          zIndex: 1,
          transition: 'width 0.3s ease'
        }} />
        {steps.map((s) => (
          <div key={s.step} className="d-flex flex-column align-items-center" style={{ zIndex: 2, position: 'relative' }}>
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: currentStep >= s.step ? s.color : '#e5e7eb',
                color: currentStep >= s.step ? '#fff' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
              }}
            >
              {currentStep > s.step ? '✓' : s.step}
            </div>
            <span className="mt-1" style={{ 
              color: currentStep >= s.step ? s.color : '#9ca3af',
              fontWeight: currentStep === s.step ? '600' : '400',
              fontSize: '9px'
            }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Get status color based on order status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'PREPARING':
        return 'primary'
      case 'READY':
        return 'warning'
      case 'COMPLETED':
        return 'success'
      case 'DELIVERED':
        return 'success'
      default:
        return 'secondary'
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Check if an order's bill is paid by matching with bills
  const isOrderPaid = (orderId: string): boolean => {
    // Find a bill that contains this order ID and is PAID
    const paidBill = bills.find(bill => 
      bill.status === 'PAID' && 
      (bill as any).orderIds && 
      (bill as any).orderIds.includes(orderId)
    )
    return !!paidBill
  }

  return (
    <div className="container py-4" style={{ background: 'linear-gradient(to bottom, #fffaf4, #fff3e0)', minHeight: '100vh', maxWidth: '600px' }}>
      {/* Header */}
      <div className="text-center mb-4 position-relative">
        <Link
          to="/menu"
          className="btn btn-outline-secondary position-absolute start-0 top-0 rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '40px', height: '40px' }}
        >
          <FaArrowLeft />
        </Link>
        <h1 className="h3 fw-bold" style={{
          background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          My Profile
        </h1>
      </div>

      {/* User Info Card */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-body p-3">
          {user ? (
            <>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" 
                     style={{ width: '56px', height: '56px' }}>
                  <FaUser className="text-white" size={24} />
                </div>
                <div className="flex-grow-1">
                  <h5 className="mb-0 fw-bold">{user.name}</h5>
                  <small className="text-muted">{user.email}</small>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="me-1" /> Logout
                </button>
              </div>
              {user.phone && (
                <div className="mt-2">
                  <small className="text-muted">Phone: {user.phone}</small>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-3">
              <p className="text-muted mb-0 small">No user information available</p>
            </div>
          )}
        </div>
      </div>

      {/* Order & Bill History Section */}
      {(user || localStorage.getItem('userInfo')) && (
        <div className="mb-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <FaHistory className="text-warning" />
            My Activity
          </h6>
          
          {/* Tab Buttons */}
          <div className="d-flex gap-2 mb-3">
            <button
              className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'orders' ? 'text-white' : 'btn-outline-primary'}`}
              style={activeTab === 'orders' ? { background: 'linear-gradient(90deg, #FF6A00, #FF9900)', border: 'none' } : {}}
              onClick={() => setActiveTab('orders')}
            >
              <FaBox className="me-2" /> My Orders
            </button>
            <button
              className={`btn rounded-pill px-4 py-2 fw-semibold ${activeTab === 'bills' ? 'text-white' : 'btn-outline-primary'}`}
              style={activeTab === 'bills' ? { background: 'linear-gradient(90deg, #FF6A00, #FF9900)', border: 'none' } : {}}
              onClick={() => setActiveTab('bills')}
            >
              <FaFileInvoice className="me-2" /> Bill History
            </button>
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-3">
                {loadingOrders ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading orders...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {/* Filter out orders that have been paid - check both order.isPaid and bill status */}
                    {orders
                      .filter(order => {
                        // Hide orders that are paid (either from order.isPaid or from bill status)
                        return !order.isPaid && !isOrderPaid(order._id)
                      })
                      .map((order) => (
                      <div key={order._id} className="border-bottom pb-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <small className="text-muted d-block">Order ID: {order._id.slice(-8).toUpperCase()}</small>
                            <small className="text-muted">{formatDate(order.createdAt)}</small>
                          </div>
                        </div>
                        {/* Order Progress Tracker - Logic based on order status and bill payment */}
                        {/* Show "Enjoy your food" when order is COMPLETED/DELIVERED and bill is UNPAID */}
                        {(order.orderStatus === 'COMPLETED' || order.orderStatus === 'DELIVERED') && order.isBilled && !order.isPaid && !isOrderPaid(order._id) ? (
                          <div className="mt-2 mb-2 p-3 text-center" style={{ backgroundColor: '#d4edda', borderRadius: '8px' }}>
                            <h6 className="mb-0" style={{ color: '#155724' }}>🍽️ Enjoy your food!</h6>
                          </div>
                        ) : /* Show nothing when order is COMPLETED/DELIVERED and bill is PAID */
                        ((order.orderStatus === 'COMPLETED' || order.orderStatus === 'DELIVERED') && (order.isPaid || isOrderPaid(order._id))) ? (
                          <div className="mt-2 mb-2"></div>
                        ) : /* Show progress indicator for ongoing orders */
                        (
                          renderProgressIndicator(order.orderStatus)
                        )}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            {order.items.slice(0, 2).map((item, idx) => (
                              <small key={idx} className="d-block text-muted">
                                {item.quantity}x {item.name}
                              </small>
                            ))}
                            {order.items.length > 2 && (
                              <small className="text-muted">+{order.items.length - 2} more items</small>
                            )}
                          </div>
                          <div className="text-end">
                            <h6 className="mb-0 fw-bold text-success">₹{Math.round(order.total)}</h6>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FaBox size={40} className="text-muted mb-3" />
                    <p className="text-muted mb-0">No orders yet</p>
                    <Link to="/menu" className="btn btn-sm btn-primary mt-2 rounded-pill">
                      Browse Menu
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bills Tab */}
          {activeTab === 'bills' && (
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 fw-bold">All Bills</h6>
                  <button 
                    className="btn btn-sm btn-outline-secondary rounded-pill" 
                    onClick={() => fetchBills()}
                    disabled={loadingBills}
                  >
                    {loadingBills ? 'Loading...' : '↻ Refresh'}
                  </button>
                </div>
                {loadingBills ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading bills...</p>
                  </div>
                ) : bills.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {bills.map((bill) => (
                      <div key={bill._id} className="border-bottom pb-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <small className="text-muted d-block">Bill ID: {bill._id.slice(-8).toUpperCase()}</small>
                            <small className="text-muted">{formatDate(bill.createdAt)}</small>
                          </div>
                          <span className={`badge ${bill.status === 'PAID' ? 'bg-success' : 'bg-warning'}`}>
                            {bill.status === 'PAID' ? '✓ Paid' : '⏳ Unpaid'}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            {bill.items.slice(0, 2).map((item, idx) => (
                              <small key={idx} className="d-block text-muted">
                                {item.quantity}x {item.name}
                              </small>
                            ))}
                            {bill.items.length > 2 && (
                              <small className="text-muted">+{bill.items.length - 2} more items</small>
                            )}
                          </div>
                          <div className="text-end">
                            <h6 className="mb-0 fw-bold text-success">₹{Math.round(bill.totalAmount)}</h6>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FaFileInvoice size={40} className="text-muted mb-3" />
                    <p className="text-muted mb-0">No bill history</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions - Browse Menu */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <FaUtensils className="text-warning" />
          Explore
        </h6>
        <div className="d-grid gap-2">
          <Link
            to="/menu"
            className="btn btn-primary rounded-pill py-3 fw-semibold"
            style={{ background: 'linear-gradient(90deg, #FF6A00, #FF9900)', border: 'none' }}
          >
            <FaUtensils className="me-2" /> Browse Menu
          </Link>
          <Link
            to="/category"
            className="btn btn-outline-primary rounded-pill py-3 fw-semibold"
          >
            <FaList className="me-2" /> View Categories
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <div className="card-body text-center py-4">
          <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3" 
               style={{ width: '80px', height: '80px' }}>
            <FaUtensils size={32} className="text-warning" />
          </div>
          <h5 className="fw-bold mb-2">Welcome to RestoM!</h5>
          <p className="text-muted mb-0">
            Browse our delicious menu and place your order today!
          </p>
        </div>
      </div>
    </div>
  )
}

export default Profile
