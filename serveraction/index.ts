"use server";

import { Anime } from "@/types/anime1";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// ─── URL generator ──────────────────────────────────────────────────────────

function generateAnimeUrl(title: string, year: string, season: string): string {
  const seasonPart = season.includes("/") ? season.split("/")[0] : season;
  const processedTitle = title
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s～【】!！×-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const baseUrl =
    process.env.ANIME_CATEGORY_BASE_URL || "https://anime1.me/category";
  return `${baseUrl}/${year}年${seasonPart}季/${processedTitle}`;
}

// ─── Public server actions ───────────────────────────────────────────────────

export async function getHomepageStats(): Promise<{
  lastUpdated: string | null;
  totalCount: number;
  favoriteCount: number;
}> {
  const [animeResult, favoritesResult, settingsResult] = await Promise.all([
    supabase.from("anime").select("id", { count: "exact", head: true }),

    supabase
      .from("favorites")
      .select("anime_id", { count: "exact", head: true }),

    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "anime_last_updated")
      .maybeSingle(),
  ]);

  if (animeResult.error) throw animeResult.error;
  if (favoritesResult.error) throw favoritesResult.error;
  if (settingsResult.error) throw settingsResult.error;

  return {
    lastUpdated: settingsResult.data?.value ?? null,
    totalCount: animeResult.count ?? 0,
    favoriteCount: favoritesResult.count ?? 0,
  };
}

export async function getAnimeData(): Promise<Anime[]> {
  const [animeData, favoritesResult, watchedResult] = await Promise.all([
    readAllAnime(),

    supabase.from("favorites").select("anime_id, added_date"),

    supabase.from("watched").select("anime_id, watched_date"),
  ]);

  if (favoritesResult.error) throw favoritesResult.error;
  if (watchedResult.error) throw watchedResult.error;

  const favoriteMap = new Map<number, string>();
  favoritesResult.data.forEach((favorite) => {
    favoriteMap.set(favorite.anime_id, favorite.added_date);
  });

  const watchedMap = new Map<number, string>();
  watchedResult.data.forEach((watched) => {
    watchedMap.set(watched.anime_id, watched.watched_date);
  });

  return animeData.map((anime) => ({
    id: anime.id,
    title: anime.title,
    episodes: anime.episodes,
    year: anime.year,
    season: anime.season,
    subtitleGroup: anime.subtitle_group,
    url: anime.url,
    isFavorite: favoriteMap.has(anime.id),
    addedDate: favoriteMap.get(anime.id),
    isWatched: watchedMap.has(anime.id),
    watchedDate: watchedMap.get(anime.id),
  }));
}

async function readAllAnime() {
  const pageSize = 1000;
  const allAnime = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("anime")
      .select("*")
      .order("id", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;

    allAnime.push(...data);

    if (data.length < pageSize) {
      break;
    }
  }

  return allAnime;
}

export async function refreshAnimeData(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_ANIME_API_URL ||
      "https://anime1.me/animelist.json";

    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`API returned status ${response.status}`);

    const data: [number, string, string, string, string, string][] =
      await response.json();

    const animeList: Anime[] = data.map(
      ([id, title, episodes, year, season, subtitleGroup]) => ({
        id,
        title,
        episodes,
        year,
        season,
        subtitleGroup,
        url: generateAnimeUrl(title, year, season),
      }),
    );

    const uniqueAnimeList = Array.from(
      new Map(animeList.map((anime) => [anime.id, anime])).values(),
    );

    const animeRows = uniqueAnimeList.map((anime) => ({
      id: anime.id,
      title: anime.title,
      episodes: anime.episodes,
      year: anime.year,
      season: anime.season,
      subtitle_group: anime.subtitleGroup,
      url: anime.url,
    }));

    const { error: animeError } = await supabase
      .from("anime")
      .upsert(animeRows, { onConflict: "id" });

    if (animeError) throw animeError;

    const lastUpdated = new Date().toISOString();

    const { error: settingsError } = await supabase
      .from("app_settings")
      .upsert({
        key: "anime_last_updated",
        value: lastUpdated,
      });

    if (settingsError) throw settingsError;

    // Refresh pages that depend on local JSON files.
    revalidatePath("/");
    revalidatePath("/anime");

    return { success: true, count: uniqueAnimeList.length };
  } catch (error) {
    console.error("Error refreshing anime data:", error);
    return { success: false, count: 0, error: String(error) };
  }
}

export async function toggleFavorite(animeId: number): Promise<boolean> {
  const { data: existingFavorite, error: findError } = await supabase
    .from("favorites")
    .select("anime_id")
    .eq("anime_id", animeId)
    .maybeSingle();

  if (findError) throw findError;

  if (existingFavorite) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("anime_id", animeId);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/anime");

    return false;
  }

  const { error } = await supabase.from("favorites").insert({
    anime_id: animeId,
    added_date: new Date().toISOString(),
  });

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/anime");

  return true;
}

export async function toggleWatched(animeId: number): Promise<boolean> {
  const { data: existingWatched, error: findError } = await supabase
    .from("watched")
    .select("anime_id")
    .eq("anime_id", animeId)
    .maybeSingle();

  if (findError) throw findError;

  if (existingWatched) {
    const { error } = await supabase
      .from("watched")
      .delete()
      .eq("anime_id", animeId);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/anime");

    return false;
  }

  const { error } = await supabase.from("watched").insert({
    anime_id: animeId,
    watched_date: new Date().toISOString(),
  });

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/anime");

  return true;
}
