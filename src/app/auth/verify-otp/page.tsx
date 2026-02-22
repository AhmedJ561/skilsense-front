'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {  Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useAuthStore } from '@/store/authStore'

function OtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [redirectPath, setRedirectPath] = useState('')
  const { verifyOtp, resendOtp } = useAuthStore()
 
  const [mounted,setMounted]=useState(false)
  useEffect(()=>{
    setMounted(true)
  })
  useEffect(() => {
    if (!email) {
      router.push('/auth/login')
    }
  }, [email, router])

  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      console.log('Redirecting to:', redirectPath)
      router.push(redirectPath)
    }
  }, [shouldRedirect, redirectPath, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsVerifying(true)

    try {
      const response = await verifyOtp(email, otp)
      console.log('OTP Response:', response)
      if (response.success) {
        console.log('OTP Response:', response) // Debug log
        setSuccess(response.message || 'OTP verified successfully')

        // Set redirect data instead of direct navigation
        const path = response.user?.role === 'candidate' ? '/candidate/complete-profile' : 
                     response.user?.role === 'company' ? '/company' : '/'
        setRedirectPath(path)
        setShouldRedirect(true)
      } else {
        setIsVerifying(false)
        setError(response.message || 'OTP verification failed')
      }
    } catch (err: any) {
      setIsVerifying(false)
      setError(err.message || 'Something went wrong')
    } finally {
      setIsVerifying(false)
      setIsResending(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setSuccess('')
    setIsResending(true)

    try {
      const response = await resendOtp(email)
      
      if (response.success) {
        setSuccess('OTP has been resent to your email')
      } else {
        setIsResending(false)
        setError(response.message || 'Failed to resend OTP')
      }
    } catch (err: any) {
      setIsResending(false)
      setError(err.message || 'Something went wrong')
    } finally {
      setIsVerifying(false)
      setIsResending(false)
    }
  }
   if (!mounted) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(-45deg, #49BBBD, #49BBBD, #0d9488, #49BBBD)',
            backgroundSize: '400% 400%',
          }}
        >
          <CircularProgress sx={{color:'white'}} />
        </Box>
      )
    }
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(-45deg, #49BBBD, #49BBBD, #0d9488, #49BBBD)',
        backgroundSize: '400% 400%',
        animation: 'premiumGradientFlow 15s ease infinite',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* LEFT SIDE - FORM */}
      <Box
        sx={{
          flex: '0 0 60%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2, sm: 4, md: 2 },
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Card sx={{ 
          maxWidth: 400, 
          width: '100%', 
          p: 4,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none !important',
        }}>
          <CardContent>
            {/* Back to Login */}
            <Box 
              onClick={() => router.back()}
              sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 3,
                color: 'white',
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              <ArrowLeft size={16} />
              Back
            </Box>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                Verify Email
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Enter the OTP sent to:
              </Typography>
              <Typography sx={{ fontWeight: 600, color: 'white' }}>
                {email}
              </Typography>
            </Box>

            {/* Error and Success Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Enter OTP"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                fullWidth
                required
                InputLabelProps={{
                  style: { color: 'black' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'black',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'black',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isVerifying || otp.length !== 6}
                startIcon={isVerifying ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={20} />}
                sx={{
                  background: 'white',
                  width: '200px',
                  mx: 'auto',
                  borderRadius: '20px',
                  color: '#49BBBD',
                  fontWeight: 700,
                  '&:hover': {
                    background: 'white',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'white',
                    color: '#49BBBD',
                    opacity: 0.7,
                  },
                }}
              >
                { isVerifying ? 'Verifying...' : 'Verify Email'}
              </Button>

              <Box sx={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Didn't receive the OTP?{' '}
                </Typography>
                <Typography 
                  variant="body2" 
                  onClick={!isResending ? handleResendOtp : undefined}
                  sx={{
                    color: '#FF9933',
                    cursor: isResending ? 'not-allowed' : 'pointer',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: isResending ? 'none' : 'underline',
                    },
                    opacity: isResending ? 0.7 : 1,
                    fontWeight: 600
                  }}
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* RIGHT SIDE - IMAGE */}
      <Box
        sx={{
          flex: '0 0 40%',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Box
            component="img"
            src="/auth/verifyotp.jpg"
            alt="Email Verification"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.9) contrast(1.1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(73, 187, 189, 0.3), rgba(13, 148, 136, 0.2))',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center', color: 'white', p: 4 }}>
              <Box sx={{ mb: 2, opacity: 0.9 }}>
                <Lock size={80} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                Secure Verification
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 300 }}>
                Your security is our priority. We use industry-standard encryption to protect your data.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function OtpPage() {
  
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <OtpContent />
    </Suspense>
  )
}
