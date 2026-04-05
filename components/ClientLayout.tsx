'use client';

import { Box } from '@mui/material';
import EmotionRegistry from '@/components/EmotionRegistry';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          bgcolor: 'var(--color-background)',
        }}
      >
        <Box
          component="main"
          sx={{
            bgcolor: 'var(--color-background)',
            minHeight: '100vh',
            width: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </EmotionRegistry>
  );
}
