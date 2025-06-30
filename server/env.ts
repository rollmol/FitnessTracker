// server/env.ts
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORRECTIF : Ne charger .env qu'en développement
if (process.env.NODE_ENV !== 'production') {
  // Charger le .env depuis la racine du projet (seulement en dev)
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  console.log('🌍 Environment loaded from .env file');
} else {
  console.log('🌍 Environment loaded from Railway variables');
}

console.log('DATABASE_URL found:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);