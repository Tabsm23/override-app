import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

function parseHasPaid(profile) {
  if (!profile) return false
  const value = profile.has_paid
  return value === true || value === 'true' || value === 1
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, has_paid, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Failed to load profile:', error.message)
    return null
  }

  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    const data = await fetchProfile(userId)
    setProfile(data)
    return data
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return null
    }
    return loadProfile(user.id)
  }, [user, loadProfile])

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      const sessionUser = session?.user ?? null
      setUser(sessionUser)

      if (sessionUser) {
        await loadProfile(sessionUser.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)

      if (!sessionUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      // Do not await inside onAuthStateChange — it can deadlock the Supabase client.
      setLoading(true)
      fetchProfile(sessionUser.id).then((data) => {
        if (!mounted) return
        setProfile(data)
        setLoading(false)
      })
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(
    (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    [],
  )

  const signUp = useCallback(
    (email, password) =>
      supabase.auth.signUp({ email, password }),
    [],
  )

  const signOut = useCallback(() => supabase.auth.signOut(), [])

  const hasPaid = parseHasPaid(profile)

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isLoggedIn: Boolean(user),
      hasPaid,
      email: profile?.email ?? user?.email ?? null,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, hasPaid, signIn, signUp, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
