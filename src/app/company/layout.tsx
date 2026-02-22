"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, Briefcase, Users, BarChart3, User } from "lucide-react";
import Image from "next/image";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
  Chip,
  Stack,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ProfileMenu from "@/components/layout/profile/page";
import { useRouter } from "next/navigation";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const navItems = [
    { href: "/company/dashboard", label: "Dashboard", icon: Home },
    { href: "/company/profile", label: "Profile", icon: User },
    { href: "/company/interviews", label: "Post Interview", icon: Briefcase },
    { href: "/company/candidates", label: "Candidates", icon: Users },
    { href: "/company/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        background: "white",
        backgroundSize: "400% 400%",
        animation: "premiumGradientFlow 15s ease infinite",
      }}
    >
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: { xs: "block", md: "none" },
            zIndex: 40,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            background: "#49BBBD",
            borderRight: "1px solid rgba(107, 63, 105, 0.15)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            backdropFilter: "blur(12px)",
          },
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <Box
              sx={{
                width: { xs: 28, sm: 32, md: 36 },
                height: { xs: 28, sm: 32, md: 36 },
                background: "white",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{ position: "relative", zIndex: 1, width: 26, height: 26 }}
              >
                <Image
                  src="/logo.svg"
                  alt="SkillSense Logo"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "white",
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" },
              }}
            >
              SkillSense
            </Typography>
          </Box>
          <IconButton
            onClick={() => setSidebarOpen(false)}
            sx={{
              color: "white",
              p: 1,
              "&:hover": {
                backgroundColor: alpha(theme.palette.text.secondary, 0.04),
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, px: { xs: 1, sm: 2 }, py: 2 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                onClick={() => setSidebarOpen(false)}
                key={item.href}
                href={item.href}
                style={{ textDecoration: "none" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 2, sm: 3 },
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 1.2, sm: 1.5 },
                    borderRadius: 2,
                    color: "white",
                    textDecoration: "none",
                    "&:hover": {
                      backgroundColor: "white",
                      color: "#49BBBD",
                    },
                  }}
                >
                  <Icon size={20} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </Link>
            );
          })}
        </Box>
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: { xs: 0, md: sidebarOpen ? 280 : 80 },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          background: "#49BBBD",
          borderRight: "1px solid rgba(107, 63, 105, 0.15)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {sidebarOpen && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              <Box
                sx={{
                  width: { xs: 28, sm: 32, md: 36 },
                  height: { xs: 28, sm: 32, md: 36 },
                  background: "white",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    width: 26,
                    height: 26,
                  }}
                >
                  <Image
                    src="/logo.svg"
                    alt="SkillSense Logo"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </Box>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" },
                }}
              >
                SkillSense
              </Typography>
            </Box>
          )}
          <IconButton
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{
              color: "white",
              p: 1,
              "&:hover": {
                backgroundColor: alpha(theme.palette.text.secondary, 0.04),
              },
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, px: { xs: 1, sm: 2 }, py: 2 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                onClick={() => setSidebarOpen(false)}
                key={item.href}
                href={item.href}
                style={{ textDecoration: "none" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: sidebarOpen ? { xs: 2, sm: 3 } : 0,
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 1.2, sm: 1.5 },
                    borderRadius: 2,
                    color: "white",
                    textDecoration: "none",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    "&:hover": {
                      backgroundColor: "white",
                      color: "#49BBBD",
                    },
                  }}
                >
                  <Icon size={20} />
                  {sidebarOpen && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </Typography>
                  )}
                </Box>
              </Link>
            );
          })}
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: "white",
            borderBottom: "1px solid rgba(107, 63, 105, 0.2)",
            color: theme.palette.text.primary,
          }}
        >
          <Toolbar
            sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 1, sm: 1.5, md: 2 } }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                background: "#49BBBD",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                flex: 1,
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
              }}
            >
              Dashboard
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 2 },
              }}
            >
              <IconButton
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{
                  display: { xs: "flex", md: "none" },
                  p: 1,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </IconButton>
              <Box sx={{ display: { xs: "block", md: "none" } }}>
                <ProfileMenu logout={logout} />
              </Box>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Stack direction="row" spacing={1}>
                  <Chip
                    avatar={<ProfileMenu logout={logout} />}
                    label="Company"
                    variant="outlined"
                    sx={{
                      borderRadius: 5,
                      height: 35,
                      color: "#49BBBD",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                </Stack>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}

        <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, sm: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
