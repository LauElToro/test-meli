import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchItemDetail } from '../services/api';
import Breadcrumb from '../components/Breadcrumb';
import '../styles/Detail.scss';

export default function Detail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await fetchItemDetail(id);
        setItem(data.item);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el producto');
      }
    }

    loadDetail();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!item) return <p>Cargando...</p>;

  const imageUrl = item.pictures?.[0] || '/placeholder.jpg';

  return (
    <div className="detail-page">
      <Breadcrumb categories={item.category_path_from_root} />

      <div className="detail-page__main">
        <div className="detail-page__image">
          <img
            src={imageUrl}
            alt={item.title}
            onError={(e) => (e.target.src = '/placeholder.jpg')}
          />
        </div>
        <div className="detail-page__info">
          <p className="detail-page__condition">
            {item.condition === 'new' ? 'Nuevo' : 'Usado'} - {item.sold_quantity} vendidos
          </p>
          <h1 className="detail-page__title">{item.title}</h1>
          <p className="detail-page__price">
            ${item.price.amount.toLocaleString()}
            <sup>{item.price.decimals.toString().padStart(2, '0')}</sup>
          </p>
          <button className="detail-page__button">Comprar</button>
        </div>
      </div>

      <div className="detail-page__description">
        <h2>Descripción del producto</h2>
        <p>{item.description}</p>
      </div>
    </div>
  );
}
