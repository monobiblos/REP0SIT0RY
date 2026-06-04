import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { supabase } from '../../utils/supabase';

const ACCENT = '#2a56c6';
const ACCENT_LIGHT = '#4285f4';

const ShortcutsPreviewSection = memo(function ShortcutsPreviewSection() {
  const [shortcuts, setShortcuts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('repository_gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      setShortcuts(data || []);
    })();
  }, []);

  return (
    <Box
      component="section"
      id="shortcut"
      sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#fff' }}
    >
      <Container maxWidth="sm">

        {/* 헤더 */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
          variant="overline"
          sx={{ color: 'primary.main', letterSpacing: '0.2em', display: 'block', textAlign: 'center', mb: 1 }}
        >
        Gallery
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, textAlign: 'center', mb: 6, color: '#1a1a1a' }}
        >
        갤러리
        </Typography>
        </Box>

        {/* 갤러리 그리드 (최대 4개 미리보기) */}
        {shortcuts.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'text.disabled', py: 5, fontSize: '0.875rem' }}>
            등록된 바로가기가 없습니다.
          </Typography>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.5,
            mb: 3,
          }}>
            {shortcuts.map((item) => (
              <Box
                key={item.id}
                component={item.url ? "a" : "div"}
                href={item.url || undefined}
                target={item.url ? "_blank" : undefined}
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  border: `1px solid rgba(42,86,198,0.15)`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#fff',
                  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                  '&:hover': {
                    borderColor: ACCENT,
                    boxShadow: `0 4px 16px rgba(42,86,198,0.12)`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* 이미지 영역 */}
                <Box sx={{
                  width: '100%',
                  aspectRatio: '16/9',
                  overflow: 'hidden',
                  bgcolor: '#f5f8ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {item.image_url_1 ? (
                    <Box
                      component="img"
                      src={item.image_url_1}
                      alt={item.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.04)' },
                      }}
                    />
                  ) : (
                    <Typography sx={{
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      color: 'rgba(42,86,198,0.2)',
                      letterSpacing: '0.05em',
                    }}>
                      {item.title?.charAt(0)?.toUpperCase() || '?'}
                    </Typography>
                  )}
                </Box>

                {/* 텍스트 영역 */}
                <Box sx={{ px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                  <Typography sx={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#1a1a1a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
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
                    }}>
                      {item.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* 전체 보기 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={() => { navigate('/shortcuts'); window.scrollTo({ top: 0 }); }}
            size="small"
            sx={{
              borderRadius: 999,
              border: `1px solid ${ACCENT}`,
              color: ACCENT,
              px: 3,
              fontSize: '0.78rem',
              fontWeight: 600,
              '&:hover': { bgcolor: ACCENT_LIGHT, color: '#fff', borderColor: ACCENT_LIGHT },
            }}
          >
            전체 보기 →
          </Button>
        </Box>

      </Container>
    </Box>
  );
});

export default ShortcutsPreviewSection;
