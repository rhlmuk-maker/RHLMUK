import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Database setup
  const db = new Database('reports.db');
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      customerName TEXT,
      date TEXT,
      blob_data BLOB,
      timestamp INTEGER
    )
  `);

  // API Routes
  app.get('/api/reports', (req, res) => {
    try {
      const reports = db.prepare('SELECT id, customerName, date, timestamp FROM reports ORDER BY timestamp DESC').all();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  });

  app.get('/api/reports/:id', (req, res) => {
    try {
      const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id) as any;
      if (report) {
        res.send(report.blob_data);
      } else {
        res.status(404).json({ error: 'Report not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch report' });
    }
  });

  app.post('/api/reports', express.raw({ type: 'application/pdf', limit: '10mb' }), (req, res) => {
    const { id, customerName, date } = req.query;
    if (!id || !customerName || !date) {
      return res.status(400).json({ error: 'Missing metadata' });
    }

    try {
      const stmt = db.prepare('INSERT OR REPLACE INTO reports (id, customerName, date, blob_data, timestamp) VALUES (?, ?, ?, ?, ?)');
      stmt.run(id, customerName, date, req.body, Date.now());
      res.json({ success: true });
    } catch (error) {
      console.error('Save error:', error);
      res.status(500).json({ error: 'Failed to save report' });
    }
  });

  app.delete('/api/reports/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete report' });
    }
  });

  // Vite integration
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
