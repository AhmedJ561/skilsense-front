'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CircularProgress, Box, Card, CardContent, Typography, TextField, Button, Checkbox, FormControlLabel, Link as MuiLink, InputAdornment } from '@mui/material'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { useTheme } from '@mui/material/styles'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const theme = useTheme()
  const login = useAuthStore((state) => state.login)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await login(email, password)
      // 🔥 Case 1: Requires email verification
      if (res.requiresVerification) {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        return;
      }

      if (!res.success) {
        setError(res.message)
      } else {
        if (res.access_token && res.user) {
          sessionStorage.setItem('token', res.access_token)
          sessionStorage.setItem('user', JSON.stringify(res.user))

          const role = res.user.role
          if (role === 'candidate') router.push('/candidate')
          else if (role === 'company') router.push('/company')
        } else {
          setError('Login failed: missing token or user data')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        background: 'linear-gradient(-45deg, #49BBBD, #49BBBD, #0d9488, #49BBBD)',
        backgroundSize: '400% 400%',
        animation: 'premiumGradientFlow 15s ease infinite',
        position: 'relative',
        minHeight: '100vh',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* LEFT SIDE - FORM */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 60%' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          p: { xs: 2, sm: 3, md: 2 },
          position: 'relative',
          zIndex: 10,
          overflowY: 'auto',
        }}
      >
        <Card elevation={0} sx={{ p: 2, background: 'transparent', border: 'none', boxShadow: 'none' }}>
          <CardContent sx={{ p: 0, pt: 3 }}>
            {/* Logo + Header */}
            <Box sx={{ textAlign: 'center', mb: 4, width: { xs: '100%', sm: '400px' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    background: 'white',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 206, 209, 0.25)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1, width: 48, height: 48 }}>
                    <Image src="/logo.svg" alt="SkillSense Logo" fill style={{ objectFit: 'contain' }} />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', lineHeight: 1 }}>
                    SkillSense
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem', fontWeight: 500, display: 'block', mt: 0.25 }}>
                    AI Interview Platform
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>Welcome Back</Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Sign in to your SkillSense account</Typography>
            </Box>

            {/* FORM */}
            <Box component="form" onSubmit={handleSubmit}>
              {/* EMAIL */}
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Email Address</Typography>
                <TextField
                  type="email"
                  fullWidth
                  required
                  size="small"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'black',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'black',
                        borderWidth: 2,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} color="white" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* PASSWORD */}
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Password</Typography>
                <TextField
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  size="small"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'black',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'black',
                        borderWidth: 2,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"  >
                        <Lock size={18} color="white" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ minWidth: 'auto', p: 0, color: 'white' }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* REMEMBER + FORGOT */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      sx={{
                        color: 'white',
                        '&.Mui-checked': {
                          color: '#49BBBD',
                        },
                        '&.Mui-checked .MuiSvgIcon-root': {
                          fill: 'white',
                        },
                      }}
                    />
                  }
                  label="Remember me"
                />
                <MuiLink href="#" sx={{ color: 'white', fontSize: '0.875rem', fontWeight: 600, '&:hover': { color: '#dbf1f2', textDecoration: 'underline' } }}>
                  Forgot password?
                </MuiLink>
              </Box>

              {/* ERROR */}
              {error && <Typography color="error" sx={{ fontSize: '0.875rem' }}>{error}</Typography>}

              {/* SIGN IN BUTTON */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <LogIn size={18} />}
                  sx={{
                    background: 'white',
                    width: 200,
                    borderRadius: '20px',
                    color: '#49BBBD',
                    fontWeight: 700,
                    '&:hover': { background: 'white', transform: 'translateY(-2px)' },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #00CED1, #33D8DA)',
                      color: 'white',
                      opacity: 0.7,
                    },
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
            </Box>

            {/* REGISTER LINK */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Don&apos;t have an account?{' '}
                <Link href="/auth/register?role=candidate" passHref legacyBehavior>
                  <MuiLink sx={{ color: 'white', fontWeight: 600, '&:hover': { color: '#dbf1f2', textDecoration: 'underline' } }}>
                    Register here
                  </MuiLink>
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* RIGHT SIDE - IMAGE */}
      <Box sx={{ flex: '0 0 40%', display: { xs: 'none', md: 'block' }, backgroundImage: `url('/auth/login.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
    </Box>
  )
}
