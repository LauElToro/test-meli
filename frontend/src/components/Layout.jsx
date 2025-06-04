import SearchBox from './SearchBox';
import '../styles/Layout.scss';

export default function Layout({ children }) {
  return (
    <>
      <header>
        <SearchBox />
      </header>
      <main>
        {children}
      </main>
    </>
  );
}