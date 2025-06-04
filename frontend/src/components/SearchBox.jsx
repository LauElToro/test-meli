import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/SearchBox.scss';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/items?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <input
        className="search-box__input"
        type="text"
        placeholder="Buscar productos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="search-box__button" type="submit">
        Buscar
      </button>
    </form>
  );
}