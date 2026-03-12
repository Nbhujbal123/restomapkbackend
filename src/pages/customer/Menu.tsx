import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import type { MenuItem } from '../../context/CartContext'
import { FaPlus, FaMinus } from 'react-icons/fa'
import LoadingSpinner from '../../components/LoadingSpinner'
import SkeletonLoader from '../../components/SkeletonLoader'
import { toast } from '../../components/Toast'
import { API_BASE_URL } from '../../config/api'

const Menu: React.FC = () => {
  const { addToCart, cart, updateQuantity } = useCart()
  const location = useLocation()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restaurantInactive, setRestaurantInactive] = useState(false)

  // 🟢 FIX 1: Initialize selectedCategory using a function that reads the URL immediately
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const urlParams = new URLSearchParams(location.search)
    const category = urlParams.get('category')
    return (category && category !== 'All Items') ? category : 'All'
 
  })

  // Initialize selectedType to 'veg' as default if nothing is found
  const [selectedType, setSelectedType] = useState(
    localStorage.getItem('selectedType') || 'veg'
  )
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<{ [key: number]: 'mild' | 'medium' | 'hot' }>({})

  // 🟢 Detect and store table number from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tableParam = urlParams.get('table')
    if (tableParam) {
      localStorage.setItem('tableNumber', tableParam)
    }
  }, [location.search])

  // 🟢 FIX 2: Refactor useEffect. It is now only needed for selectedType logic 
  // or external state changes, but we'll keep the category logic just in case 
  // the URL changes later in the app's lifecycle (though initial load is fixed above).
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const category = urlParams.get('category')
    const typeFromUrl = urlParams.get('type')

    // Set category if provided (for subsequent location changes, not initial load)
    if (category && category !== 'All Items' && category !== selectedCategory) {
      setSelectedCategory(category)
    }

    // Update selected type state
    const type = typeFromUrl || localStorage.getItem('selectedType') || 'veg'
    setSelectedType(type)
  }, [location.search, selectedCategory])

  // 🟢 Hide Veg/Non-Veg buttons only for Desserts, Beverages & Kids.
  // This now uses the correctly initialized selectedCategory.
  const hideTypeFilter = selectedCategory === 'Desserts' || selectedCategory === 'Beverages' || selectedCategory === 'Kids'

  const categories = ['All', 'Starters', 'Main Course', 'Beverages', 'Desserts']

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true)
      setError(null)
      try {
        // Get siteCode from URL first, then localStorage as fallback
        const urlParams = new URLSearchParams(window.location.search)
        let siteCode = urlParams.get('siteCode') || localStorage.getItem('siteCode') || ''
        
        // Ensure siteCode is uppercase for consistency
        siteCode = siteCode.toUpperCase()
        
        // Store in localStorage if came from URL
        if (urlParams.get('siteCode') && !localStorage.getItem('siteCode')) {
          localStorage.setItem('siteCode', siteCode)
        }
        
        console.log('Fetching menu items with siteCode:', siteCode)
        
        const response = await fetch(`${API_BASE_URL}/menu?siteCode=${siteCode}`, {
          headers: {
            'x-site-code': siteCode
          }
        })
        
        // Check if restaurant is active
        const restaurantResponse = await fetch(`${API_BASE_URL}/restaurants/${siteCode}`)
        
        if (restaurantResponse.ok) {
          const restaurantData = await restaurantResponse.json()
          if (restaurantData.status !== 'ACTIVE') {
            setRestaurantInactive(true)
            setLoading(false)
            return
          }
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch menu items: ${response.statusText}`)
        }
        const data = await response.json()
        setMenuItems(data)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load menu items'
        setError(errorMessage)
        toast.error('Failed to load menu. Please try again later.')
        console.error('Error fetching menu items:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMenuItems()
  }, [location.search])

  // Render loading skeleton
  if (loading) {
    return (
      <div
        className="container py-5"
        style={{
          background: 'linear-gradient(to bottom, #f8f7ff, #eef0ff)',
          minHeight: '100vh'
        }}
      >
        <div className="row">
          <div className="col-12 text-center">
            <div className="d-flex justify-content-center mb-4">
              <div style={{ height: '45px', width: '60%', maxWidth: '400px', borderRadius: '50px', background: '#e0e0e0' }}></div>
            </div>
            <div className="d-flex justify-content-center mb-4 flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ height: '40px', width: '100px', borderRadius: '50px', background: '#e0e0e0' }}></div>
              ))}
            </div>
          </div>
        </div>
        <SkeletonLoader type="card" count={6} />
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div
        className="container py-5"
        style={{
          background: 'linear-gradient(to bottom, #f8f7ff, #eef0ff)',
          minHeight: '100vh'
        }}
      >
        <div className="text-center py-5">
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>😕</div>
          <h4 className="fw-bold mb-3" style={{ color: '#4F46E5' }}>Unable to Load Menu</h4>
          <p className="text-muted mb-4">{error}</p>
          <button
            className="btn btn-primary px-4 py-2 rounded-pill"
            style={{ background: '#4F46E5', border: 'none' }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Render inactive restaurant state
  if (restaurantInactive) {
    return (
      <div
        className="container py-5"
        style={{
          background: 'linear-gradient(to bottom, #f8f7ff, #eef0ff)',
          minHeight: '100vh'
        }}
      >
        <div className="text-center py-5">
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔒</div>
          <h4 className="fw-bold mb-3" style={{ color: '#dc2626' }}>Restaurant is Currently Inactive</h4>
          <p className="text-muted mb-4">This restaurant is not active at the moment.</p>
          <p className="text-muted">Please contact the Super Admin to activate your restaurant.</p>
        </div>
      </div>
    )
  }

  // Filter items based on category, type, and search
  const filteredItems = menuItems.filter(item => {
    const matchCategory =
      selectedCategory === 'All' || item.category === selectedCategory

    // Logic to match all types if the filter is hidden (Desserts/Beverages/Kids)
    // For 'All' category, only show all types if no specific type is selected, otherwise filter by selected type
    const matchType = hideTypeFilter
      ? true
      : selectedCategory === 'All' && selectedType === 'all'
        ? true
        : item.foodType.toLowerCase().replace('-', '') === selectedType.toLowerCase().replace('-', '')
      
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchType && matchSearch
  })

  // Group items by category for display when 'All' is selected
  const groupedItems =
    selectedCategory === 'All'
      ? filteredItems.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = []
          acc[item.category].push(item)
          return acc
        }, {} as Record<string, MenuItem[]>)
      : {}

  const handleAddToCart = (item: MenuItem) => {
    const spiceLevel = selectedSpiceLevels[item.id] || 'medium'
    addToCart(item, spiceLevel)
  }

  const handleSpiceLevelChange = (itemId: number, spiceLevel: 'mild' | 'medium' | 'hot') => {
    setSelectedSpiceLevels(prev => ({
      ...prev,
      [itemId]: spiceLevel
    }))
  }

  const renderItem = (item: MenuItem) => {
    const cartItem = cart.find(cartItem => cartItem.id === item.id)
    const quantity = cartItem ? cartItem.quantity : 0

    return (
      <div key={item.id} className="col-12 col-sm-6 col-lg-4">
        <div
          className="card border-0 shadow-sm position-relative"
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out',
            background: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          {/* Image */}
          <div className="position-relative">
            <img
              src={item.image}
              className="card-img-top"
              alt={item.name}
              style={{
                height: '200px',
                width: '100%',
                objectFit: 'cover'
              }}
            />
            <div className="position-absolute top-0 end-0 p-2">
              {item.foodType === 'veg' && <span className="badge bg-success">🥦 Veg</span>}
              {item.foodType === 'non-veg' && <span className="badge bg-danger">🍗 Non-Veg</span>}
            </div>
          </div>

          {/* Content */}
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h6 className="card-title fw-bold text-dark mb-0" style={{ fontSize: '16px' }}>
                {item.name}
              </h6>
              <div className="d-flex gap-1">
                {(item.category === 'Starters' || item.category === 'Main Course') && (
                  <span
                    className={`badge ${
                      item.spiceLevel === 'hot'
                        ? 'bg-danger'
                        : item.spiceLevel === 'medium'
                        ? 'bg-warning'
                        : 'bg-success'
                    } text-white`}
                    style={{ fontSize: '10px' }}
                  >
                    {item.spiceLevel}
                  </span>
                )}
              </div>
            </div>

            <p className="card-text text-muted small mb-3" style={{ fontSize: '13px', lineHeight: '1.3' }}>
              {item.description}
            </p>

            <div className="d-flex justify-content-between align-items-center">
              <span
                className="fw-bold"
                style={{
                  fontSize: '16px',
                  color: '#4F46E5'
                }}
              >
                ₹{item.price.toFixed(2)}
              </span>

              <div className="d-flex align-items-center gap-2">
                {(item.category === 'Starters' || item.category === 'Main Course') && (
                  <div className="d-flex gap-1">
                    {(['mild', 'medium', 'hot'] as const).map(spice => (
                      <button
                        key={spice}
                        className={`btn btn-xs rounded-pill px-2 py-1 ${
                          selectedSpiceLevels[item.id] === spice ? 'text-white' : 'btn-outline-secondary'
                        }`}
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          background:
                            selectedSpiceLevels[item.id] === spice
                              ? '#4F46E5'
                              : undefined,
                          border: 'none',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onClick={() => handleSpiceLevelChange(item.id, spice)}
                      >
                        {spice.charAt(0).toUpperCase() + spice.slice(1)}
                      </button>
                    ))}
                  </div>
                )}

                {quantity > 0 && (
                  <div className="d-flex align-items-center ms-2">
                    <div
                      className="d-flex align-items-center rounded-pill px-2 py-1"
                      style={{
                        background: '#4F46E5',
                        border: '2px solid #4F46E5',
                        minWidth: '80px',
                        justifyContent: 'space-between'
                      }}
                    >
                      <button
                        className="btn btn-xs fw-bold p-0"
                        style={{
                          backgroundColor: 'transparent',
                          color: 'white',
                          border: 'none',
                          width: '20px',
                          height: '20px',
                          fontSize: '12px'
                        }}
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                      >
                        <FaMinus />
                      </button>
                      <span
                        className="fw-bold text-white"
                        style={{
                          fontSize: '14px',
                          minWidth: '20px',
                          textAlign: 'center'
                        }}
                      >
                        {quantity}
                      </span>
                      <button
                        className="btn btn-xs fw-bold p-0"
                        style={{
                          backgroundColor: 'transparent',
                          color: 'white',
                          border: 'none',
                          width: '20px',
                          height: '20px',
                          fontSize: '12px'
                        }}
                        onClick={() => handleAddToCart(item)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                )}

                {quantity === 0 && (
                  <button
                    className="btn btn-sm rounded-pill px-3 py-2 fw-semibold ms-2"
                    style={{
                      background: '#4F46E5',
                      color: 'white',
                      border: 'none',
                      fontSize: '13px'
                    }}
                    onClick={() => handleAddToCart(item)}
                  >
                    <FaPlus className="me-1" />
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="container py-5"
      style={{
        background: 'linear-gradient(to bottom, #f8f7ff, #eef0ff)',
        minHeight: '100vh'
      }}
    >
      <div className="row">
        <div className="col-12 text-center">
          {/* 🔍 Search Bar */}
          <div className="d-flex justify-content-center mb-4">
            <input
              type="text"
              className="form-control w-75 w-md-50"
              placeholder="Search for an item..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                borderRadius: '50px',
                padding: '12px 20px',
                border: '2px solid #4F46E5',
                outline: 'none',
                maxWidth: '500px',
                background: 'white',
                color: '#333',
                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
              }}
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="d-flex justify-content-center mb-4 flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                className={`btn ${
                  selectedCategory === category
                    ? 'text-white shadow-sm'
                    : 'btn-outline-secondary'
                } px-4 py-2 rounded-pill fw-semibold`}
                onClick={() => setSelectedCategory(category)}
                style={{
                  transition: 'all 0.2s ease',
                  background: selectedCategory === category ? '#4F46E5' : undefined,
                  border: 'none',
                  fontSize: '14px',
                  minWidth: '100px'
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="d-flex justify-content-center mb-5">
            <div
              className="d-flex gap-2 overflow-auto pb-2 px-2"
              style={{
                maxWidth: '100%',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Veg/Non-Veg buttons are displayed/hidden based on selectedCategory */}
              {!hideTypeFilter && (
                <>
                  <button
                    type="button"
                    className={`btn ${
                      selectedType === 'veg' ? 'text-white shadow-sm' : 'btn-outline-secondary'
                    } px-3 py-2 px-md-4 py-md-2 rounded-pill fw-semibold d-flex align-items-center gap-2 flex-shrink-0`}
                    onClick={() => setSelectedType('veg')}
                    style={{
                      transition: 'all 0.2s ease',
                      background:
                        selectedType === 'veg'
                          ? '#22c55e'
                          : undefined,
                      border: 'none',
                      whiteSpace: 'nowrap',
                      fontSize: '14px'
                    }}
                  >
                    🥦 Veg
                  </button>

                  <button
                    type="button"
                    className={`btn ${
                      selectedType === 'nonveg' ? 'text-white shadow-sm' : 'btn-outline-secondary'
                    } px-3 py-2 px-md-4 py-md-2 rounded-pill fw-semibold d-flex align-items-center gap-2 flex-shrink-0`}
                    onClick={() => setSelectedType('nonveg')}
                    style={{
                      transition: 'all 0.2s ease',
                      background:
                        selectedType === 'nonveg'
                          ? '#ef4444'
                          : undefined,
                      border: 'none',
                      whiteSpace: 'nowrap',
                      fontSize: '14px'
                    }}
                  >
                    🍗 Non-Veg
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🍽 Menu Items */}
      {selectedCategory === 'All' ? (
        Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-5">
            <h3
              className="text-center mb-4 fw-bold"
              style={{
                color: '#4F46E5'
              }}
            >
              {category}
            </h3>
            <div className="row g-3 g-md-4">{items.map(item => renderItem(item))}</div>
          </div>
        ))
      ) : (
        <div className="row g-3 g-md-4">
          {filteredItems.map(item => renderItem(item))}
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-5">
          <div className="text-center p-4">
            <img src="/assets/images/no-dishes.png" alt="No dishes found" style={{ width: '230px' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Menu