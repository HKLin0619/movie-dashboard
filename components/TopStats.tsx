'use client';

import { useState } from 'react';
import { Box, Card, CardContent, Typography, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { DashboardFilter } from '@/types/dashboard';

interface TopStatsProps {
  totalCount: number;
  favoriteCount: number;
  watchedCount: number;
  unwatchedCount: number;
  lastUpdated?: string | null;
  onRefresh?: () => Promise<{ success: boolean; count: number; error?: string }>;
  activeFilter: DashboardFilter;
  onFilterChange: (filter: DashboardFilter) => void;
}

export default function TopStats({
  totalCount,
  favoriteCount,
  watchedCount,
  unwatchedCount,
  lastUpdated,
  onRefresh,
  activeFilter,
  onFilterChange,
}: TopStatsProps) {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; success: boolean; message: string }>({
    open: false,
    success: true,
    message: '',
  });
  const router = useRouter();

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never updated';

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setLoading(true);
    try {
      const result = await onRefresh();
      if (result.success) {
        setSnackbar({ open: true, success: true, message: `Updated! ${result.count} anime loaded.` });
        router.refresh();
      } else {
        setSnackbar({ open: true, success: false, message: `Refresh failed: ${result.error}` });
      }
    } catch {
      setSnackbar({ open: true, success: false, message: 'Refresh failed, please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          flexWrap: 'nowrap',
          gap: 0.5,
        }}
      >
        <Tooltip title="Fetch latest data from API">
          <Box
            component="button"
            aria-label="Refresh anime data"
            type="button"
            disabled={loading}
            onClick={handleRefresh}
            sx={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              p: 0,
              m: 0,
              width: 24,
              height: 24,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              cursor: loading ? 'default' : 'pointer',
              borderRadius: 1,
              transition: 'all 200ms ease-in-out',
              '&:hover': {
                color: loading ? 'var(--color-primary)' : 'var(--color-secondary)',
                transform: loading ? 'none' : 'rotate(30deg)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={16} sx={{ color: 'var(--color-primary)' }} />
            ) : (
              <Refresh sx={{ fontSize: 20, display: 'block' }} />
            )}
          </Box>
        </Tooltip>

        <Typography
          variant="subtitle1"
          sx={{
            color: 'var(--color-text)',
            fontWeight: 600,
            lineHeight: 1,
            m: 0,
          }}
        >
          Last updated: {formattedDate}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <Card elevation={0} onClick={() => onFilterChange('all')} sx={{
          borderRadius: 2,
          cursor: 'pointer',
          border: activeFilter === 'all' ? '2px solid var(--color-primary)' : '2px solid transparent',
          boxShadow: activeFilter === 'all' ? 4 : 2,
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-1px)',
          },
        }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-code)',
                lineHeight: 1,
                mb: 1,
              }}
            >
              {totalCount}
            </Typography>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
              Total
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} onClick={() => onFilterChange('favorites')} sx={{
          borderRadius: 2,
          cursor: 'pointer',
          border: activeFilter === 'favorites' ? '2px solid #e91e63' : '2px solid transparent',
          boxShadow: activeFilter === 'favorites' ? 4 : 2,
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-1px)',
          },
        }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#e91e63',
                fontFamily: 'var(--font-code)',
                lineHeight: 1,
                mb: 1,
              }}
            >
              {favoriteCount}
            </Typography>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
              Favorites
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} onClick={() => onFilterChange('watched')} sx={{
          borderRadius: 2,
          cursor: 'pointer',
          border: activeFilter === 'watched' ? '2px solid #2e7d32' : '2px solid transparent',
          boxShadow: activeFilter === 'watched' ? 4 : 2,
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-1px)',
          },
        }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#2e7d32',
                fontFamily: 'var(--font-code)',
                lineHeight: 1,
                mb: 1,
              }}
            >
              {watchedCount}
            </Typography>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
              Watched
            </Typography>
          </CardContent>
        </Card>

        <Card elevation={0} onClick={() => onFilterChange('unwatched')} sx={{
          borderRadius: 2,
          cursor: 'pointer',
          border: activeFilter === 'unwatched' ? '2px solid #ed6c02' : '2px solid transparent',
          boxShadow: activeFilter === 'unwatched' ? 4 : 2,
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-1px)',
          },
        }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: '#ed6c02',
                fontFamily: 'var(--font-code)',
                lineHeight: 1,
                mb: 1,
              }}
            >
              {unwatchedCount}
            </Typography>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
              Unwatched
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.success ? 'success' : 'error'} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
