'use client'
import { Box, Container, Grid, IconButton, Stack, Typography, Link as MuiLink, } from "@mui/material";
import { useTheme } from "@mui/material";
import { Github, Linkedin, Twitter } from "lucide-react";
import Image from 'next/image'

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      maxWidth='xl'
      className="wow animate__animated animate__fadeInUp"
      suppressHydrationWarning
      sx={{
        background: '#1B1E32',
        color: theme.palette.text.primary,
        py: { xs: 4, md: 6 },
        position: 'relative',
        zIndex: 10,
        mx: "auto",
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6} sx={{ mb: 8 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={4}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 20px rgba(255, 153, 51, 0.3)`
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1, width: 36, height: 36 }}>
                      <Image src="/logo.svg" alt="SkillSense Logo" fill style={{ objectFit: 'contain' }} />
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff', letterSpacing: 0.5 }}>
                    SkillSense
                  </Typography>
                </Stack>
                <Typography variant="body1" sx={{ color: '#e0e0e0', mb: 3, lineHeight: 1.6 }}>
                  AI-powered mock interview platform designed to accelerate your career success through personalized feedback and intelligent preparation.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    href="#"
                    sx={{
                      color: '#b0b0b0',
                      width: 40,
                      height: 40,
                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Twitter size={20} />
                  </IconButton>
                  <IconButton
                    href="#"
                    sx={{
                      color: '#b0b0b0',
                      width: 40,
                      height: 40,
                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Linkedin size={20} />
                  </IconButton>
                  <IconButton
                    href="#"
                    sx={{
                      color: '#b0b0b0',
                      width: 40,
                      height: 40,
                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Github size={20} />
                  </IconButton>
                </Stack>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: '600', mb: 3, color: theme.palette.primary.main, letterSpacing: 0.5 }}>
              For Candidates
            </Typography>
            <Stack spacing={2.5}>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                Mock Interviews
              </MuiLink>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                Feedback Reports
              </MuiLink>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                Learning Paths
              </MuiLink>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                Job Interview Search
              </MuiLink>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: '600', mb: 3, color: theme.palette.primary.main, letterSpacing: 0.5 }}>
              For Companies
            </Typography>
            <Stack spacing={2.5}>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                Post Jobs Interview
              </MuiLink>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                Manage Candidates
              </MuiLink>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                View Recordings
              </MuiLink>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                Analytics
              </MuiLink>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: '600', mb: 3, color: theme.palette.primary.main, letterSpacing: 0.5 }}>
              Company
            </Typography>
            <Stack spacing={2.5}>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                About Us
              </MuiLink>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                Blog
              </MuiLink>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                Contact
              </MuiLink>
              <MuiLink href="#" sx={{ color: '#D4C5D2', textDecoration: 'none', fontSize: '0.95rem', '&:hover': { color: theme.palette.secondary.main, transform: 'translateX(4px)' }, transition: 'all 0.2s ease' }}>
                Careers
              </MuiLink>
            </Stack>
          </Grid>
        </Grid>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            &copy; 2026 SkillSense. All rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}