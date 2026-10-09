require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
prisma.$queryRaw`SELECT 1 AS ok`
  .then((rows) => console.log(`Database connection OK: ${rows[0].ok}`))
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
