import { Box, Container } from '@mui/material';
import { getAnimeData } from '@/serveraction';
import CategoryCard from '@/components/CategoryCard';

export default async function Home() {
  const animeData = await getAnimeData();
  
  // Calculate statistics
  const totalAnime = animeData.length;
  const favoriteCount = animeData.filter(anime => anime.isFavorite).length;

  const categories = [
    {
      title: 'Anime1.me',
      count: totalAnime,
      favorites: favoriteCount,
      imageUrl: 'https://anime1.me/favicon-32x32.png',
      color: 'var(--color-primary)',
      link: '/anime',
    },
    // Future categories can be added here
  ];

  return (
    <Container maxWidth="xl" sx={{ pt: 10, pb: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {categories.map((category) => (
          <CategoryCard
            key={category.title}
            title={category.title}
            count={category.count}
            favorites={category.favorites}
            imageUrl={category.imageUrl}
            color={category.color}
            link={category.link}
          />
        ))}
      </Box>
    </Container>
  );
}
