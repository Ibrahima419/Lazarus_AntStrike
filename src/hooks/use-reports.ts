/**
 * 📊 useReports - React Query hooks for reports
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService, type GenerateReportData } from '../services/api/report.service';

export const useReports = (limit?: number) => {
  return useQuery({
    queryKey: ['reports', limit],
    queryFn: () => reportService.getReports(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportService.getReport(id),
    enabled: !!id,
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateReportData) => reportService.generateReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename: string }) =>
      reportService.downloadAndSave(id, filename),
  });
};


