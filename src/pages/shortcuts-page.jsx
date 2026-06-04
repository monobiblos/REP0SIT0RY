import { useState, useEffect, memo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { supabase } from '../utils/supabase';

const ACCENT = '#2a56c6';

// 검색 아이콘 (SVG inline)
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

const ShortcutsPage = memo(function ShortcutsPage() {
  const [shortcuts, setShortcuts] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('repository_shortcuts')
        .select('*')
        .order('created_at', { ascending: false });
      setShortcuts(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = shortcuts.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  return (
    <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="md">

        {/* 페이지 헤더 */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 24, height: '1px', bgcolor: 'divider' }} />
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.18em', fontSize: '0.68rem' }}>
              Gallery
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              갤러리
              <Box component="span" sx={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', bgcolor: ACCENT, mb: '8px' }} />
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled', pb: 0.5 }}>
              {filtered.length}개
            </Typography>
          </Box>
        </Box>

        {/* 검색 */}
        <Box sx={{ mb: 4 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색..."
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: 'text.disabled' }}>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 320,
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                bgcolor: '#fff',
                fontSize: '0.85rem',
              },
            }}
          />
        </Box>

        {/* 갤러리 그리드 */}
        {loading ? (
          <Typography sx={{ textAlign: 'center', color: 'text.disabled', py: 10 }}>불러오는 중...</Typography>
        ) : filtered.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'text.disabled', py: 10, fontSize: '0.875rem' }}>
            {query ? '검색 결과가 없습니다.' : '등록된 바로가기가 없습니다.'}
          </Typography>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 1.5, md: 2 },
          }}>
            {filtered.map((item) => (
              <Box
                key={item.id}
                component="a"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  border: '1px solid rgba(42,86,198,0.12)',
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  bgcolor: '#fff',
                  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                  '&:hover': {
                    borderColor: ACCENT,
                    boxShadow: '0 4px 20px rgba(42,86,198,0.12)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                {/* 이미지 */}
                <Box sx={{
                  width: '100%',
                  aspectRatio: '16/9',
                  overflow: 'hidden',
                  bgcolor: '#f0f4ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.image_url ? (
                    <Box
                      component="img"
                      src={item.image_url}
                      alt={item.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.35s ease',
                        '.MuiBox-root:hover &': { transform: 'scale(1.06)' },
                      }}
                    />
                  ) : (
                    <Typography sx={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: 'rgba(42,86,198,0.18)',
                      letterSpacing: '0.05em',
                      userSelect: 'none',
                    }}>
                      {item.title?.charAt(0)?.toUpperCase() || '?'}
                    </Typography>
                  )}
                </Box>

                {/* 텍스트 */}
                <Box sx={{ px: 1.5, pt: 1, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.4, flex: 1 }}>
                  <Typography sx={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#1a1a1a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.4,
                  }}>
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography sx={{
                      fontSize: '0.7rem',
                      color: 'text.disabled',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.4,
                    }}>
                      {item.description}
                    </Typography>
                  )}
                  <Typography sx={{
                    fontSize: '0.65rem',
                    color: 'rgba(42,86,198,0.5)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mt: 'auto',
                    pt: 0.5,
                  }}>
                    {(() => {
                      try { return new URL(item.url).hostname; } catch { return item.url; }
                    })()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

      </Container>
    </Box>
  );
});

export default ShortcutsPage;
