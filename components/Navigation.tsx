'use client';

import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider } from '@mui/material';
import { Dashboard, Home } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DRAWER_WIDTH = 260;

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Dashboard },
    { label: 'Anime1.me', href: '/anime', imageUrl: 'https://anime1.me/favicon-32x32.png' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
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
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                  <ListItemIcon sx={{ 
                    color: isActive ? 'white' : 'var(--color-secondary)',
                    minWidth: 40,
                  }}>
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
    </Drawer>
  );
}

export { DRAWER_WIDTH };
