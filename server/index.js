import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import https from 'https';
import fs from 'fs';

dotenv.config();
console.log('🧪 ENV CLIENT_ID:', process.env.ML_CLIENT_ID);
console.log('🧪 ENV CLIENT_SECRET:', process.env.ML_CLIENT_SECRET);

const app = express();
const PORT = 443;
const ML_BASE = 'https://api.mercadolibre.com';

const CLIENT_ID = process.env.ML_CLIENT_ID;
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;

let accessToken = null;
let refreshToken = null;

app.use(cors());
app.use(express.json());

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: 'https://local.meli.test'
  });

  console.log('🟡 Enviando a MercadoLibre:', params.toString());

  try {
    const tokenRes = await fetch(`${ML_BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('❌ Error al obtener el token:', tokenData);
      return res.status(500).json({ error: 'No se pudo obtener el token', details: tokenData });
    }

    accessToken = tokenData.access_token;
    refreshToken = tokenData.refresh_token;

    console.log('✅ Token obtenido:', tokenData);
    res.send(`<h1>✅ Autenticado correctamente</h1><pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
  } catch (error) {
    console.error('❌ Error en /auth/callback:', error);
    res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

// Endpoint para renovar el token
app.post('/auth/refresh', async (_, res) => {
  if (!refreshToken) return res.status(400).send('No hay refresh_token guardado');

  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken
    });

    const response = await fetch(`${ML_BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    const data = await response.json();
    if (data.access_token) {
      accessToken = data.access_token;
      refreshToken = data.refresh_token;
      console.log('🔁 Token renovado:', accessToken);
      return res.json({ access_token: accessToken });
    } else {
      return res.status(500).json({ error: 'No se pudo renovar el token' });
    }
  } catch (err) {
    console.error('❌ Error al renovar token:', err);
    return res.status(500).json({ error: 'Error interno al renovar token' });
  }
});

// Endpoint de búsqueda
app.get('/api/items', async (req, res) => {
  const { q, offset = 0 } = req.query;
  if (!q || !accessToken) return res.status(400).json({ error: 'Falta parámetro o token' });

  try {
    const response = await fetch(`${ML_BASE}/sites/MLA/search?q=${encodeURIComponent(q)}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();

    const categories = data.filters?.find(f => f.id === 'category')?.values?.[0]?.path_from_root?.map(cat => cat.name) || [];

    const items = data.results?.slice(0, 10).map(item => ({
      id: item.id,
      title: item.title,
      price: {
        currency: item.currency_id,
        amount: Math.floor(item.price),
        decimals: Math.round((item.price % 1) * 100),
        regular_amount: item.original_price || null,
      },
      picture: item.thumbnail,
      condition: item.condition,
      free_shipping: item.shipping.free_shipping,
      installments: item.installments?.quantity ? `${item.installments.quantity}x ${item.installments.amount}` : null,
    })) || [];

    res.json({ categories, items });
  } catch (error) {
    console.error('❌ Error /api/items:', error);
    res.status(500).json({ error: 'Error en búsqueda de productos' });
  }
});

// Servir archivos estáticos (index.html)
app.use(express.static('public'));

// Servidor HTTPS con certificado local
const options = {
  key: fs.readFileSync('./cert/local.meli.test-key.pem'),
  cert: fs.readFileSync('./cert/local.meli.test.pem')
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`✅ HTTPS server running at https://local.meli.test`);
});
