import Redis from "ioredis";

// Konfigurasi Redis
const redis = new Redis({
  host: '127.0.0.1', // Ganti dengan host Redis Anda
  port: 6379,        // Ganti dengan port Redis Anda jika berbeda
  password: '',      // Ganti dengan password jika Redis Anda dilindungi
  db: 0,             // Pilih nomor database Redis jika perlu
});

// Menangani kesalahan koneksi
redis.on('error', (err) => {
  console.error('Redis error:', err);
});

// Menangani koneksi yang terputus
redis.on('connect', () => {
  console.log('Connected to Redis');
});

export default redis;
