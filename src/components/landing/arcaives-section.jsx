import { useState, useEffect, memo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

const BOOK_COLORS = ['#4285f4', '#5c9aff', '#3367d6', '#7baaf7', '#2a56c6', '#8ab4f8', '#1a73e8', '#669df6'];

const Book = memo(function Book({ index, title }) {
  const color = BOOK_COLORS[index % BOOK_COLORS.length];
  const width = 24 + Math.random() * 16;
  return (
    <Box
      sx={{
        width: `${width}px`,
        height: '100%',
        backgroundColor: color,
        borderRadius: '1px 3px 3px 1px',
        border: '1px solid rgba(0,0,0,0.15)',
        borderLeft: '2px solid rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        '&:hover': { transform: 'translateY(-4px)' },
      }}
      title={title}
    >
      <Typography
        sx={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: '0.55rem',
          color: '#fff',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxHeight: '90%',
          letterSpacing: '0.02em',
        }}
      >
        {title}
      </Typography>
    </Box>
  );
});

const ArcaivesSection = memo(function ArcaivesSection() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    supabase
      .from('repository_arcaives')
      .select('id, title')
      .eq('is_secret', false)
      .order('sort_order', { ascending: true })
      .then(({ data }) => setBooks(data || []));
  }, []);

  const shelfStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '2px',
    px: 2,
    pb: '6px',
    minHeight: 120,
    borderBottom: '3px solid #1a1a1a',
    borderLeft: '2px solid #1a1a1a',
    borderRight: '2px solid #1a1a1a',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -8,
      left: -4,
      right: -4,
      height: 5,
      backgroundColor: '#1a1a1a',
      borderRadius: '0 0 2px 2px',
    },
  };

  const half = Math.ceil(books.length / 2);
  const topShelf = books.slice(0, half);
  const bottomShelf = books.slice(half);

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#fff' }}>
      <Container maxWidth="md">
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', letterSpacing: '0.2em', display: 'block', textAlign: 'center', mb: 1 }}
        >
          Arcaives
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, textAlign: 'center', mb: 6, color: '#1a1a1a' }}
        >
          책장
        </Typography>

        <Box sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
          {/* Top shelf */}
          <Box sx={{ ...shelfStyle, height: 130 }}>
            {topShelf.map((book, i) => (
              <Book key={book.id} index={i} title={book.title} />
            ))}
            {topShelf.length === 0 && (
              <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', m: 'auto' }}>
                빈 선반...
              </Typography>
            )}
          </Box>
          {/* Bottom shelf */}
          <Box sx={{ ...shelfStyle, height: 130, mt: 3 }}>
            {bottomShelf.map((book, i) => (
              <Book key={book.id} index={i + half} title={book.title} />
            ))}
            {books.length > 0 && bottomShelf.length === 0 && (
              <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', m: 'auto' }}>
                빈 선반...
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Button component={Link} to="/arcaives" variant="outlined" size="small">
            전체 보기
          </Button>
        </Box>
      </Container>
    </Box>
  );
});

export default ArcaivesSection;
