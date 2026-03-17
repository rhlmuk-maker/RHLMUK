import { openDB, IDBPDatabase } from 'idb';

export interface SavedReport {
  id: string;
  customerName: string;
  date: string;
  blob: Blob;
  timestamp: number;
}

const DB_NAME = 'field-service-reports';
const STORE_NAME = 'reports';

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const saveReport = async (report: SavedReport) => {
  try {
    // Try saving to server first (if backend exists)
    const response = await fetch(`/api/reports?id=${encodeURIComponent(report.id)}&customerName=${encodeURIComponent(report.customerName)}&date=${encodeURIComponent(report.date)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: report.blob,
    });
    
    if (!response.ok) {
      console.warn('Server save failed, falling back to local storage');
    }
  } catch (e) {
    console.warn('Server unreachable, saving locally only');
  }

  // Always save to IndexedDB for offline access and Netlify compatibility
  const db = await initDB();
  await db.put(STORE_NAME, report);
};

export const getAllReports = async (): Promise<SavedReport[]> => {
  try {
    const response = await fetch('/api/reports');
    if (response.ok) {
      const reports = await response.json();
      return reports.map((r: any) => ({
        ...r,
        blob: new Blob([], { type: 'application/pdf' }), // Placeholder
      }));
    }
  } catch (e) {
    console.warn('Server unreachable, fetching local reports');
  }

  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

export const getReportBlob = async (id: string): Promise<Blob> => {
  try {
    const response = await fetch(`/api/reports/${id}`);
    if (response.ok) {
      return await response.blob();
    }
  } catch (e) {
    console.warn('Server unreachable, fetching local blob');
  }

  const db = await initDB();
  const report = await db.get(STORE_NAME, id);
  return report ? report.blob : new Blob([], { type: 'application/pdf' });
};

export const deleteReport = async (id: string) => {
  try {
    const response = await fetch(`/api/reports/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      console.warn('Server delete failed');
    }
  } catch (e) {
    console.warn('Server unreachable, deleting locally');
  }

  const db = await initDB();
  await db.delete(STORE_NAME, id);
};
