'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography,CircularProgress } from '@mui/material'
export default function CandidatePage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [loading,setLoading]=useState(true) 

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      const token = sessionStorage.getItem('token')
      const userStr = sessionStorage.getItem('user')
      if (!userStr) {
  setLoading(false)
  router.push('/auth/login')
  return
}

const user = JSON.parse(userStr) // ✅ parse string to object

        if (!token || !user) {
          setLoading(false)
          router.push('/auth/login')
          return
        }
        if(user.role !== 'candidate') {
          setLoading(false)
          router.push('/auth/login')
          return
        }
        // ✅ Check if verified
      if (!user.isVerified) {
        setLoading(false)
        router.push('/auth/login')
        return
      }

      setTimeout(() => {
  setLoading(false)
  router.push('/candidate/dashboard')
}, 2000)
    }
  }, [router, isClient])

  if (!isClient) {
    return null
  }
   if (loading) {
    return (
      <Box
        sx={{
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          gap: 3
        }}
      >
        <CircularProgress size={32} sx={{ color: '#49BBBD' }} />
         <Typography
                          variant="h6" 
                          sx={{ 
                            color: '#49BBBD',
                            fontWeight: 500
                          }}
                        >
                          Loading ...
                        </Typography>
      </Box>
    )
  }
  return null
}
