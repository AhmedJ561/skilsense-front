'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function CompanyPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
   const [loading, setLoading] = useState(true)
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      const token = sessionStorage.getItem('token')
      const user = sessionStorage.getItem('user')

      if (!token || !user) {
         setLoading(false)
        router.push('/auth/login')
        return
      }

      if (JSON.parse(user).role !== 'company') {
         setLoading(false)
        router.push('/auth/login')
        return
      }
     setTimeout(() => {
  setLoading(false)
  router.push('/company/dashboard')
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
        <CircularProgress size={32} sx={{color:'white'}} />
         <Typography
                  variant="h6" 
                  sx={{ 
                    color: 'white',
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
