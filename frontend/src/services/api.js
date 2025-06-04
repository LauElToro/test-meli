export async function fetchItems(query, offset = 0) {
  const res = await fetch(`/api/items?q=${encodeURIComponent(query)}&offset=${offset}`);
  if (!res.ok) {
    throw new Error(`Error al buscar productos: ${res.status}`);
  }

  const data = await res.json();
  return data;
}

export async function fetchItemDetail(id) {
  const res = await fetch(`/api/items/${id}`);
  if (!res.ok) {
    throw new Error(`Error al obtener el detalle del producto: ${res.status}`);
  }

  const data = await res.json();
  return data;
}
