import { useCallback, useEffect, useState } from 'react';

import { databaseService } from '../services';
import { Course } from '../types';
import { useApi } from './useApi';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const { loading, error, execute } = useApi<Course[]>();

  const loadCourses = useCallback(async () => {
    await execute(async () => {
      const data = await databaseService.courses.getAll();
      setCourses(data);
      return { data, error: null };
    });
  }, [execute]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return {
    courses,
    loading,
    error,
    refetch: loadCourses,
  };
}

export function useUserCourses(userId?: string) {
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const { loading, error, execute } = useApi<Course[]>();

  const loadUserCourses = useCallback(async () => {
    if (!userId) return;

    await execute(async () => {
      const data = await databaseService.courses.getPurchasedByUser(userId);
      setUserCourses(data);
      return { data, error: null };
    });
  }, [userId, execute]);

  useEffect(() => {
    loadUserCourses();
  }, [loadUserCourses]);

  return {
    userCourses,
    loading,
    error,
    refetch: loadUserCourses,
  };
}

export function useCourseProgress(userId?: string, courseId?: string) {
  const [progress, setProgress] = useState<{
    watchedMinutes: number;
    totalMinutes: number;
    completed: boolean;
  } | null>(null);


  const updateProgress = async (watchedMinutes: number) => {
    // This will save progress to the backend
    setProgress((prev) =>
      prev
        ? {
            ...prev,
            watchedMinutes,
            completed: watchedMinutes >= prev.totalMinutes * 0.95, // 95% watched = completed
          }
        : null,
    );
  };

  return {
    progress,
    updateProgress,
  };
}
