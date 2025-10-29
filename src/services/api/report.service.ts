/**
 * 📊 Report Service - API calls for reports
 */

import apiClient from '../../lib/api-client';

export type ReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND' | 'INCIDENT';
export type ReportFormat = 'HTML' | 'PDF' | 'JSON' | 'CSV';

export interface GenerateReportData {
  type: ReportType;
  format: ReportFormat;
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  sendEmail?: boolean;
  recipients?: string[];
}

export interface Report {
  id: string;
  tenantId: string;
  type: ReportType;
  format: ReportFormat;
  title: string;
  storiesCount: number;
  period: string;
  sentTo: string[];
  sentVia: string;
  generatedAt: string;
}

export interface ReportResponse {
  message: string;
  reportId: string;
  filename: string;
  mimeType: string;
  content: string;
}

export const reportService = {
  /**
   * Get reports list
   */
  async getReports(limit?: number): Promise<Report[]> {
    const response = await apiClient.get<Report[]>('/reports', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Generate report
   */
  async generateReport(data: GenerateReportData): Promise<ReportResponse> {
    const response = await apiClient.post<ReportResponse>('/reports/generate', data);
    return response.data;
  },

  /**
   * Get single report
   */
  async getReport(id: string): Promise<Report> {
    const response = await apiClient.get<Report>(`/reports/${id}`);
    return response.data;
  },

  /**
   * Download report
   */
  async downloadReport(id: string): Promise<Blob> {
    const response = await apiClient.get(`/reports/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Download report and trigger browser download
   */
  async downloadAndSave(id: string, filename: string): Promise<void> {
    const blob = await this.downloadReport(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};


