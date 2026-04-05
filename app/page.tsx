import { Box, Container } from '@mui/material';
import { getAnimeData, getHomepageStats, refreshAnimeData } from '@/serveraction';
import DashboardView from '@/components/DashboardView';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [{ lastUpdated, totalCount, favoriteCount }, animeData] = await Promise.all([
    getHomepageStats(),
    getAnimeData(),
  ]);
  const watchedCount = animeData.filter((anime) => anime.isFavorite && anime.isWatched).length;
  const unwatchedCount = animeData.filter((anime) => anime.isFavorite && !anime.isWatched).length;

  return (
    <Container maxWidth="xl" sx={{ pt: 6, pb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <DashboardView
          data={animeData}
          totalCount={totalCount}
          favoriteCount={favoriteCount}
          watchedCount={watchedCount}
          unwatchedCount={unwatchedCount}
          lastUpdated={lastUpdated}
          onRefresh={refreshAnimeData}
        />
      </Box>
    </Container>
  );
}
