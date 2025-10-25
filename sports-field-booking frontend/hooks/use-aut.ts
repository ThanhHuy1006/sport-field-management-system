"use client"

import { useState, useEffect } from "react"
import { loginUser, registerUser, refreshToken } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<{ id: number; role: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ Kiểm tra token khi load trang
  useEffect(() => {
    const token = localStorage.getItem("token")
    const refresh = localStorage.getItem("refresh")
    if (!token && refresh) {
      refreshToken(refresh)
        .then((d) => localStorage.setItem("token", d.accessToken))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password)
    localStorage.setItem("token", data.accessToken)
    localStorage.setItem("refresh", data.refreshToken)
    setUser(data.user)
  }

  const register = async (email: string, password: string, name?: string) => {
    const data = await registerUser(email, password, name)
    localStorage.setItem("token", data.accessToken)
    localStorage.setItem("refresh", data.refreshToken)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refresh")
    setUser(null)
  }

  return { user, loading, login, register, logout }
}
