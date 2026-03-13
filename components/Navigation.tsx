'use client';

import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Dashboard, Menu } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DRAWER_WIDTH = 260;

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Dashboard },
    { label: 'Anime1.me', href: '/anime', imageUrl: 'https://anime1.me/favicon-32x32.png' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen((open) => !open);
  };

  const handleNavClick = () => {
    if (!isDesktop) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src="/assets/logo.png"
            alt="Dashboard Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontFamily: 'var(--font-sans)',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Dashboard
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2 }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }} onClick={handleNavClick}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text)',
                    transition: 'all 200ms ease-in-out',
                    '&:hover': {
                      bgcolor: isActive ? 'var(--color-primary)' : 'rgba(30, 64, 175, 0.08)',
                      transform: 'translateX(4px)',
                    },
                    cursor: 'pointer',
                    py: 1.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'white' : 'var(--color-secondary)',
                      minWidth: 40,
                    }}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.label}
                        style={{ width: 24, height: 24, objectFit: 'contain' }}
                      />
                    ) : (
                      IconComponent && <IconComponent />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.95rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Link>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          © 2026 Movie Dashboard
        </Typography>
      </Box>
    </>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: 'block', md: 'none' },
          bgcolor: 'rgba(255, 255, 255, 0.92)',
          color: 'var(--color-text)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: 2 }}>
          <IconButton edge="start" color="inherit" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
            <Menu />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 'min(80vw, 320px)',
            boxSizing: 'border-box',
            bgcolor: 'white',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'white',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
