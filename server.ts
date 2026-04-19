import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Allow iframes and PDF display
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'ALLOW-FROM *'); // For older browsers
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *;"); // Modern browsers
    next();
  });

  // Simple Auth Middleware
  const classroomPassword = process.env.CLASSROOM_PASSWORD || 'pong';

  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === classroomPassword) {
      // In a real app, use a proper session/JWT. 
      // For this "simple classroom" request, we just set a known cookie.
      res.cookie('auth_token', 'class-access-granted', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
      });
      return res.json({ success: true });
    }
    return res.status(401).json({ success: false, message: 'Invalid password' });
  });

  app.get('/api/auth/check', (req, res) => {
    if (req.cookies.auth_token === 'class-access-granted') {
      return res.json({ authenticated: true });
    }
    return res.json({ authenticated: false });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    return res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
