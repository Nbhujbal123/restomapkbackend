import React from 'react'
import { useNavigate } from 'react-router-dom'
import Login from '../pages/customer/Login'
import { useAuth } from '../context/AuthContext'

const LoginWrapper: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleClose = () => {
    navigate('/')
  }

  const handleSwitchToSignup = () => {
    navigate('/signup')
  }

  const handleLogin = (_email: string, _password: string, _siteCode?: string) => {
    // In a real app, this would validate against the API
    // For now, create a mock user based on the email
    const mockUser = {
      id: '1',
      name: 'Customer',
      email: _email,
      phone: '',
      profilePicture: '',
      siteCode: _siteCode || ''
    }
    // Store siteCode if provided
    if (_siteCode) {
      localStorage.setItem('siteCode', _siteCode)
    }
    login(mockUser)
    navigate('/profile')
  }

  return (
    <Login 
      onClose={handleClose}
      onSwitchToSignup={handleSwitchToSignup}
      onLogin={handleLogin}
    />
  )
}

export default LoginWrapper
