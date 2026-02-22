"use client";

import {
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  ListItemIcon,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { HomeIcon } from "lucide-react";


export default function ProfileMenu({ logout }: { logout: () => void }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleClose();
  };
  const showmyProfile = () => {
    const dashboardPath = user?.role === 'company' ? '/company' : '/candidate';
    router.push(dashboardPath);
    handleClose();
  };
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [logout]);

  const getUserInitial = () => {
    return user?.name?.[0] || user?.fullName?.[0];
  };

  const getUserName = () => {
    return user?.name || user?.fullName ;
  };

  return (
    <>
      {/* Avatar Button */}
      <IconButton onClick={handleOpen} sx={{ p: 0 }}>
        {user?.selfie ? (
          <Avatar
            src={user.selfie}
            alt={getUserName()}
            sx={{ width: 35, height: 35 }}
          />
        ) : (
          < Box sx={{ display: "flex", alignItems: "center",flexDirection: "column",justifyContent: "center" }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              width: 35,
              mr:1,
                      height: 35,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: (isMounted && pathname === '/' )?'white':'linear-gradient(-45deg, #49BBBD, #49BBBD, #0d9488, #49BBBD)',
              color: (isMounted && pathname === '/' )?'#49BBBD':'white',
            }}
          >
            {getUserInitial()}
          </Typography>
         { isMounted && pathname === '/' &&
          <Box sx={{ display: "flex", alignItems: "center", }}>
          <Typography sx={{ fontWeight: 400,fontSize: 14,color: 'white' }}>
            Me
            </Typography>
            <ExpandMoreIcon sx={{ fontSize: 20, color: "white", transition: "transform 0.3s ease",
        transform: open ? "rotate(180deg)" : "rotate(0deg)", }} />
            </Box>
}
          </Box>

        )}
      </IconButton>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            width: { xs: 260, sm: 300 },
            borderRadius: 3,
            mt: 1.5,
            overflow: "visible",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",

            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 20,
              width: 10,
              height: 10,
              bgcolor: "white",
              transform: "translateY(-50%) rotate(45deg)",
              boxShadow: "-3px -3px 8px rgba(0,0,0,0.05)",
            },
          },
        }}
      >
        {/* Top Section */}
        <Box
          sx={{
            px: 2,
            pt: 2,
            pb: 1,
            textAlign: "center",
          }}
        >
          {user?.selfie ? (
            <Avatar
              src={user.selfie}
              alt="User"
              sx={{ width: 65, height: 65, mx: "auto", mb: 1 }}
            />
          ) : (
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                width: 65,
                height: 65,
                mx: "auto",
                mb: 1,
                borderRadius: "50%",
                background: "#49BBBD",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getUserInitial()}
            </Typography>
          )}

          <Typography variant="subtitle1" fontWeight={600}>
            {getUserName()}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            {user?.email}
          </Typography>
        </Box>

        <Divider />

{isMounted && pathname === '/' ? (
        <MenuItem onClick={showmyProfile} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Dashboard
        </MenuItem>
): (<MenuItem onClick={() => router.push('/')} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <HomeIcon fontSize="small" />
          </ListItemIcon>
         Home
        </MenuItem>)}
        

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
