import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { supabase } from '../../utils/supabase';

const ACCENT = '#2a56c6';
const ACCENT_LIGHT = '#4285f4';

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
      {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

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
      <Box sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', cursor: 'pointer', opacity: 0.8, '&:hover': { opacity: 1 } }} onClick={onClose}>
        <CloseIcon />
      </Box>
      <Box onClick={(e) => e.stopPropagation()} sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2, cursor: 'default' }}>
        {images.length > 1 && (
          <Box sx={{ color: '#fff', opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }} onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}>
            <ChevronIcon dir="left" />
          </Box>
        )}
        <Box
          component="img"
          src={images[imgIndex]}
          alt={item.title}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          sx={{ maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 2, boxShadow: '0 8px 48px rgba(0,0,0,0.6)', userSelect: 'none', pointerEvents: 'none' }}
        />
        {images.length > 1 && (
          <Box sx={{ color: '#fff', opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }} onClick={() => setImgIndex((i) => (i + 1) % images.length)}>
            <ChevronIcon dir="right" />
          </Box>
        )}
      </Box>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</Typography>
        {item.description && <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', mt: 0.5 }}>{item.description}</Typography>}
        {images.length > 1 && <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', mt: 1 }}>{imgIndex + 1} / {images.length}</Typography>}
      </Box>
    </Box>
  );
}

function PreviewCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false);
  const hasImages = item.image_url_1 || item.image_url_2;

  return (
    <Box
      onClick={() => hasImages && onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(42,86,198,0.15)',
        borderRadius: 2, overflow: 'hidden', bgcolor: '#fff',
        cursor: hasImages ? 'zoom-in' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        ...(hovered && hasImages && {
          borderColor: ACCENT,
          boxShadow: '0 4px 16px rgba(42,86,198,0.12)',
          transform: 'translateY(-2px)',
        }),
      }}
    >
      <Box sx={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', bgcolor: '#f5f8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {item.image_url_1 ? (
          <Box
            component="img"
            src={item.image_url_1}
            alt={item.title}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            sx={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              userSelect: 'none', pointerEvents: 'none',
              transition: 'transform 0.3s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: 'rgba(42,86,198,0.2)' }}>
            {item.title?.charAt(0)?.toUpperCase() || '?'}
          </Typography>
        )}
        {item.image_url_1 && item.image_url_2 && (
          <Box sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.6rem', fontWeight: 700, px: '4px', py: '1px', borderRadius: 1 }}>
            1 / 2
          </Box>
        )}
      </Box>
      <Box sx={{ px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </Typography>
        {item.description && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

const ShortcutsPreviewSection = memo(function ShortcutsPreviewSection() {
  const [items, setItems] = useState([]);
  const [lightboxItem, setLightboxItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('repository_gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      setItems(data || []);
    })();
  }, []);

  return (
    <Box component="section" id="shortcut" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#fff' }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.2em', display: 'block', mb: 1 }}>
            Gallery
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            갤러리
          </Typography>
        </Box>

        {items.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'text.disabled', py: 5, fontSize: '0.875rem' }}>
            등록된 항목이 없습니다.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 3 }}>
            {items.map((item) => (
              <PreviewCard key={item.id} item={item} onClick={setLightboxItem} />
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={() => { navigate('/shortcuts'); window.scrollTo({ top: 0 }); }}
            size="small"
            sx={{
              borderRadius: 999, border: `1px solid ${ACCENT}`, color: ACCENT,
              px: 3, fontSize: '0.78rem', fontWeight: 600,
              '&:hover': { bgcolor: ACCENT_LIGHT, color: '#fff', borderColor: ACCENT_LIGHT },
            }}
          >
            전체 보기 →
          </Button>
        </Box>
      </Container>

      {lightboxItem && <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />}
    </Box>
  );
});

export default ShortcutsPreviewSection;
