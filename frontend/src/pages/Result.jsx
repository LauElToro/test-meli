import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchItems } from '../services/api';
import ItemCard from '../components/ItemCard';
import Breadcrumb from '../components/Breadcrumb';
import '../styles/Result.scss';

export default function Result() {
  const { search } = useLocation();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const query = new URLSearchParams(search).get('q');

  useEffect(() => {
    async function loadResults() {
      try {
        const data = await fetchItems(query);
        setItems(data.items);
        setCategories(data.categories);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los resultados');
      }
    }

    if (query) {
      loadResults();
    }
  }, [query]);

  if (error) return <p>{error}</p>;
  if (!items.length) return <p>No se encontraron resultados.</p>;

  return (
    <div className="result-page">
      <Breadcrumb categories={categories} />
      <div className="result-page__list">
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
