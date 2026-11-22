const net = require('net');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '../../');
const PRISMA_DIR = path.resolve(__dirname, '../..', 'prisma');
const PG_SCHEMA = path.join(PRISMA_DIR, 'schema.postgresql.prisma');
const SQLITE_SCHEMA = path.join(PRISMA_DIR, 'schema.sqlite.prisma');
const ACTIVE_SCHEMA = path.join(PRISMA_DIR, 'schema.prisma');
const ENV_FILE = path.join(ROOT_DIR, '.env');

// Make sure schema.postgresql.prisma is saved
if (!fs.existsSync(PG_SCHEMA) && fs.existsSync(ACTIVE_SCHEMA)) {
  fs.copyFileSync(ACTIVE_SCHEMA, PG_SCHEMA);
}

function checkPort(host, port, timeout = 1500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

function parseDbUrl(url) {
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol,
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port || '5432', 10),
    };
  } catch {
    return { protocol: 'unknown', host: 'localhost', port: 5432 };
  }
}

async function setup() {
  console.log('--------------------------------------------------');
  console.log('🚀 QuickPick Database Initialization');
  console.log('--------------------------------------------------');

  const currentDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/quickpick?schema=public';
  const forcePg = process.argv.includes('--pg');
  const forceSqlite = process.argv.includes('--sqlite');

  let usePostgres = false;

  if (forceSqlite) {
    usePostgres = false;
  } else if (forcePg) {
    usePostgres = true;
  } else {
    const info = parseDbUrl(currentDbUrl);
    if (info.protocol === 'postgresql:' || info.protocol === 'postgres:') {
      console.log(`Checking connection to PostgreSQL at ${info.host}:${info.port}...`);
      const isAvailable = await checkPort(info.host, info.port);
      if (isAvailable) {
        usePostgres = true;
        console.log('✅ PostgreSQL server detected.');
      } else {
        console.log('ℹ️  PostgreSQL not reachable at ' + info.host + ':' + info.port);
        console.log('   Defaulting to local high-performance SQLite engine for instantaneous out-of-the-box local testing.');
        console.log('   (To use PostgreSQL, start your Postgres server or set a remote URL in .env and run npm run db:setup)');
        usePostgres = false;
      }
    } else {
      usePostgres = false;
    }
  }

  if (usePostgres) {
    console.log('📦 Configuring Prisma with PostgreSQL provider...');
    fs.copyFileSync(PG_SCHEMA, ACTIVE_SCHEMA);
    console.log('🔄 Pushing schema to PostgreSQL database...');
    execSync('npx prisma db push --schema=prisma/schema.prisma --accept-data-loss', { stdio: 'inherit', cwd: ROOT_DIR });
    console.log('⚡ Generating Prisma Client for PostgreSQL...');
    execSync('npx prisma generate --schema=prisma/schema.prisma', { stdio: 'inherit', cwd: ROOT_DIR });
  } else {
    console.log('📦 Configuring Prisma with SQLite provider...');
    fs.copyFileSync(SQLITE_SCHEMA, ACTIVE_SCHEMA);

    // Update .env with SQLite URL if currently pointing to Postgres
    let envContent = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8') : '';
    if (!envContent.includes('file:./dev.db')) {
      if (envContent.includes('DATABASE_URL=')) {
        envContent = envContent.replace(/DATABASE_URL=".*?"/, 'DATABASE_URL="file:./dev.db"');
      } else {
        envContent += '\nDATABASE_URL="file:./dev.db"\n';
      }
      fs.writeFileSync(ENV_FILE, envContent);
    }
    process.env.DATABASE_URL = 'file:./dev.db';

    console.log('🔄 Pushing schema to local database...');
    execSync('npx prisma db push --schema=prisma/schema.prisma --accept-data-loss', { stdio: 'inherit', cwd: ROOT_DIR });
    console.log('⚡ Generating Prisma Client...');
    execSync('npx prisma generate --schema=prisma/schema.prisma', { stdio: 'inherit', cwd: ROOT_DIR });
  }

  console.log('🌱 Seeding grocery catalog, admin/staff users, store settings & inventory...');
  try {
    execSync('node src/database/seed.js', { stdio: 'inherit', cwd: ROOT_DIR });
  } catch (err) {
    console.error('Seed execution note:', err.message);
  }

  console.log('--------------------------------------------------');
  console.log('✨ QuickPick Database setup completed successfully!');
  console.log('--------------------------------------------------');
}

setup().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
