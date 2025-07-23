import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

export function AuthWrapper() {
  const [isLogin, setIsLogin] = useState(true)

  return isLogin ? (
    <LoginForm onToggleMode={() => setIsLogin(false)} />
  ) : (
    <SignupForm onToggleMode={() => setIsLogin(true)} />
  )
}