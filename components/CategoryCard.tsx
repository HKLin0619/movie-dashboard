'use client';

import { Box, Card, CardContent, CardActionArea, Typography } from '@mui/material';
import Link from 'next/link';
import { SvgIconComponent } from '@mui/icons-material';

interface CategoryCardProps {
  title: string;
  count: number;
  favorites: number;
  icon?: SvgIconComponent;
  imageUrl?: string;
  color: string;
  link: string;
}

export default function CategoryCard({ 
  title, 
  count, 
  favorites, 
  icon: IconComponent,
  imageUrl, 
  color, 
  link 
}: CategoryCardProps) {
  return (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <Card
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
        <CardActionArea>
          <CardContent sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
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
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: 'var(--color-text)',
                  }}
                >
                  {title}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexShrink: 0 }}>
                <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: color,
                      fontFamily: 'var(--font-code)',
                      lineHeight: 1,
                      mb: 0.5,
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
                <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: '#e91e63',
                      fontFamily: 'var(--font-code)',
                      lineHeight: 1,
                      mb: 0.5,
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
        </CardActionArea>
      </Card>
    </Link>
  );
}
