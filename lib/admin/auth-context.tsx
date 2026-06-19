"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth"
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase/client"
import { isAllowedEmail } from "@/lib/admin/allowlist"

interface AuthContextValue {
  user: User | null
  loading: boolean
  allowed: boolean
  configured: boolean
  signIn: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (u: User | null) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured,
      allowed: Boolean(user && isAllowedEmail(user.email)),
      signIn: async () => {
        const result = await signInWithPopup(auth, googleProvider)
        // Reject anyone outside the allowlist immediately.
        if (!isAllowedEmail(result.user.email)) {
          await fbSignOut(auth)
          throw new Error("Tu cuenta no está autorizada para entrar al panel.")
        }
      },
      logout: () => fbSignOut(auth),
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
