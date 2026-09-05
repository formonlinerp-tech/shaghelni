'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserSession } from '../types'

export function useSession() {
  const [data, setData] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/auth/session')
      const result = await res.json()
      if (result.success && result.data) {
        setData(result.data)
      } else {
        setData(null)
      }
    } catch (err) {
      setError('فشل تحميل الجلسة')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const refresh = useCallback(() => {
    fetchSession()
  }, [fetchSession])

  return { data, isLoading, error, refresh }
}