import './nvrsttl.css';
import { CartProvider } from './NvrsttlSite';

export const metadata = {
  title: 'NVRSTTL — Substance over spectacle',
  description: 'NVRSTTL. Washed textures, deliberate silhouettes and a darker edge.',
};

export default function NvrsttlLayout({ children }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <CartProvider>{children}</CartProvider>
    </>
  );
}
