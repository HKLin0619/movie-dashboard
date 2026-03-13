'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { SvgIconComponent } from '@mui/icons-material';

interface CategoryCardProps {
  title: string;
  count: number;
  favorites: number;
  icon?: SvgIconComponent;
  imageUrl?: string;
  color: string;
  link: string;
  lastUpdated?: string | null;
  onRefresh?: () => Promise<{ success: boolean; count: number; error?: string }>;
}

export default function CategoryCard({ 
  title, 
  count, 
  favorites, 
  icon: IconComponent,
  imageUrl, 
  color, 
  link,
  lastUpdated,
  onRefresh,
}: CategoryCardProps) {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; success: boolean; message: string }>({
    open: false, success: true, message: '',
  });
  const router = useRouter();

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'Never updated';

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      <Card
        onClick={() => router.push(link)}
        sx={{
          width: '100%',
          transition: 'all 200ms ease-in-out',
          border: '2px solid transparent',
          '&:hover': {
            borderColor: color,
            boxShadow: 4,
          },
          cursor: 'pointer',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: { xs: 2, sm: 2.5 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: imageUrl ? 'transparent' : color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  IconComponent && <IconComponent sx={{ fontSize: 32 }} />
                )}
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    fontSize: { xs: '1.15rem', sm: '1.5rem' },
                    wordBreak: 'break-word',
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.72rem',
                    letterSpacing: 0.3,
                  }}
                >
                  Last updated: {formattedDate}
                </Typography>
              </Box>
              {onRefresh && (
                <Tooltip title="Fetch latest data from API">
                  <span>
                    <IconButton
                      onClick={handleRefresh}
                      disabled={loading}
                      sx={{
                        color: 'var(--color-primary)',
                        transition: 'all 200ms ease-in-out',
                        ml: 'auto',
                        '&:hover': {
                          color: 'var(--color-secondary)',
                          transform: 'rotate(30deg)',
                        },
                      }}
                    >
                      {loading
                        ? <CircularProgress size={22} sx={{ color: 'var(--color-primary)' }} />
                        : <Refresh />
                      }
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(2, auto)' },
                gap: { xs: 1.5, sm: 2.5 },
                alignItems: 'center',
                width: { xs: '100%', sm: 'auto' },
                flexShrink: 0,
              }}
            >
              <Box sx={{ textAlign: 'center', minWidth: { sm: 60 } }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: color,
                      fontFamily: 'var(--font-code)',
                      lineHeight: 1,
                      mb: 0.5,
                      fontSize: { xs: '2rem', sm: '3rem' },
                    }}
                  >
                    {count}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '0.7rem',
                    }}
                  >
                    Total
                  </Typography>
                </Box>
              <Box sx={{ textAlign: 'center', minWidth: { sm: 60 } }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: '#e91e63',
                      fontFamily: 'var(--font-code)',
                      lineHeight: 1,
                      mb: 0.5,
                      fontSize: { xs: '2rem', sm: '3rem' },
                    }}
                  >
                    {favorites}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '0.7rem',
                    }}
                  >
                    Favorites
                  </Typography>
                </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.success ? 'success' : 'error'}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
