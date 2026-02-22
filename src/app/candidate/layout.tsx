"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  Briefcase,
  BookOpen,
  BarChart3,
  User,
} from "lucide-react";
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
export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const navItems = [
    { href: "/candidate/dashboard", label: "Dashboard", icon: Home },
    { href: "/candidate/profile", label: "Profile", icon: User },
    {
      href: "/candidate/mock-interview",
      label: "Mock Interview",
      icon: Briefcase,
    },
    { href: "/candidate/findInterview", label: "Vacancies ", icon: BookOpen },
    { href: "/candidate/feedback", label: "Feedback", icon: BarChart3 },
  ];
  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <Box
      suppressHydrationWarning
      sx={{
        display: "flex",
        height: "100vh",
        background:
          "linear-gradient(-45deg, #ffffff, #f5f5f5, #e8f4f4, #ffffff)",
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
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 256,
            background: "#49BBBD",

            borderRight: "1px solid rgba(107, 63, 105, 0.2)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
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
                background: "white",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
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

        <Box sx={{ flex: 1, px: 2, py: 2 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: "none" }}
                onClick={() => setSidebarOpen(false)}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 2,
                    py: 1.5,
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
                  <Typography variant="body2">{item.label}</Typography>
                </Box>
              </Link>
            );
          })}
        </Box>
      </Drawer>

      <Box
        sx={{
          width: { xs: 0, md: sidebarOpen ? 256 : 80 },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          background: "#49BBBD",
          borderRight: "1px solid rgba(107, 63, 105, 0.2)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          transition: "width 0.3s ease",
          height: "100%",
        }}
      >
        <Box
          sx={{
            p: sidebarOpen ? 3 : 2,
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {sidebarOpen && (
              <Box
                sx={{
                  width: 32,
                  height: 32,
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
            )}
            {sidebarOpen && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  background: "white",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                SkillSense
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{
              p: 1,
              color: "white",
              "&:hover": {
                backgroundColor: alpha(theme.palette.text.secondary, 0.04),
              },
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, px: 2, py: 6 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: "none" }}
                onClick={() => setSidebarOpen(false)}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    gap: sidebarOpen ? 2 : 0,
                    px: sidebarOpen ? 2 : 1,
                    py: 2,
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
                  {sidebarOpen && (
                    <Typography variant="body2">{item.label}</Typography>
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
          <Toolbar sx={{ px: { xs: 2, md: 4 }, py: { xs: 1, md: 2 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                background: "#49BBBD",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                flex: 1,
              }}
            >
              Dashboard
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, md: 2 },
              }}
            >
              <IconButton
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{
                  display: { xs: "flex", sm: "flex", md: "none" },
                  p: 1,
                  "&:hover": { backgroundColor: "#49BBBD" },
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
                    label="Candidate"
                    variant="outlined"
                    sx={{
                      borderRadius: 5,
                      height: 35,
                      color: theme.palette.secondary.main,
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
        <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
