'use client';

import React, { useState, useMemo, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Typography,
  TableSortLabel,
  TablePagination,
  Chip,
  Link,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Favorite, FavoriteBorder, OpenInNew } from '@mui/icons-material';
import { Anime } from '@/app/data/animeData';
import { toggleFavorite } from '@/serveraction';
// @ts-ignore - opencc-js has no type definitions
import * as OpenCC from 'opencc-js';

interface AnimeTableProps {
  data: Anime[];
}

type Order = 'asc' | 'desc';
type OrderBy = keyof Anime | 'no';

export default function AnimeTable({ data }: AnimeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('no');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [localData, setLocalData] = useState(data);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Simplified to Traditional Chinese converter
  const converter = useMemo(() => {
    // @ts-ignore
    return OpenCC.Converter({ from: 'cn', to: 'tw' });
  }, []);
  
  // Sync localData when data updates
  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFavoriteToggle = async (animeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setLoadingId(animeId);
    
    // Optimistic UI update
    const previousData = localData;
    setLocalData(localData.map(anime => 
      anime.id === animeId 
        ? { ...anime, isFavorite: !anime.isFavorite }
        : anime
    ));
    
    // Backend update
    try {
      const result = await toggleFavorite(animeId);
      console.log('Toggle favorite result:', result, 'for anime ID:', animeId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Rollback on failure
      setLocalData(previousData);
      alert('Failed to toggle favorite, please try again');
    } finally {
      setLoadingId(null);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredAndSortedData = useMemo(() => {
    // Support simplified Chinese search for traditional Chinese content
    const traditionalSearch = searchTerm ? converter(searchTerm) : '';
    
    let filtered = localData.filter((anime) =>
      anime.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anime.title.includes(traditionalSearch) ||
      anime.subtitleGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anime.year.includes(searchTerm) ||
      anime.season.includes(searchTerm)
    );

    // Filter by favorites if enabled
    if (showFavoritesOnly) {
      filtered = filtered.filter(anime => anime.isFavorite);
    }

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (orderBy === 'no') {
        aValue = localData.indexOf(a) + 1;
        bValue = localData.indexOf(b) + 1;
      } else {
        aValue = a[orderBy] as string | number;
        bValue = b[orderBy] as string | number;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return order === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [localData, searchTerm, order, orderBy, converter, showFavoritesOnly]);

  const paginatedData = useMemo(() => {
    return filteredAndSortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredAndSortedData, page, rowsPerPage]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          label="Search Anime"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by title, subtitle group, year, or season..."
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'var(--color-secondary)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--color-primary)',
              },
            },
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showFavoritesOnly}
              onChange={(e) => {
                setShowFavoritesOnly(e.target.checked);
                setPage(0);
              }}
              sx={{
                color: '#e91e63',
                '&.Mui-checked': {
                  color: '#e91e63',
                },
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
              <Favorite sx={{ fontSize: 18, color: '#e91e63' }} />
              <Typography variant="body2">Favorites Only</Typography>
            </Box>
          }
          sx={{ mt: 1 }}
        />
      </Box>

      <TableContainer 
        component={Paper} 
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          '&:hover': {
            boxShadow: 4,
          },
          transition: 'box-shadow 200ms ease-in-out',
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="anime table">
          <TableHead>
            <TableRow sx={{ bgcolor: 'var(--color-primary)' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 80 }}>
                <TableSortLabel
                  active={orderBy === 'no'}
                  direction={orderBy === 'no' ? order : 'asc'}
                  onClick={() => handleRequestSort('no')}
                  sx={{
                    color: 'white !important',
                    '&:hover': { color: 'rgba(255,255,255,0.8) !important' },
                    '& .MuiTableSortLabel-icon': { color: 'white !important' },
                  }}
                >
                  No
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 600 }}>Title</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 120 }}>
                <TableSortLabel
                  active={orderBy === 'episodes'}
                  direction={orderBy === 'episodes' ? order : 'asc'}
                  onClick={() => handleRequestSort('episodes')}
                  sx={{
                    color: 'white !important',
                    '&:hover': { color: 'rgba(255,255,255,0.8) !important' },
                    '& .MuiTableSortLabel-icon': { color: 'white !important' },
                  }}
                >
                  Episodes
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 80 }}>
                <TableSortLabel
                  active={orderBy === 'year'}
                  direction={orderBy === 'year' ? order : 'asc'}
                  onClick={() => handleRequestSort('year')}
                  sx={{
                    color: 'white !important',
                    '&:hover': { color: 'rgba(255,255,255,0.8) !important' },
                    '& .MuiTableSortLabel-icon': { color: 'white !important' },
                  }}
                >
                  Year
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 100 }}>
                <TableSortLabel
                  active={orderBy === 'season'}
                  direction={orderBy === 'season' ? order : 'asc'}
                  onClick={() => handleRequestSort('season')}
                  sx={{
                    color: 'white !important',
                    '&:hover': { color: 'rgba(255,255,255,0.8) !important' },
                    '& .MuiTableSortLabel-icon': { color: 'white !important' },
                  }}
                >
                  Season
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 150 }}>Subtitle Group</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 100 }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, width: 120 }} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((anime, index) => {
              const actualNo = localData.indexOf(anime) + 1;
              return (
                <TableRow
                  key={anime.id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(30, 64, 175, 0.05)',
                      cursor: 'pointer',
                    },
                    transition: 'background-color 200ms ease-in-out',
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography sx={{ fontFamily: 'var(--font-code)', fontWeight: 500 }}>
                      {actualNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>{anime.title}</Typography>
                  </TableCell>
                  <TableCell>{anime.episodes}</TableCell>
                  <TableCell>{anime.year}</TableCell>
                  <TableCell>
                    <Chip
                      label={anime.season}
                      size="small"
                      color={
                        anime.season === '春' ? 'success' :
                        anime.season === '夏' ? 'warning' :
                        anime.season === '秋' ? 'error' :
                        'info'
                      }
                    />
                  </TableCell>
                  <TableCell>{anime.subtitleGroup}</TableCell>
                  <TableCell>
                    <Chip
                      label={anime.id}
                      size="small"
                      sx={{
                        fontFamily: 'var(--font-code)',
                        bgcolor: 'var(--color-secondary)',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Visit Anime1.me">
                        <IconButton
                          href={anime.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          component="a"
                          size="small"
                          sx={{
                            color: 'var(--color-primary)',
                            transition: 'all 200ms ease-in-out',
                            '&:hover': {
                              color: 'var(--color-secondary)',
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={anime.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                        <IconButton
                          onClick={(e) => handleFavoriteToggle(anime.id, e)}
                          disabled={loadingId === anime.id}
                          size="small"
                          sx={{
                            color: anime.isFavorite ? '#e91e63' : 'rgba(0,0,0,0.3)',
                            transition: 'all 200ms ease-in-out',
                            opacity: loadingId === anime.id ? 0.5 : 1,
                            '&:hover': {
                              color: '#e91e63',
                              transform: 'scale(1.1)',
                            },
                            '&.Mui-disabled': {
                              color: anime.isFavorite ? '#e91e63' : 'rgba(0,0,0,0.3)',
                              opacity: 0.5,
                            }
                          }}
                        >
                          {anime.isFavorite ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No anime found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredAndSortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
        sx={{ borderTop: 1, borderColor: 'divider' }}
      />
    </Box>
  );
}
