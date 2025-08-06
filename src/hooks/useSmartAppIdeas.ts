import { useQuery } from '@tanstack/react-query';
import { 
  getSmartAppIdeasOpportunities, 
  getSmartAppIdeasStats, 
  getSmartAppIdeasDailyReport 
} from '@/api/smart-app-ideas';

export const useSmartAppIdeasOpportunities = (limit?: number) => {
  return useQuery({
    queryKey: ['smartAppIdeasOpportunities', limit],
    queryFn: () => getSmartAppIdeasOpportunities(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSmartAppIdeasStats = () => {
  return useQuery({
    queryKey: ['smartAppIdeasStats'],
    queryFn: getSmartAppIdeasStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
};

export const useSmartAppIdeasReport = () => {
  return useQuery({
    queryKey: ['smartAppIdeasReport'],
    queryFn: getSmartAppIdeasDailyReport,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000, // 1 hour
  });
};