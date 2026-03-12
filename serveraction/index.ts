'use server';

import { Anime, AnimeStore, FavoritesStore } from '@/types/anime1';
import { promises as fs } from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'data', 'anime1', 'store.json');
const FAVORITES_PATH = path.join(process.cwd(), 'data', 'anime1', 'favorites.json');

// ─── animeStore.json (API data only) ────────────────────────────────────────

async function readStore(): Promise<AnimeStore> {
  try {
    const data = await fs.readFile(STORE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { lastUpdated: null, animeList: [] };
  }
}

async function writeStore(store: AnimeStore): Promise<void> {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// ─── favorites.json (user favorites, id + addedDate only) ───────────────────

async function readFavorites(): Promise<FavoritesStore> {
  try {
    const data = await fs.readFile(FAVORITES_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { favorites: [] };
  }
}

async function writeFavorites(store: FavoritesStore): Promise<void> {
  await fs.writeFile(FAVORITES_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// ─── URL generator ──────────────────────────────────────────────────────────

function generateAnimeUrl(title: string, year: string, season: string): string {
  const seasonPart = season.includes('/') ? season.split('/')[0] : season;
  const processedTitle = title
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const baseUrl = process.env.ANIME_CATEGORY_BASE_URL || 'https://anime1.me/category';
  return `${baseUrl}/${year}年${seasonPart}季/${processedTitle}`;
}

// ─── Public server actions ───────────────────────────────────────────────────

export async function getHomepageStats(): Promise<{ lastUpdated: string | null; totalCount: number; favoriteCount: number }> {
  const [store, favStore] = await Promise.all([readStore(), readFavorites()]);
  return {
    lastUpdated: store.lastUpdated,
    totalCount: store.animeList.length,
    favoriteCount: favStore.favorites.length,
  };
}

export async function getAnimeData(): Promise<Anime[]> {
  const [store, favStore] = await Promise.all([readStore(), readFavorites()]);

  const favoriteMap = new Map<number, string>(); // id → addedDate
  favStore.favorites.forEach(f => favoriteMap.set(f.id, f.addedDate));

  return store.animeList.map(anime => ({
    ...anime,
    isFavorite: favoriteMap.has(anime.id),
    addedDate: favoriteMap.get(anime.id),
  }));
}

export async function refreshAnimeData(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ANIME_API_URL || 'https://anime1.me/animelist.json';
    const response = await fetch(apiUrl, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data: [number, string, string, string, string, string][] = await response.json();

    const animeList: Anime[] = data.map(([id, title, episodes, year, season, subtitleGroup]) => ({
      id,
      title,
      episodes,
      year,
      season,
      subtitleGroup,
      url: generateAnimeUrl(title, year, season),
    }));

    await writeStore({
      lastUpdated: new Date().toISOString(),
      animeList,
    });

    return { success: true, count: animeList.length };
  } catch (error) {
    console.error('Error refreshing anime data:', error);
    return { success: false, count: 0, error: String(error) };
  }
}

export async function toggleFavorite(animeId: number): Promise<boolean> {
  const favStore = await readFavorites();

  const existingIndex = favStore.favorites.findIndex(f => f.id === animeId);
  const isNowFavorite = existingIndex === -1;

  if (isNowFavorite) {
    favStore.favorites.push({ id: animeId, addedDate: new Date().toISOString() });
  } else {
    favStore.favorites.splice(existingIndex, 1);
  }

  await writeFavorites(favStore);
  return isNowFavorite;
}

