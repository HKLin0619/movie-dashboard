'use client';

import { useState } from 'react';
import TopStats from '@/components/TopStats';
import AnimeTable from '@/components/AnimeTable';
import { Anime } from '@/types/anime1';
import { DashboardFilter } from '@/types/dashboard';

interface DashboardViewProps {
  data: Anime[];
  totalCount: number;
  favoriteCount: number;
  watchedCount: number;
  unwatchedCount: number;
  lastUpdated?: string | null;
  onRefresh?: () => Promise<{ success: boolean; count: number; error?: string }>;
}

export default function DashboardView({
  data,
  totalCount,
  favoriteCount,
  watchedCount,
  unwatchedCount,
  lastUpdated,
  onRefresh,
}: DashboardViewProps) {
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>('all');

  return (
    <>
      <TopStats
        totalCount={totalCount}
        favoriteCount={favoriteCount}
        watchedCount={watchedCount}
        unwatchedCount={unwatchedCount}
        lastUpdated={lastUpdated}
        onRefresh={onRefresh}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <AnimeTable data={data} filterMode={activeFilter} />
    </>
  );
}
