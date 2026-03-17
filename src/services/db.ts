import { openDB, IDBPDatabase } from 'idb';

export interface SavedReport {
  id: string;
  customerName: string;
  date: string;
  blob: Blob;
  timestamp: number;
}

export const saveReport = async (report: SavedReport) => {
  const response = await fetch(`/api/reports?id=${encodeURIComponent(report.id)}&customerName=${encodeURIComponent(report.customerName)}&date=${encodeURIComponent(report.date)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/pdf',
    },
    body: report.blob,
  });
  if (!response.ok) throw new Error('Failed to save report to server');
};

export const getAllReports = async (): Promise<SavedReport[]> => {
  const response = await fetch('/api/reports');
  if (!response.ok) throw new Error('Failed to fetch reports');
  const reports = await response.json();
  
  // We don't fetch all blobs at once, we'll fetch them on demand
  return reports.map((r: any) => ({
    ...r,
    blob: new Blob([], { type: 'application/pdf' }), // Placeholder
  }));
};

export const getReportBlob = async (id: string): Promise<Blob> => {
  const response = await fetch(`/api/reports/${id}`);
  if (!response.ok) throw new Error('Failed to fetch report blob');
  return await response.blob();
};

export const deleteReport = async (id: string) => {
  const response = await fetch(`/api/reports/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete report');
};
