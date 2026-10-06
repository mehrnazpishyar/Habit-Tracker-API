import dotenv from 'dotenv';

dotenv.config({ path: '.env.test', override: true, quiet: true });

const url = process.env.DATABASE_URL ?? '';
const dbName = url ? new URL(url).pathname.replace('/', '') : '';

if (!dbName.endsWith('_test')) {
  throw new Error(
    `Abbruch: Tests dürfen nur gegen eine Datenbank laufen, deren Name auf "_test" endet (gefunden: "${dbName}").`,
  );
}