import AnimeTable from '@/components/AnimeTable';
import { getAnimeData } from '@/serveraction';
import { Container } from '@mui/material';

export default async function AnimePage() {
  const animeData = await getAnimeData();
  
  return (
    <Container maxWidth="xl" sx={{ pt: 8, pb: 2 }}>
      <AnimeTable data={animeData} />
    </Container>
  );
}
