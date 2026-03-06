import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-secondary">
      <Navbar />
      <main className="flex-1">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
