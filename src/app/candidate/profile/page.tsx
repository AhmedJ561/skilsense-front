'use client'


import { useState, useEffect } from 'react'
import { useRef } from 'react';
import {
  Box,
  Card,
  Typography,

  Grid,

  CircularProgress,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CompleteProfilePage from '../complete-profile/page'
import { useUserStore } from '@/store/userStore'
interface UserProfile {
  initials: string
  name: string
  email: string
  role?: string
  experience?: string
  totalInterviews?: number
  averageScore?: number
  skillsAdded?: number
}
export default function ProfilePage() {
  const theme = useTheme()

  const [isLoading, setIsLoading] = useState(true)
  const { fetchUserDetail } = useUserStore();
  const [profile, setProfile] = useState<UserProfile>({
    initials: '',
    name: '',
    email: '',
    experience: '',
    totalInterviews: 0,
    averageScore: 0,
    skillsAdded: 0,
  })


  const fetchedRef = useRef(false); // ✅ track if we already fetched
  useEffect(() => {
    if (fetchedRef.current) return; // exit if already fetched
    fetchedRef.current = true;

    // Simulate loading data
    const fetchProfile = async () => {
      try {
        const res = await fetchUserDetail() // your API call
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
            experience: u.experiences.position || '',
            totalInterviews: u.totalInterviews || 0,
            averageScore: u.averageScore || 0,
            skillsAdded: u.skillsAdded || 0,
          })
        }
      } catch (err) {
        console.error('Failed to fetch profile', err)
        setIsLoading(false);
      }
      finally {
        setIsLoading(false);
      }
    }

    fetchProfile()
  }, [])


  if (isLoading) {
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
        <CircularProgress
          sx={{
            color: '#49BBBD'
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: '#49BBBD',
            fontWeight: 500
          }}
        >
          Loading profile...
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#49BBBD',
            textAlign: 'center',
            maxWidth: '300px'
          }}
        >
          Preparing your profile information
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {profile ? (
        <Box >
          {/* Profile Header */}
          <Card
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              background: 'linear-gradient(135deg, rgba(245, 243, 255, 0.95), rgba(237, 233, 254, 0.95))',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                mb: 4,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box
                  sx={{
                    width: { xs: 80, sm: 96 },
                    height: { xs: 80, sm: 96 },
                    background: theme.palette.primary.main,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontWeight: 'bold',
                  }}
                >
                  {profile.initials}
                </Box>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 'bold',
                      color: theme.palette.text.primary,
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    }}
                  >
                    {profile.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                    {profile.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {profile.experience}
                  </Typography>
                </Box>
              </Box>

              {/* Edit Profile Button (commented out / disabled for now) */}
              {/* <Button
          variant="contained"
          startIcon={<Edit2 size={18} />}
          sx={{
            background: '#49BBBD',
            '&:hover': { background: '#49BBBD' },
            pointerEvents: 'none', // disabled click
            opacity: 0.6, // visual disabled state
          }}
        >
          Edit Profile
        </Button> */}
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ pt: 4, borderTop: '1px solid #e2e8f0' }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Total Interviews
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  {profile.totalInterviews}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Average Score
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#49BBBD' }}>
                  {profile.averageScore}%
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                  Skills Added
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  {profile.skillsAdded}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            Profile Not Found
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Please complete your profile to access this page.
          </Typography>
        </Box>
      )}

      {/* Complete Profile Section */}
      <CompleteProfilePage />

    </Box>
  )
}
