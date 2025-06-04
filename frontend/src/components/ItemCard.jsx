import { useNavigate } from 'react-router-dom';
import '../styles/ItemCard.scss';

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <div className="item-card" onClick={() => navigate(`/items/${item.id}`)}>
      <img
        src={item.picture}
        alt={item.title}
        onError={(e) => (e.target.src = '/placeholder.jpg')}
      />
      <div className="item-card__info">
        <p className="item-card__price">
          ${item.price.amount.toLocaleString()}
          <sup>{item.price.decimals.toString().padStart(2, '0')}</sup>
        </p>
        <h2 className="item-card__title">{item.title}</h2>
        <p className="item-card__shipping">
          {item.free_shipping ? 'Envío gratis' : 'Con envío'}
        </p>
      </div>
    </div>
  );
}