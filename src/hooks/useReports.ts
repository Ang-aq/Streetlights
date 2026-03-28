import { useState, useCallback } from 'react';
import type { Report, ReportTypeId } from '../types/report';

const STORAGE_KEY = 'streetlights_reports';
const LIKED_KEY   = 'streetlights_liked';

function loadReports(): Report[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Report[]) : [];
  } catch {
    return [];
  }
}

function saveReports(reports: Report[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function loadLiked(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveLiked(liked: Set<string>) {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...liked]));
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>(loadReports);
  const [likedIds, setLikedIds] = useState<Set<string>>(loadLiked);

  const addReport = useCallback((typeId: ReportTypeId, lat: number, lng: number) => {
    const report: Report = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      typeId,
      lat,
      lng,
      likes: 0,
      createdAt: Date.now(),
    };
    setReports(prev => {
      const next = [report, ...prev];
      saveReports(next);
      return next;
    });
  }, []);

  const likeReport = useCallback((id: string) => {
    setLikedIds(prev => {
      if (prev.has(id)) return prev; // already liked — no double-like
      const next = new Set(prev);
      next.add(id);
      saveLiked(next);
      return next;
    });
    setReports(prev => {
      const next = prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r);
      saveReports(next);
      return next;
    });
  }, []);

  // Reports sorted by likes descending
  const priorityReports = [...reports].sort((a, b) => b.likes - a.likes);

  return { reports, priorityReports, likedIds, addReport, likeReport };
}
