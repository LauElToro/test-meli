import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = 3001;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const ML_BASE = 'https://api.mercadolibre.com';

if (!ACCESS_TOKEN) {
  console.error('❌ ACCESS_TOKEN no definido en el .env');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// GET /api/items?q=iphone&offset=0
app.get('/api/items', async (req, res) => {
  const { q, offset = 0 } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Falta el parámetro "q"' });
  }

  try {
    const response = await fetch(`${ML_BASE}/sites/MLA/search?q=${encodeURIComponent(q)}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Error de ML API:', text);
      return res.status(response.status).json({ error: 'Error desde la API de MercadoLibre' });
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      console.error('❌ Respuesta inválida de ML:', data);
      return res.status(500).json({ error: 'Respuesta inesperada de la API de MercadoLibre' });
    }

    const categories = data.filters?.find(f => f.id === 'category')?.values?.[0]?.path_from_root?.map(cat => cat.name) || [];

    const items = data.results.slice(0, 10).map(item => ({
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
      installments: item.installments?.quantity
        ? `${item.installments.quantity}x ${item.installments.amount}`
        : null,
    }));

    res.json({ categories, items });
  } catch (error) {
    console.error('❌ Error interno /api/items:', error);
    res.status(500).json({ error: 'Error interno al procesar la búsqueda' });
  }
});

// GET /api/items/:id
app.get('/api/items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [itemRes, descRes] = await Promise.all([
      fetch(`${ML_BASE}/items/${id}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }),
      fetch(`${ML_BASE}/items/${id}/description`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      }),
    ]);

    if (!itemRes.ok || !descRes.ok) {
      const itemText = await itemRes.text();
      const descText = await descRes.text();
      console.error('❌ Error obteniendo detalle:', itemText, descText);
      return res.status(500).json({ error: 'Error desde la API de MercadoLibre (detalle)' });
    }

    const itemData = await itemRes.json();
    const descData = await descRes.json();

    const categoryRes = await fetch(`${ML_BASE}/categories/${itemData.category_id}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    if (!categoryRes.ok) {
      const catText = await categoryRes.text();
      console.error('❌ Error en categoría:', catText);
      return res.status(500).json({ error: 'Error al obtener la categoría del producto' });
    }

    const categoryData = await categoryRes.json();

    const item = {
      id: itemData.id,
      title: itemData.title,
      price: {
        currency: itemData.currency_id,
        amount: Math.floor(itemData.price),
        decimals: Math.round((itemData.price % 1) * 100),
        regular_amount: itemData.original_price || null,
      },
      pictures: itemData.pictures?.map(p => p.url) || [itemData.thumbnail],
      condition: itemData.condition,
      free_shipping: itemData.shipping.free_shipping,
      sold_quantity: itemData.sold_quantity,
      installments: itemData.installments?.quantity
        ? `${itemData.installments.quantity}x ${itemData.installments.amount}`
        : null,
      description: descData.plain_text || '',
      attributes: itemData.attributes?.map(attr => ({
        id: attr.id,
        name: attr.name,
        value_name: attr.value_name,
      })),
      category_path_from_root: categoryData.path_from_root.map(cat => cat.name),
    };

    res.json({ item });
  } catch (error) {
    console.error('❌ Error interno /api/items/:id:', error);
    res.status(500).json({ error: 'Error interno al obtener el detalle del producto' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
