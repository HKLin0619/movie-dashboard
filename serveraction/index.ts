'use server';

import { Anime, AnimeStore } from '@/app/data/animeData';
import { promises as fs } from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'data', 'animeStore.json');

async function readStore(): Promise<AnimeStore> {
  try {
    const data = await fs.readFile(STORE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { lastUpdated: null, animeList: [] };
  }
}

async function writeStore(store: AnimeStore): Promise<void> {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

function generateAnimeUrl(title: string, year: string, season: string): string {
  // Handle season - if it contains "/", take the first part
  const seasonPart = season.includes('/') ? season.split('/')[0] : season;
  
  // Process title: remove all symbols and replace spaces with hyphens
  const processedTitle = title
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '') // Remove all symbols except Chinese, letters, numbers, and spaces
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
  
  const baseUrl = process.env.ANIME_CATEGORY_BASE_URL || 'https://anime1.me/category';
  return `${baseUrl}/${year}年${seasonPart}季/${processedTitle}`;
}

export async function getAnimeData(): Promise<Anime[]> {
  try {
    // 1. Read from store
    const store = await readStore();
    
    // 2. Fetch fresh data from API
    const apiUrl = process.env.NEXT_PUBLIC_ANIME_API_URL || 'https://anime1.me/animelist.json';
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch anime data');
    }
    
    const data: [number, string, string, string, string, string][] = await response.json();
    
    // 3. Create a map of existing favorites
    const favoriteMap = new Map<number, { isFavorite: boolean; addedDate: string }>();
    store.animeList.forEach(anime => {
      if (anime.isFavorite) {
        favoriteMap.set(anime.id, { 
          isFavorite: true, 
          addedDate: anime.addedDate || new Date().toISOString() 
        });
      }
    });
    
    // 4. Transform API data and merge with favorites
    const animeList: Anime[] = data.map(([id, title, episodes, year, season, subtitleGroup]) => {
      const favorite = favoriteMap.get(id);
      return {
        id,
        title,
        episodes,
        year,
        season,
        subtitleGroup,
        url: generateAnimeUrl(title, year, season),
        isFavorite: favorite?.isFavorite || false,
        addedDate: favorite?.addedDate
      };
    });
    
    // 5. Update store with merged data
    await writeStore({
      lastUpdated: new Date().toISOString(),
      animeList
    });
    
    return animeList;
  } catch (error) {
    console.error('Error fetching anime data:', error);
    // Return stored data if API fails
    const store = await readStore();
    return store.animeList;
  }
}

// Toggle favorite status
export async function toggleFavorite(animeId: number): Promise<boolean> {
  const store = await readStore();
  
  const anime = store.animeList.find(a => a.id === animeId);
  if (!anime) {
    return false;
  }
  
  anime.isFavorite = !anime.isFavorite;
  
  if (anime.isFavorite) {
    anime.addedDate = new Date().toISOString();
  } else {
    delete anime.addedDate;
  }
  
  await writeStore(store);
  return anime.isFavorite;
}
