'use client'

import { useState, Suspense, useRef } from 'react'
import Image from 'next/image'
import { Mail, Lock, User, Building2, UserPlus, MapPin, Briefcase, Globe, Users, EyeOff, Eye } from 'lucide-react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Checkbox,
  Link as MuiLink,
  InputAdornment,

  MenuItem,

  CircularProgress,
} from '@mui/material'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
function RegisterContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const authStore = useAuthStore()
  let roleParam = searchParams.get('role')
  const [role, setRole] = useState(roleParam)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
    website: '',
    address: '',
    size: '',
    founded: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const foundedInputRef = useRef<HTMLInputElement>(null)

  const handleOpenFoundedPicker = () => {
    const input = foundedInputRef.current
    if (!input) return
    input.focus()
    if (input.showPicker) {
      input.showPicker()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (e: any) => {
    setFormData(prev => ({ ...prev, [name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ✅ 1. Validate required fields
      if (!formData.name.trim()) {
        setError('Full name is required');
        return;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        return;
      }
      if (!formData.password) {
        setError('Password is required');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (!formData.confirmPassword) {
        setError('Confirm password is required');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!role) {
        setError('Please select a role');
        return;
      }

      // ✅ 2. Validate formats
      // Full name: only letters and spaces
      if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
        setError('Full name must contain only letters and spaces');
        return;
      }

      // Email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Invalid email format');
        return;
      }

      if (role === 'company') {
        // Company-specific validations
        if (!formData.companyName.trim()) {
          setError('Company name is required');
          return;
        }
        if (!/^[a-zA-Z0-9\s]+$/.test(formData.companyName)) {
          setError('Company name must contain only letters, numbers, and spaces');
          return;
        }

        if (!formData.industry.trim()) {
          setError('Industry is required');
          return;
        }
        if (!/^[a-zA-Z\s]+$/.test(formData.industry)) {
          setError('Industry must contain only letters and spaces');
          return;
        }

        if (!formData.website.trim()) {
          setError('Website is required');
          return;
        }
        if (!/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(formData.website)) {
          setError('Website must be a valid URL');
          return;
        }

        if (!formData.address.trim()) {
          setError('Address is required');
          return;
        }

        if (!formData.size.trim()) {
          setError('Company size is required');
          return;
        }
        if (!/^[0-9]+(-[0-9]+)?$/.test(formData.size)) {
          setError('Size must be a number or range (e.g. 50 or 50-200)');
          return;
        }

        if (!formData.founded.trim()) {
          setError('Founded date is required');
          return;
        }
        if (isNaN(Date.parse(formData.founded))) {
          setError('Founded must be a valid date');
          return;
        }
      }

      // ✅ 3. Submit form to API
      let res;
      if (role === 'candidate') {
        res = await authStore.registerCandidate({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });
      } else {
        res = await authStore.registerCompany({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          companyName: formData.companyName,
          industry: formData.industry,
          website: formData.website,
          address: formData.address,
          size: formData.size,
          founded: formData.founded,
        });
      }

      if (res.user && res.success && res.access_token) {
        sessionStorage.setItem('user', JSON.stringify(res.user));
        sessionStorage.setItem('token', res.access_token);
        router.push(`/auth/verify-otp?email=${encodeURIComponent(res.user.email)}`);
      } else {
        setError(res.message || 'Registration failed');
      }

    } catch (error: any) {
      setError(error.message || 'Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);

    // Update URL query parameter
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('role', newRole);

    // Push new URL
    router.push(`/auth/register?${currentParams.toString()}`);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(-45deg, #49BBBD, #49BBBD, #0d9488, #49BBBD)',
        backgroundSize: '400% 400%',
        animation: 'premiumGradientFlow 15s ease infinite',
        position: 'relative',
        overflow: 'hidden',

        // mobile = only form, image hidden
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* Animated Background Elements */}


      {/* LEFT SIDE - FORM */}
      <Box
        sx={{
          flex: '0 0 60%',
          display: 'flex',
          justifyContent: 'center',
          background: 'transparent',
          alignItems: 'flex-start',
          p: { xs: 2, sm: 4, md: 2 },
          position: 'relative',
          zIndex: 10,
          overflowY: 'auto',
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: 2,
            background: 'transparent',
            border: 'none',
            boxShadow: 'none !important',
          }}
        >

          <CardContent sx={{ p: 0, border: 'none', boxShadow: 'none' }}>

            <Box sx={{ textAlign: 'center' }}>
              {/* SkillSense Logo */}
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
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                      transform: 'translateX(-100%)',
                      animation: 'shimmer 3s infinite',
                    },
                    '@keyframes shimmer': {
                      '0%': { transform: 'translateX(-100%)' },
                      '100%': { transform: 'translateX(100%)' },
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1, width: 48, height: 48 }}>
                    <Image src="/logo.svg" alt="SkillSense Logo" fill style={{ objectFit: 'contain' }} />
                  </Box>
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    component="span"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    SkillSense
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      display: 'block',
                      mt: 0.25,
                    }}
                  >
                    AI Interview Platform
                  </Typography>
                </Box>
              </Box>
              {/* Role Toggle */}
              <Box sx={{
                display: 'inline-flex',
                gap: { xs: 0, sm: 0, md: 2 },
                mb: 3,
                justifyContent: 'center',
                position: 'relative',
                background: 'white',
                borderRadius: '20px',
                p: 1,
                mx: 'auto',
              }}>
                <Button
                  variant={role === 'candidate' ? 'contained' : 'outlined'}
                  onClick={() => handleRoleChange('candidate')}
                  startIcon={<User size={18} />}
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    px: 3,
                    py: 1,
                    background: role === 'candidate' ? '#49BBBD' : 'transparent',
                    color: role === 'candidate' ? 'white' : '#49BBBD',
                    border: 'none',
                    fontWeight: 700,
                    borderRadius: '16px',
                    minWidth: 'auto',
                    boxShadow: 'none',
                    transition: 'background-color 0.5s ease, color 0.5s ease',
                    '&:hover': {
                      background: role === 'candidate' ? '#49BBBD' : 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Candidate
                </Button>
                <Button
                  variant={role === 'company' ? 'contained' : 'outlined'}
                  onClick={() => handleRoleChange('company')}
                  startIcon={<Building2 size={18} />}
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    px: 3,
                    py: 1,
                    background: role === 'company' ? '#49BBBD' : 'transparent',
                    color: role === 'company' ? 'white' : '#49BBBD',
                    border: 'none',
                    fontWeight: 700,
                    borderRadius: '16px',
                    minWidth: 'auto',
                    boxShadow: 'none',
                    transition: 'background-color 0.5s ease, color 0.5s ease',
                    '&:hover': {
                      background: role === 'company' ? '#49BBBD' : 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Company
                </Button>
              </Box>


            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Name and Email in same row */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'coloumn', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    fullWidth
                    required
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
                          <User size={20} color="white" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Email Address"
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    fullWidth
                    required
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
                          <Mail size={20} color="white" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {role === 'company' && (
                <>
                  {/* Company Name and Industry in same row */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'coloumn', md: 'row' }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        label="Company Name"
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Your Company"
                        fullWidth
                        required
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
                              <Building2 size={20} color="white" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        label="Industry"
                        select
                        name="industry"
                        value={formData.industry}
                        onChange={handleSelectChange('industry')}
                        fullWidth
                        required
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
                              <Briefcase size={20} color="white" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        <MenuItem value="">Select Industry</MenuItem>
                        <MenuItem value="tech">Technology</MenuItem>
                        <MenuItem value="finance">Finance</MenuItem>
                        <MenuItem value="healthcare">Healthcare</MenuItem>
                        <MenuItem value="education">Education</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </TextField>

                    </Box>



                  </Box>
                  {/* Remaining Company Inputs */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <TextField
                      label="Website"
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      fullWidth
                      required
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
                            <Globe size={20} color="white" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      label="Address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Company Address"
                      fullWidth
                      required
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
                            <MapPin size={20} color="white" />
                          </InputAdornment>
                        ),
                      }}
                    />

                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <TextField
                      label="Company Size"
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      placeholder="e.g., 50–100"
                      fullWidth
                      required
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
                            <Users size={20} color="white" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      label="Founded Year"
                      type="date"
                      name="founded"
                      value={formData.founded}
                      onChange={handleChange}
                      fullWidth
                      required
                      inputRef={foundedInputRef}
                      onClick={handleOpenFoundedPicker}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: "1800-01-01",
                        max: `${new Date().getFullYear()}-12-31`,
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'black' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black', borderWidth: 2 },
                        },
                      }}
                    />





                  </Box>
                </>
              )}


              {/* Password and Confirm Password in same row */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'coloumn', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    fullWidth
                    required
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
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    fullWidth
                    required
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            sx={{ minWidth: 'auto', p: 0, color: 'white' }}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mb: { xs: 3, sm: 3, md: 1 }, mt: { xs: 3, sm: 3, md: 0 } }}>
                <Checkbox
                  id="terms"
                  required
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
                <Typography variant="body2" sx={{ color: 'white' }}>
                  I agree to the{' '}
                  <MuiLink href="#" sx={{
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {


                      textDecoration: 'underline',
                    },
                  }}>
                    Terms of Service
                  </MuiLink>
                  {' '}and{' '}
                  <MuiLink href="#" sx={{
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {

                      textDecoration: 'underline',
                    },
                  }}>
                    Privacy Policy
                  </MuiLink>
                </Typography>
              </Box>
              {error && (
                <Typography color="error" sx={{ fontSize: '0.875rem' }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                variant="contained"

                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <UserPlus size={20} />}
                sx={{
                  background: 'white',
                  width: '200px',
                  mx: "auto",
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
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </Box>

            <Box sx={{ pt: 1, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'white' }}>
                Already have an account?{' '}
                <MuiLink href="/auth/login" sx={{
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {

                    textDecoration: 'underline',
                  },
                }}>
                  Sign in here
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* RIGHT SIDE - IMAGE */}
      <Box
        sx={{
          flex: '0 0 40%',
          display: { xs: 'none', md: 'block' },
          backgroundImage: `url('/auth/login.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </Box>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <Card sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Card>
    }>
      <RegisterContent />
    </Suspense>
  )
}
