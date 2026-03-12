export interface Anime {
  id: number;
  title: string;
  episodes: string;
  year: string;
  season: string;
  subtitleGroup: string;
  url: string;
  isFavorite?: boolean;
  addedDate?: string;
}

export interface AnimeStore {
  lastUpdated: string | null;
  animeList: Anime[];
}

export interface FavoriteEntry {
  id: number;
  addedDate: string;
}

export interface FavoritesStore {
  favorites: FavoriteEntry[];
}