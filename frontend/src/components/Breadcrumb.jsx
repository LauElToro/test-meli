import '../styles/Breadcrumb.scss';

export default function Breadcrumb({ categories }) {
  if (!categories?.length) return null;

  return (
    <nav className="breadcrumb">
      {categories.map((cat, idx) => (
        <span key={cat}>
          {cat}
          {idx < categories.length - 1 && ' > '}
        </span>
      ))}
    </nav>
  );
}