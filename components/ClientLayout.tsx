'use client';

import { Box } from '@mui/material';
import Sidebar from '@/components/Navigation';
import EmotionRegistry from '@/components/EmotionRegistry';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'var(--color-background)',
          minHeight: '100vh',
          width: 'calc(100% - 260px)',
        }}
      >
        {children}
      </Box>
    </EmotionRegistry>
  );
}
