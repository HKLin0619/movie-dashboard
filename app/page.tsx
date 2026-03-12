import { Box, Container, Typography } from '@mui/material';
import { getHomepageStats, refreshAnimeData } from '@/serveraction';
import CategoryCard from '@/components/CategoryCard';

export default async function Home() {
  const { lastUpdated, totalCount, favoriteCount } = await getHomepageStats();

  const categories = [
    {
      title: 'Anime1.me',
      count: totalCount,
      favorites: favoriteCount,
      imageUrl: 'https://anime1.me/favicon-32x32.png',
      color: 'var(--color-primary)',
      link: '/anime',
      lastUpdated,
      onRefresh: refreshAnimeData,
    },
    // Future categories can be added here
  ];

  return (
    <Container maxWidth="xl" sx={{ pt: 10, pb: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
          My Collections
        </Typography>
        {categories.map((category) => (
          <CategoryCard
            key={category.title}
            title={category.title}
            count={category.count}
            favorites={category.favorites}
            imageUrl={category.imageUrl}
            color={category.color}
            link={category.link}
            lastUpdated={category.lastUpdated}
            onRefresh={category.onRefresh}
          />
        ))}
      </Box>
    </Container>
  );
}
