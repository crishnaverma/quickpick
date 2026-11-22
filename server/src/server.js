const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const prisma = require('./database/prisma');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

// Auto-seed if database is empty on startup
const autoSeedIfEmpty = async () => {
  try {
    const { execSync } = require('child_process');
    const path = require('path');
    const schemaFile = process.env.DATABASE_URL?.startsWith('file:')
      ? 'prisma/schema.prisma'
      : 'prisma/schema.postgresql.prisma';

    console.log(`🔄 Verifying database schema tables using ${schemaFile}...`);
    try {
      execSync(`npx prisma db push --schema=${schemaFile} --accept-data-loss`, {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..'),
      });
      console.log('✅ Database schema verified and synchronized.');
    } catch (pushErr) {
      console.warn('Schema sync note (may already be up to date):', pushErr.message);
    }

    const productCount = await prisma.product.count();
    if (productCount === 0) {
      console.log('🌱 Database is empty (0 products found). Auto-seeding catalog & demo accounts...');
      const { seedDatabase } = require('./database/seed');
      await seedDatabase();
      console.log('✨ Auto-seed completed successfully!');
    }
  } catch (err) {
    console.warn('Auto-seed check note:', err.message);
  }
};

server.listen(PORT, async () => {
  console.log('====================================================');
  console.log(`🥦 QuickPick API Server running on port ${PORT}`);
  console.log(`⚡ Socket.IO real-time engine attached`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log('====================================================');
  await autoSeedIfEmpty();
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('\nShutting down QuickPick server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server and database connections closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
