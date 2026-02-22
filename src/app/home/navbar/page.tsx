'use client'
import React, { useState, useEffect } from 'react'
import {
  AppBar, Box, Stack, Toolbar, Typography, useMediaQuery,
  IconButton,
  alpha,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Menu, X, User } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import ProfileMenu from "@/components/layout/profile/page";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const theme = useTheme();
  const isSmScreen = useMediaQuery(theme.breakpoints.up('sm'));
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check session storage for user and token
    const storedUser = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const logout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    setUser(null);
    setToken(null);
    window.location.href = '/auth/login';
  };
  const isAuthenticated = user && token;
  return (
    <>

      <Box maxWidth="lg" sx={{ p: { xs: 2, sm: 3, md: 1 }, mx: "auto" }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'transparent',

            boxShadow: 'none',
            top: 0,
            zIndex: 50,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',


            px: { xs: 1.5, sm: 1.5, md: 0 },
            color: 'text.primary'
          }}
        >
          <Toolbar sx={{ py: { xs: 1, sm: 1.5 }, px: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', px: 0, py: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }} gap={1}>
                <Box
                  sx={{
                    width: { xs: 36, sm: 40, md: 44 },
                    height: { xs: 36, sm: 40, md: 44 },
                    background: 'linear-gradient(45deg, #ffff, #ffff)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
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
                  <Box sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
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
                      fontSize: { xs: '1.25rem', sm: '1rem', md: '1.5rem' },
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    SkillSense
                  </Typography>

                </Box>
              </Box>

              {isSmScreen && (
                <Stack direction="row" spacing={4} alignItems="center">
                  {isAuthenticated && user?.isVerified ? (
                    <ProfileMenu logout={logout} />
                  ) : (
                    <>
                      <Typography

                        component={Link}
                        href="/auth/login"
                        sx={{
                          textAlign: 'center',
                          alignItems: 'center',
                          justifyContent: "center",
                          padding: '10px',
                          background: 'white',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          borderRadius: '20px',
                          fontWeight: 700,
                          color: '#49BBBD',
                          width: "100px",

                          transition: 'all 0.3s ease',


                          display: 'inline-block',

                        }}
                      >
                        Sign In
                      </Typography>
                      <Typography

                        component={Link}
                        href="/auth/register?role=candidate"
                        sx={{
                          textDecoration: 'none',
                          color: 'white',
                          display: 'inline-block',
                          padding: '10px',
                          textAlign: 'center',
                          width: '100px',
                          fontSize: '1rem',
                          borderRadius: '20px',
                          background: '#80CECF',

                          fontWeight: 600,



                          transition: 'all 0.3s ease',


                        }}
                      >
                        Sign Up
                      </Typography>

                    </>
                  )}
                </Stack>
              )}

              {!isSmScreen && (
                isAuthenticated && user?.isVerified ? (
                  <ProfileMenu logout={logout} />
                ) : (
                  <IconButton
                    onClick={() => setMobileMenuOpen(true)}
                    sx={{
                      color: 'white',
                      p: 1.5,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                        color: theme.palette.text.primary,
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <Menu size={24} />
                  </IconButton>
                )
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </Box>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            background: '#49BBBD',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)',

          },
        }}
      >
        <Box sx={{ p: 4 }}>
          {/* Drawer Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  background: 'white',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
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
                <Box sx={{ position: 'relative', zIndex: 1, width: 32, height: 32 }}>
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
                    fontSize: { xs: '1.25rem', sm: '1rem', md: '1.5rem' },
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  SkillSense
                </Typography>

              </Box>
            </Box>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                color: 'white',
                p: 1.5,
                borderRadius: 3,
                transition: 'all 0.3s ease',

              }}
            >
              <X size={22} />
            </IconButton>
          </Box>

          {/* Navigation Links */}
          <List sx={{ p: 0, mb: 2 }}>
            <ListItem disablePadding sx={{ mb: 3 }}>
              <ListItemButton
                component={Link}
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  borderRadius: 5,
                  background: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.06)',

                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.04))',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    transform: 'translateX(6px)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#49BBBD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <User size={20} />
                  </Box>
                  <ListItemText
                    primary="Sign In"
                    secondary="Access your account"
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        fontSize: '1rem',
                      },
                      '& .MuiListItemText-secondary': {
                        color: theme.palette.text.secondary,
                        fontSize: '0.8rem',
                        fontWeight: 500,
                      }
                    }}
                  />
                </Box>
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 4 }}>
              <ListItemButton
                component={Link}
                href="/auth/register?role=candidate"
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  borderRadius: 5,

                  background: 'white',
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #000000, #ffffff)',
                    transform: 'translateX(6px)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
                    '&::before': {
                      opacity: 1,
                    },
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#49BBBD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <User size={20} />
                  </Box>
                  <ListItemText
                    primary="Create Account"
                    secondary="Start your journey"
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        fontSize: '1rem',
                      },
                      '& .MuiListItemText-secondary': {
                        color: theme.palette.text.secondary,
                        fontSize: '0.8rem',
                        fontWeight: 500,
                      }
                    }}
                  />
                </Box>
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );


}