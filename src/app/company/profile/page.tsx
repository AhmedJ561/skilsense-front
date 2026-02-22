'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useUserStore } from '@/store/userStore'
import { Edit2, Save, X } from 'lucide-react'

interface UserProfile {
  initials: string
  name: string
  email: string
  role?: string
  companyName?: string
  industry?: string
  website?: string
  address?: string
  size?: string
  founded?: string
  description?: string
}

export default function ProfilePage() {
  const theme = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { fetchUserDetail, updateCompanyProfile } = useUserStore()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({})

  const fetchedRef = useRef(false)

  const loadProfile = async () => {
    try {
      const res = await fetchUserDetail()
      if (res.success && res.user) {
        const u = res.user
        setProfile({
          initials: u.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase(),
          name: u.name,
          email: u.email,
          companyName: u.companyName || '',
          industry: u.industry || '',
          website: u.website || '',
          address: u.address || '',
          size: u.size || '',
          founded: u.founded ? new Date(u.founded).toISOString().split('T')[0] : '',
          description: u.description || '',
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile', err)
      setError('Failed to load profile.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    loadProfile()
  }, [])

  const handleEditClick = () => {
    if (profile) {
      setEditFormData({
        companyName: profile.companyName,
        industry: profile.industry,
        website: profile.website,
        address: profile.address,
        size: profile.size,
        founded: profile.founded,
        description: profile.description,
      })
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFormData({})
    setError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditFormData({ ...editFormData, [name]: value })
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    try {
      const dataToSave = { ...editFormData }
      if (dataToSave.founded && dataToSave.founded.trim() !== '') {
        // ensure it's a valid date string or let backend handle it, backend handles strings fine usually
      } else {
        delete dataToSave.founded
      }

      const res = await updateCompanyProfile(dataToSave)
      if (res.success) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        await loadProfile() // Reload to get fresh data
      } else {
        setError(res.message || 'Failed to update profile.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 3,
        }}
      >
        <CircularProgress sx={{ color: '#49BBBD' }} />
        <Typography variant="h6" sx={{ color: '#49BBBD', fontWeight: 500 }}>
          Loading profile...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {profile ? (
        <Card sx={{
          p: { xs: 3, sm: 5 },
          background: 'white',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative premium accent bar */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #49BBBD, #3aa8a9)' }} />

          {/* Header section */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5, flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  background: 'linear-gradient(135deg, #49BBBD, #2d8c8d)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: { xs: '1.5rem', sm: '2.5rem' },
                  fontWeight: 'bold',
                  boxShadow: '0 8px 24px rgba(73, 187, 189, 0.3)',
                }}
              >
                {profile.initials}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 0.5, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }, letterSpacing: '-0.02em' }}>
                  {profile.name}
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  {profile.email}
                </Typography>
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1.5, backgroundColor: 'rgba(73, 187, 189, 0.1)', color: '#49BBBD', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Company Account
                  </Typography>
                </Box>
              </Box>
            </Box>

            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<Edit2 size={16} />}
                onClick={handleEditClick}
                sx={{
                  color: '#49BBBD',
                  borderColor: 'rgba(73, 187, 189, 0.5)',
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#49BBBD',
                    backgroundColor: 'rgba(73, 187, 189, 0.05)',
                  }
                }}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 5, borderColor: 'rgba(0,0,0,0.05)' }} />

          {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

          {/* Content Section */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 4, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Company Details
            </Typography>

            {isEditing ? (
              // EDIT MODE
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, rowGap: 3 }}>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="companyName"
                    value={editFormData.companyName || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Industry"
                    name="industry"
                    value={editFormData.industry || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Website URL"
                    name="website"
                    value={editFormData.website || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    placeholder="https://example.com"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Company Size"
                    name="size"
                    value={editFormData.size || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    placeholder="e.g. 50-200"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Founded Date"
                    name="founded"
                    type="date"
                    value={editFormData.founded || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
                <Box sx={{ width: '100%', px: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Headquarters Address"
                    name="address"
                    value={editFormData.address || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
                <Box sx={{ width: '100%', px: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Company Description"
                    name="description"
                    value={editFormData.description || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Tell us about your company, mission, and culture..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
                <Box sx={{ width: '100%', px: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={handleCancelEdit}
                    startIcon={<X size={18} />}
                    sx={{ borderRadius: 2, px: 3, fontWeight: 600, textTransform: 'none' }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save size={18} />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      background: 'linear-gradient(135deg, #49BBBD, #2d8c8d)',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(73, 187, 189, 0.4)',
                      '&:hover': {
                        background: '#3aa8a9',
                        boxShadow: '0 6px 20px rgba(73, 187, 189, 0.5)',
                      }
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            ) : (
              // READ MODE
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2, rowGap: 4 }}>
                <Box sx={{ width: { xs: '100%', md: '66.666%' }, px: 2 }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="overline" sx={{ color: theme.palette.text.secondary, fontWeight: 600, letterSpacing: '0.1em' }}>About Us</Typography>
                    <Typography variant="body1" sx={{ color: profile.description ? theme.palette.text.primary : theme.palette.text.disabled, mt: 1, lineHeight: 1.8, fontSize: '1.05rem' }}>
                      {profile.description || "No company description provided yet. Click 'Edit Profile' to add details about your company's mission and culture."}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ width: { xs: '100%', md: '33.333%' }, px: 2 }}>
                  <Box sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(73, 187, 189, 0.03)',
                    border: '1px solid rgba(73, 187, 189, 0.1)',
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 3 }}>
                      Quick Facts
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: 'uppercase' }}>Company</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, color: theme.palette.text.primary }}>{profile.companyName || '—'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: 'uppercase' }}>Industry</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, color: theme.palette.text.primary }}>{profile.industry || '—'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: 'uppercase' }}>Website</Typography>
                        {profile.website ? (
                          <Typography
                            variant="body2"
                            component="a"
                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ fontWeight: 500, mt: 0.5, color: '#49BBBD', textDecoration: 'none', display: 'block', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {profile.website}
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, color: theme.palette.text.primary }}>—</Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: 'uppercase' }}>Size</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, color: theme.palette.text.primary }}>{profile.size ? `${profile.size} employees` : '—'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: 'uppercase' }}>Founded</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, color: theme.palette.text.primary }}>{profile.founded || '—'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: 'uppercase' }}>Headquarters</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, color: theme.palette.text.primary }}>{profile.address || '—'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 10 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            Profile Not Found
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            We could not load your profile information. Please try again.
          </Typography>
        </Box>
      )}

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  )
}


