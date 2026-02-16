import { useState, useEffect, useCallback, memo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import LockIcon from '@mui/icons-material/Lock';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

const BOOK_COLORS = ['#4285f4', '#5c9aff', '#3367d6', '#7baaf7', '#2a56c6', '#8ab4f8', '#1a73e8', '#669df6'];

const Book = memo(function Book({ index, title, isSecret, onClick }) {
  const color = BOOK_COLORS[index % BOOK_COLORS.length];
  const width = 24 + Math.random() * 16;
  return (
    <Box
      onClick={onClick}
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
        position: 'relative',
      }}
      title={title}
    >
      {isSecret && (
        <LockIcon sx={{ position: 'absolute', top: 4, fontSize: 10, color: 'rgba(255,255,255,0.7)' }} />
      )}
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
  const navigate = useNavigate();

  // Password dialog state
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const [pwTarget, setPwTarget] = useState(null);

  useEffect(() => {
    // Fetch public entries + secret entries with password
    supabase
      .from('repository_arcaives')
      .select('id, title, is_secret, secret_password')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        // Show: non-secret OR (secret with password)
        const visible = (data || []).filter(
          (b) => !b.is_secret || (b.is_secret && b.secret_password)
        );
        setBooks(visible);
      });
  }, []);

  const handleBookClick = useCallback((book) => {
    if (book.is_secret && book.secret_password) {
      setPwTarget(book);
      setPwInput('');
      setPwError(false);
      setPwDialogOpen(true);
    } else {
      navigate(`/arcaives/${book.id}`);
    }
  }, [navigate]);

  const handlePwSubmit = useCallback(() => {
    if (!pwTarget) return;
    if (pwInput === pwTarget.secret_password) {
      setPwDialogOpen(false);
      setPwInput('');
      setPwError(false);
      navigate(`/arcaives/${pwTarget.id}`, { state: { unlocked: true } });
      setPwTarget(null);
    } else {
      setPwError(true);
    }
  }, [pwInput, pwTarget, navigate]);

  const handlePwCancel = useCallback(() => {
    setPwDialogOpen(false);
    setPwInput('');
    setPwError(false);
    setPwTarget(null);
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
              <Book key={book.id} index={i} title={book.title} isSecret={book.is_secret} onClick={() => handleBookClick(book)} />
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
              <Book key={book.id} index={i + half} title={book.title} isSecret={book.is_secret} onClick={() => handleBookClick(book)} />
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

      {/* Password Dialog */}
      <Dialog open={pwDialogOpen} onClose={handlePwCancel} maxWidth="xs" fullWidth>
        <DialogTitle>비밀번호 입력</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            이 글은 비밀번호로 보호되어 있습니다. 비밀번호를 입력해주세요.
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="비밀번호"
            value={pwInput}
            onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={(e) => e.key === 'Enter' && handlePwSubmit()}
            error={pwError}
            helperText={pwError ? '비밀번호가 틀렸습니다.' : ''}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePwCancel}>취소</Button>
          <Button variant="contained" onClick={handlePwSubmit}>열기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default ArcaivesSection;
