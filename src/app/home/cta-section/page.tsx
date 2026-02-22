'use client'
import { Box, Button, Container, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Stack } from "@mui/system";
import { Briefcase, CheckCircle, Rocket } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
    const theme = useTheme();

    return (
      <Box
        maxWidth='xl'
        className="wow animate__animated animate__fadeInUp" data-wow-once="true"
        sx={{
          backgroundColor: 'background.paper',
          py: { xs: 4, sm: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden',
          zIndex: 10,
          mx: "auto",
          my: 10,
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
          <Box sx={{ textAlign: 'center' }}>
            {/* Enhanced Title with Theme Primary Accent */}
            <Box sx={{ mb: 4 }}>
              <Typography
                component="span"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  color: 'text.primary',
                  display: 'inline-block',
                }}
              >
                Ready to Transform
              </Typography>
              <br />
              <Typography
                component="span"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 700,
                  color: theme.palette.primary.main, // Uses theme Orange
                  display: 'inline-block',
                }}
              >
                Your Career?
              </Typography>
            </Box>

            {/* Enhanced Subtitle with Theme Secondary Accent */}
            <Typography
              variant="h5"
              sx={{
                color: theme.palette.secondary.main, // Uses theme Aqua Blue for a hero feel
                mb: 5,
                fontSize: { xs: '0.8rem', md: '1.10rem' },
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              Join thousands of candidates and companies using SkillSense to ace interviews and build successful teams
            </Typography>

            {/* Enhanced Button Stack using Theme Palette */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={4}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 8 }}
            >
              <Button
                component={Link}
                href="/auth/register?role=candidate"
                sx={{
                  '&&': {
                    fontSize: { xs: '1.1rem', md: '1.2rem' },
                    borderRadius: 5,
                    fontWeight: 700,
                    backgroundColor: theme.palette.primary.main, 
                    color: theme.palette.primary.contrastText,
                    boxShadow: `0 4px 12px rgba(255, 153, 51, 0.3)`,
                    minWidth: { xs: '220px', md: '280px' },
                    position: 'relative',
                    overflow: 'hidden',
                    border: `2px solid ${theme.palette.primary.main}`,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      boxShadow: `0 8px 24px rgba(255, 153, 51, 0.4)`,
                      transform: 'translateY(-4px) scale(1.03)',
                      borderColor: theme.palette.primary.dark,
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, position: 'relative', zIndex: 1 }}>
                  <Rocket size={22} />
                  <Typography variant="inherit" sx={{ fontWeight: 700 }}>
                    Start as Candidate
                  </Typography>
                </Box>
              </Button>

              <Button
                component={Link}
                href="/auth/register?role=company"
                sx={{
                  '&&': {
                    fontSize: { xs: '1.1rem', md: '1.2rem' },
                    borderRadius: 5,
                    fontWeight: 700,
                    border: `2px solid ${theme.palette.secondary.main}`, 
                    color: theme.palette.secondary.main, 
                    backgroundColor: 'transparent',
                    minWidth: { xs: '220px', md: '280px' },
                    position: 'relative',
                    overflow: 'hidden',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: `${theme.palette.secondary.main}10`,
                      border: `2px solid ${theme.palette.secondary.main}`,
                      transform: 'translateY(-4px) scale(1.03)',
                      boxShadow: `0 8px 24px rgba(0, 206, 209, 0.1)`,
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, position: 'relative', zIndex: 1 }}>
                  <Briefcase size={22} />
                  <Typography variant="inherit" sx={{ fontWeight: 700 }}>
                    Register Your Company
                  </Typography>
                </Box>
              </Button>
            </Stack>

            {/* Trust Indicators with Theme Colors */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={4}
              justifyContent="center"
              alignItems="center"
            >
              {[
                "AI-Powered Feedback",
                "Industry-Standard Questions",
                "Real Interview Simulation"
              ].map((text, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: theme.palette.primary.main }}> 
                    <CheckCircle size={20} />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Container>

        {/* Bottom Gradient Overlay linked to Theme Primary */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: `linear-gradient(to top, ${theme.palette.secondary.main}15, transparent)`,
            pointerEvents: 'none'
          }}
        />
      </Box>
    );
}