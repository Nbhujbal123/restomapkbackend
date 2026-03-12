import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { FaPlus, FaMinus, FaShoppingCart, FaArrowLeft, FaTrash, FaShoppingBag, FaCheckCircle } from 'react-icons/fa'
import { toast } from '../../components/Toast'
import { API_BASE_URL } from '../../config/api'

const Cart = () => {
  const { cart, updateQuantity, getTotalPrice, clearCart, removeFromCart, tableNumber } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOrdering, setIsOrdering] = useState(false)
  const [showOrderPlaced, setShowOrderPlaced] = useState(false)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [orderTotal, setOrderTotal] = useState(0)
  const [orderTableNumber, setOrderTableNumber] = useState<string | null>(null)
  
  const TAX_RATE = 0.05
  const taxAmount = getTotalPrice() * TAX_RATE
  const grandTotal = getTotalPrice() + taxAmount

  const handleQuantityChange = (id: number, newQty: number) => {
    if (newQty <= 0) removeFromCart(id)
    else updateQuantity(id, newQty)
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart()
    }
  }

  const handleContinueShopping = () => {
    navigate('/menu')
  }

  const handleProceedToCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty.')
      return
    }

    setIsOrdering(true)
    
    let userId = user?.id || null
    let customerName = user?.name || ''
    let customerEmail = user?.email || ''
    
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo)
        customerName = userInfo.name || customerName
        customerEmail = userInfo.email || customerEmail
      } catch (e) {}
    }
    
    const orderPayload = {
      user: userId,
      tableNumber: tableNumber,
      orderType: tableNumber ? 'dine-in' : 'takeaway',
      customer: {
        name: customerName,
        email: customerEmail,
        phone: '',
        address: tableNumber ? `Table ${tableNumber}` : ''
      },
      items: cart.map(item => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: grandTotal
    }

    try {
      const siteCode = localStorage.getItem('siteCode') || ''
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-site-code': siteCode
        },
        body: JSON.stringify(orderPayload)
      })

      if (response.ok) {
        // Save order details before clearing cart
        setOrderItems(cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })))
        setOrderTotal(grandTotal)
        setOrderTableNumber(tableNumber)
        // Show popup
        setShowOrderPlaced(true)
        // Keep the popup visible
        setIsOrdering(false)
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.message || 'Failed to place order. Please try again.')
        setIsOrdering(false)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Network error. Please check your connection and try again.')
      setIsOrdering(false)
    }
  }

  const handleCloseOrderPlaced = () => {
    clearCart()
    setShowOrderPlaced(false)
    navigate('/profile')
  }

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="d-flex justify-content-start mb-3">
          <Link
            to="/menu"
            className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center text-decoration-none"
            style={{ width: '40px', height: '40px' }}
          >
            <FaArrowLeft />
          </Link>
        </div>
        <div className="mb-4">
          <FaShoppingCart className="text-muted" style={{ fontSize: '4rem', opacity: 0.5 }} />
        </div>
        <h2 className="fw-bold mb-3" style={{ color: '#4F46E5' }}>Your cart is empty</h2>
        <p className="text-muted mb-4">Add something tasty from our menu!</p>
        <Link
          to="/menu"
          className="btn rounded-pill px-4 text-white text-decoration-none mx-auto"
          style={{
            background: '#4F46E5',
            border: 'none',
            padding: '12px 32px',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          Browse Menu
        </Link>
      </div>
    )
  }
  
  return (
    <>
      <div className="container py-4 py-md-5">
        <div className="d-flex align-items-center mb-4">
          <Link
            to="/menu"
            className="btn btn-outline-secondary me-3 rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
          >
            <FaArrowLeft />
          </Link>
          <h1 className="h4 fw-bold mb-0" style={{ color: '#4F46E5' }}>
            Your Order
          </h1>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-3 p-md-4">
                {cart.map((item, index) => (
                  <div
                    key={`${item.id}-${item.spiceLevel}`}
                    className="d-flex align-items-center justify-content-between border-bottom py-3 flex-wrap flex-md-nowrap"
                    style={{ gap: '12px' }}
                  >
                    <div className="d-flex align-items-center flex-grow-1" style={{ minWidth: '180px' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="rounded"
                        style={{ width: '60px', height: '60px', objectFit: 'cover', border: '2px solid #E0E7FF', flexShrink: 0 }}
                      />
                      <div className="ms-3">
                        <h6 className="fw-semibold mb-1" style={{ fontSize: '15px', color: '#1F2937' }}>
                          {item.name}
                        </h6>
                        <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '11px' }}>
                          ₹{item.price.toFixed(2)} each
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center rounded-pill" style={{ background: '#4F46E5', padding: '6px 12px', minWidth: '90px' }}>
                      <button className="btn btn-sm text-white fw-bold p-0" style={{ background: 'transparent', border: 'none', fontSize: '12px' }} onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                        <FaMinus />
                      </button>
                      <span className="fw-bold text-white mx-2" style={{ fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button className="btn btn-sm text-white fw-bold p-0" style={{ background: 'transparent', border: 'none', fontSize: '12px' }} onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                        <FaPlus />
                      </button>
                    </div>

                    <div className="fw-bold" style={{ color: '#4F46E5', fontSize: '15px', minWidth: '80px', textAlign: 'right' }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>

                    <button className="btn btn-sm rounded-circle" style={{ width: '32px', height: '32px', background: '#FEF2F2', color: '#DC2626', border: 'none' }} onClick={() => handleQuantityChange(item.id, 0)}>
                      <FaTrash size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-lg rounded-4" style={{ position: 'sticky', top: '20px' }}>
              <div className="card-header text-white rounded-top-4" style={{ background: '#4F46E5' }}>
                <h5 className="mb-0 fw-semibold">Order Summary</h5>
              </div>

              <div className="card-body p-4">
                {tableNumber && (
                  <div className="mb-3 p-3 rounded-3" style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)', color: 'white' }}>
                    <div className="d-flex align-items-center">
                      <span className="me-2 fs-5">🍽</span>
                      <div>
                        <small className="d-block opacity-75" style={{ fontSize: '11px' }}>Dining at</small>
                        <strong>Table {tableNumber}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Subtotal:</span>
                  <span className="fw-bold" style={{ color: '#4F46E5' }}>₹{getTotalPrice().toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Tax (5%):</span>
                  <span className="fw-bold" style={{ color: '#4F46E5' }}>₹{taxAmount.toFixed(2)}</span>
                </div>

                <hr style={{ borderColor: '#E5E7EB' }} />

                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold fs-5" style={{ color: '#1F2937' }}>Total Amount:</span>
                  <span className="fw-bold fs-5" style={{ color: '#4F46E5' }}>₹{grandTotal.toFixed(2)}</span>
                </div>

                <button
                  className="btn w-100 mb-3 fw-semibold rounded-pill py-2 text-white d-flex align-items-center justify-content-center"
                  disabled={isOrdering}
                  style={{ background: '#4F46E5', border: 'none' }}
                  onClick={handleProceedToCheckout}
                >
                  {isOrdering ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="me-2" />
                      Place order
                    </>
                  )}
                </button>

                <button className="btn btn-outline w-100 mb-2 fw-semibold rounded-pill py-2" style={{ borderColor: '#4F46E5', color: '#4F46E5' }} onClick={handleContinueShopping}>
                  <FaShoppingBag className="me-2" />
                  Continue Shopping
                </button>

                <button className="btn w-100 fw-semibold rounded-pill py-2" style={{ background: '#FEF2F2', color: '#DC2626', border: 'none' }} onClick={handleClearCart}>
                  <FaTrash className="me-2" />
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Placed Success Popup */}
      {showOrderPlaced && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          onClick={handleCloseOrderPlaced}
        >
          <div 
            style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', maxWidth: '400px', margin: '20px', cursor: 'default' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FaCheckCircle className="text-white" size={40} />
            </div>
            <h3 className="fw-bold mb-3" style={{ color: '#1F2937' }}>Order Placed!</h3>
            <p className="text-muted mb-4">
              Your order has been placed successfully.<br />
              Please wait for a few minutes while we prepare your delicious food.
            </p>
            {orderTableNumber && (
              <div style={{ background: '#EEF2FF', color: '#4F46E5', padding: '12px', borderRadius: '10px', display: 'inline-block', marginBottom: '20px' }}>
                <strong>🍽 Table {orderTableNumber}</strong>
              </div>
            )}
            {orderItems.length > 0 && (
              <div style={{ textAlign: 'left', marginBottom: '20px', padding: '10px', background: '#f9fafb', borderRadius: '10px' }}>
                <strong style={{ fontSize: '12px', color: '#6b7280' }}>ORDER SUMMARY</strong>
                {orderItems.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '5px' }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span style={{ color: '#4F46E5' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                {orderItems.length > 3 && <div style={{ fontSize: '12px', color: '#6b7280' }}>+{orderItems.length - 3} more items</div>}
                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Total</span>
                  <span style={{ color: '#4F46E5' }}>₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gap: '10px' }}>
              <button className="btn rounded-pill py-2 text-white fw-semibold" style={{ background: '#4F46E5', border: 'none' }} onClick={handleCloseOrderPlaced}>
                View My Orders
              </button>
              <button className="btn rounded-pill py-2 fw-semibold" style={{ border: '2px solid #4F46E5', color: '#4F46E5', background: 'transparent' }} onClick={() => { setShowOrderPlaced(false); navigate('/menu') }}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Cart
