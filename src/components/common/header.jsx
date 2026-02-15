import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Arcaives', path: '/arcaives' },
  { label: 'Memo', path: '/memo' },
  { label: 'Short Cut', path: '/#shortcut' },
];

const Header = memo(function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentTab = NAV_ITEMS.findIndex((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path.replace('/#', ''))
  );

  const handleChange = useCallback((_, newValue) => {
    const item = NAV_ITEMS[newValue];
    if (item.path.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(item.path.replace('/#', ''));
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      } else {
        const el = document.getElementById(item.path.replace('/#', ''));
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(item.path);
      window.scrollTo({ top: 0 });
    }
  }, [navigate, location.pathname]);

  return (
    <AppBar
      position="fixed"
      elevation={scrolled ? 2 : 0}
      sx={{
        backgroundColor: scrolled ? '#4285f4' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.35s ease',
        borderBottom: scrolled ? 'none' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', minHeight: { xs: 56, md: 64 } }}>
        <Typography
          variant="subtitle2"
          sx={{
            position: 'absolute',
            left: 24,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: scrolled ? '#fff' : '#1a1a1a',
            transition: 'color 0.35s ease',
            display: { xs: 'none', md: 'block' },
            cursor: 'pointer',
          }}
          onClick={() => { navigate('/'); window.scrollTo({ top: 0 }); }}
        >
          REP0SIT0RY
        </Typography>
        <Tabs
          value={currentTab >= 0 ? currentTab : false}
          onChange={handleChange}
          textColor="inherit"
          TabIndicatorProps={{
            sx: {
              backgroundColor: scrolled ? '#fff' : '#4285f4',
              transition: 'background-color 0.35s ease',
            },
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Tab
              key={item.label}
              label={item.label}
              sx={{
                color: scrolled ? 'rgba(255,255,255,0.85)' : '#5f6368',
                '&.Mui-selected': { color: scrolled ? '#fff' : '#4285f4' },
                fontWeight: 600,
                fontSize: '0.85rem',
                letterSpacing: '0.04em',
                transition: 'color 0.35s ease',
                minWidth: 90,
              }}
            />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
});

export default Header;
