import { useState, useEffect, memo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { supabase } from '../utils/supabase';

const ACCENT = '#2a56c6';

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ dir }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'left'
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

// Lightbox
function Lightbox({ item, onClose }) {
  const [imgIndex, setImgIndex] = useState(0);
  const images = [item.image_url_1, item.image_url_2].filter(Boolean);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setImgIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setImgIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed', inset: 0, zIndex: 2000,
        bgcolor: 'rgba(0,0,0,0.88)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
      }}
    >
      {/* 닫기 */}
      <Box
        sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', cursor: 'pointer', opacity: 0.8, '&:hover': { opacity: 1 } }}
        onClick={onClose}
      >
        <CloseIcon />
      </Box>

      {/* 이미지 */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2, cursor: 'default' }}
      >
        {images.length > 1 && (
          <Box
            sx={{ color: '#fff', opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }}
            onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
          >
            <ChevronIcon dir="left" />
          </Box>
        )}

        <Box
          component="img"
          src={images[imgIndex]}
          alt={item.title}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          sx={{
            maxWidth: '80vw',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: 2,
            boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        {images.length > 1 && (
          <Box
            sx={{ color: '#fff', opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }}
            onClick={() => setImgIndex((i) => (i + 1) % images.length)}
          >
            <ChevronIcon dir="right" />
          </Box>
        )}
      </Box>

      {/* 제목 + 설명 */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</Typography>
        {item.description && (
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', mt: 0.5 }}>{item.description}</Typography>
        )}
        {images.length > 1 && (
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', mt: 1 }}>
            {imgIndex + 1} / {images.length}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// 카드
function GalleryCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false);
  const hasImages = item.image_url_1 || item.image_url_2;

  return (
    <Box
      onClick={() => hasImages && onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(42,86,198,0.12)',
        borderRadius: 2.5,
        overflow: 'hidden',
        bgcolor: '#fff',
        cursor: hasImages ? 'zoom-in' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        ...(hovered && hasImages && {
          borderColor: ACCENT,
          boxShadow: '0 4px 20px rgba(42,86,198,0.12)',
          transform: 'translateY(-3px)',
        }),
      }}
    >
      {/* 이미지 영역 */}
      <Box sx={{
        width: '100%', aspectRatio: '16/9',
        overflow: 'hidden', bgcolor: '#f0f4ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, position: 'relative',
      }}>
        {item.image_url_1 ? (
          <Box
            component="img"
            src={item.image_url_1}
            alt={item.title}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            sx={{
              width: '100%', height: '100%',
              objectFit: 'cover', display: 'block',
              userSelect: 'none', pointerEvents: 'none',
              transition: 'transform 0.35s ease',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
          />
        ) : (
          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(42,86,198,0.18)', userSelect: 'none' }}>
            {item.title?.charAt(0)?.toUpperCase() || '?'}
          </Typography>
        )}
        {/* 이미지 2개 배지 */}
        {item.image_url_1 && item.image_url_2 && (
          <Box sx={{
            position: 'absolute', bottom: 6, right: 6,
            bgcolor: 'rgba(0,0,0,0.5)', color: '#fff',
            fontSize: '0.62rem', fontWeight: 700,
            px: '5px', py: '2px', borderRadius: 1,
          }}>
            1 / 2
          </Box>
        )}
      </Box>

      {/* 텍스트 */}
      <Box sx={{ px: 1.5, pt: 1, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.4, flex: 1 }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
          {item.title}
        </Typography>
        {item.description && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
            {item.description}
          </Typography>
        )}
        {item.url && (
          <Typography
            component="a"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            sx={{
              fontSize: '0.65rem', color: 'rgba(42,86,198,0.5)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              mt: 'auto', pt: 0.5, textDecoration: 'none',
              '&:hover': { color: ACCENT, textDecoration: 'underline' },
            }}
          >
            {(() => { try { return new URL(item.url).hostname; } catch { return item.url; } })()}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

const ShortcutsPage = memo(function ShortcutsPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('repository_gallery')
        .select('*')
        .order('created_at', { ascending: false });
      setItems(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter((item) => {
    const q = query.toLowerCase();
    return item.title?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
  });

  return (
    <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="md">
        {/* 헤더 */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              Gallery
              <Box component="span" sx={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', bgcolor: ACCENT, mb: '8px' }} />
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled', pb: 0.5 }}>{filtered.length}개</Typography>
          </Box>
        </Box>

        {/* 검색 */}
        <Box sx={{ mb: 4 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: 'text.disabled' }}>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 320,
              '& .MuiOutlinedInput-root': { borderRadius: 999, bgcolor: '#fff', fontSize: '0.85rem' },
            }}
          />
        </Box>

        {/* 그리드 */}
        {loading ? (
          <Typography sx={{ textAlign: 'center', color: 'text.disabled', py: 10 }}>불러오는 중...</Typography>
        ) : filtered.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'text.disabled', py: 10, fontSize: '0.875rem' }}>
            {query ? '검색 결과가 없습니다.' : '등록된 항목이 없습니다.'}
          </Typography>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, md: 2 },
          }}>
            {filtered.map((item) => (
              <GalleryCard key={item.id} item={item} onClick={setLightboxItem} />
            ))}
          </Box>
        )}
      </Container>

      {lightboxItem && <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />}
    </Box>
  );
});

export default ShortcutsPage;
