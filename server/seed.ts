// server/seed.ts
import './env.js';  // Charger l'environnement
import { storage } from './storage.js';

async function main() {
  try {
    console.log('🌱 Starting database seeding...');
    await storage.initializeData();
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();