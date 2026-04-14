import Box from '@mui/material/Box';
import HeroSection from '../components/landing/hero-section';
import ArcaivesSection from '../components/landing/arcaives-section';
import MemoSection from '../components/landing/memo-section';
import GuestbookSection from '../components/landing/guestbook-section';
import ContactSection from '../components/landing/contact-section';

function HomePage() {
  return (
    <Box component="main">
      <HeroSection />
      <ArcaivesSection />
      <MemoSection />
      <GuestbookSection />
      <ContactSection />
    </Box>
  );
}

export default HomePage;