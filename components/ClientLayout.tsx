'use client';

import { Box } from '@mui/material';
import Sidebar from '@/components/Navigation';
import EmotionRegistry from '@/components/EmotionRegistry';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          bgcolor: 'var(--color-background)',
        }}
      >
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'var(--color-background)',
            minHeight: '100vh',
            width: { xs: '100%', md: 'calc(100% - 260px)' },
            pt: { xs: 8, sm: 9, md: 0 },
          }}
        >
          {children}
        </Box>
      </Box>
    </EmotionRegistry>
  );
}
