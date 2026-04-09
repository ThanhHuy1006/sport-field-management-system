"use client"

import React, { useEffect, useState } from "react"

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")

  useEffect(() => {
    setMounted(true)
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark" | "system") || "system"
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = document.documentElement
    let themeToApply = newTheme

    if (newTheme === "system") {
      themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }

    if (themeToApply === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  const value = {
    theme,
    setTheme: (newTheme: "light" | "dark" | "system") => {
      setTheme(newTheme)
      localStorage.setItem("theme", newTheme)
      applyTheme(newTheme)
    },
  }

  if (!mounted) return <>{children}</>

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const ThemeContext = React.createContext<{
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}>({
  theme: "system",
  setTheme: () => {},
})

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
