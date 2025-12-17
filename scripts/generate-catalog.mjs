#!/usr/bin/env node
/**
 * Script to regenerate health-catalog.ttl from the frontend serializer
 * Run from MVD-health root with: node scripts/generate-catalog.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the mockData directly
const mockDataPath = path.join(__dirname, '../frontend/src/services/mockData-health.ts');
console.log(`Reading mock data from: ${mockDataPath}`);

// Execute the serializer logic inline since we can't directly import TypeScript
// Instead, let's just trigger the frontend to generate and download

console.log('To regenerate the TTL:');
console.log('1. Start the frontend: cd frontend && npm run dev');
console.log('2. Open http://localhost:3000');
console.log('3. Click the "HealthDCAT-AP" button to download');
console.log('4. Copy to resources/health-catalog.ttl');
console.log('');
console.log('Alternatively, run the validation on the existing TTL:');
console.log('  ./resources/validate-healthdcat.sh');
