import 'dotenv/config';
import app from './app.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET fehlt in der .env');
  process.exit(1);
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server läuft auf Port http://localhost:${port}`);
});