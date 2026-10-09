import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mysqlPool = null;
let sqliteDb = null;
let activeEngine = 'sqlite'; // 'mysql' | 'sqlite'

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lifelink_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export async function getDatabase() {
  if (sqliteDb || mysqlPool) {
    return { engine: activeEngine, query };
  }

  // Attempt MySQL connection if explicitly requested or configured
  if (process.env.DB_ENGINE === 'mysql' || (!process.env.DB_ENGINE && process.env.DB_PASSWORD)) {
    try {
      const pool = mysql.createPool(dbConfig);
      const conn = await pool.getConnection();
      conn.release();
      mysqlPool = pool;
      activeEngine = 'mysql';
      console.log(`[Database] Connected to MySQL database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);
      return { engine: activeEngine, query };
    } catch (err) {
      console.warn(`[Database] MySQL connection attempt failed (${err.message}). Falling back to local SQLite engine.`);
    }
  }

  // Initialize SQLite database
  const dbDir = path.resolve(__dirname, '../../../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = process.env.SQLITE_PATH || path.join(dbDir, 'lifelink.sqlite');
  
  await new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      activeEngine = 'sqlite';
      console.log(`[Database] Connected to SQLite database at ${dbPath}`);
      resolve();
    });
  });

  // Enable foreign keys in SQLite
  await executeRaw('PRAGMA foreign_keys = ON;');

  return { engine: activeEngine, query };
}

function executeRaw(sql) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Universal SQL query executor
 * Supports parameterized queries with '?' syntax for both MySQL and SQLite
 */
export async function query(sql, params = []) {
  if (!sqliteDb && !mysqlPool) {
    await getDatabase();
  }

  if (activeEngine === 'mysql') {
    const [rows, fields] = await mysqlPool.execute(sql, params);
    if (rows && typeof rows.insertId !== 'undefined') {
      return { insertId: rows.insertId, affectedRows: rows.affectedRows, rows: [] };
    }
    return rows;
  }

  // SQLite execution
  return new Promise((resolve, reject) => {
    const trimmed = sql.trim();
    const isSelect = /^(SELECT|PRAGMA|SHOW|DESCRIBE)/i.test(trimmed);

    if (isSelect) {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) {
          console.error('[DB Query Error]', sql, params, err);
          return reject(err);
        }
        resolve(rows || []);
      });
    } else {
      sqliteDb.run(sql, params, function (err) {
        if (err) {
          console.error('[DB Exec Error]', sql, params, err);
          return reject(err);
        }
        resolve({
          insertId: this.lastID,
          affectedRows: this.changes,
          rows: []
        });
      });
    }
  });
}

export function getActiveEngine() {
  return activeEngine;
}
