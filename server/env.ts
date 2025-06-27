// server/env.ts
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger le .env depuis la racine du projet
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('🌍 Environment loaded');
console.log('DATABASE_URL found:', !!process.env.DATABASE_URL);