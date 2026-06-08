import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import { supabase } from '../utils/supabase';

function MemoDrawer({ memo, onClose }) {
  if (!memo) return null;
  return (
    <Drawer
      anchor="right"
      open={!!memo}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 480 },
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        },
      }}
    >
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a1a', lineHeight: 1.4, flex: 1 }}>
          {memo.title}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ flexShrink: 0, mt: '-4px' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* 태그 */}
      {memo.tags && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {memo.tags.split(',').map((tag) => (
            <Chip
              key={tag.trim()} label={tag.trim()} size="small"
              variant="outlined" color="primary"
              sx={{ fontSize: '0.72rem', height: 22 }}
            />
          ))}
        </Box>
      )}

      <Divider />

      {/* 본문 */}
      <Typography
        variant="body2"
        sx={{ color: 'text.primary', lineHeight: 1.85, whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1 }}
      >
        {memo.memo || '내용이 없습니다.'}
      </Typography>

      {/* 링크 */}
      {memo.link && (
        <>
          <Divider />
          <Box
            component="a"
            href={memo.link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              color: 'primary.main', fontSize: '0.82rem',
              textDecoration: 'none', '&:hover': { textDecoration: 'underline' },
            }}
          >
            <OpenInNewIcon sx={{ fontSize: 15 }} />
            {memo.link}
          </Box>
        </>
      )}

      {/* 날짜 */}
      <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
        {new Date(memo.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
      </Typography>
    </Drawer>
  );
}

function MemoPage() {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [openMemo, setOpenMemo] = useState(null);

  useEffect(() => {
    supabase
      .from('repository_memos')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMemos(data || []);
        setLoading(false);
      });
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    memos.forEach((m) => {
      if (m.tags && !m.is_secret) {
        const first = m.tags.split(',')[0]?.trim();
        if (first) tagSet.add(first);
      }
    });
    return ['ALL', ...Array.from(tagSet).sort()];
  }, [memos]);

  const filtered = useMemo(() => {
    const visible = memos.filter((m) => !m.is_secret);
    if (selectedTag === 'ALL') return visible;
    return visible.filter((m) => {
      const first = m.tags?.split(',')[0]?.trim();
      return first === selectedTag;
    });
  }, [memos, selectedTag]);

  const secretCount = memos.filter((m) => m.is_secret).length;

  return (
    <Box component="main" sx={{ minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a', fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
          Memo
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          {filtered.length}개의 메모{secretCount > 0 ? ` (+${secretCount}개 비공개)` : ''}
        </Typography>

        {/* 태그 필터 */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
          {allTags.map((tag) => (
            <Chip
              key={tag} label={tag} size="small"
              variant={selectedTag === tag ? 'filled' : 'outlined'}
              color={selectedTag === tag ? 'primary' : 'default'}
              onClick={() => setSelectedTag(tag)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>

        {/* 카드 그리드 */}
        <Grid container spacing={2}>
          {filtered.map((memo) => (
            <Grid key={memo.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                onClick={() => setOpenMemo(memo)}
                sx={{
                  height: '100%', cursor: 'pointer',
                  transition: 'box-shadow 0.2s ease, transform 0.15s ease',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(66,133,244,0.18)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#1a1a1a', flex: 1 }}>
                      {memo.title}
                    </Typography>
                    {memo.link && (
                      <IconButton
                        size="small"
                        href={memo.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ ml: 0.5, flexShrink: 0 }}
                      >
                        <OpenInNewIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary', lineHeight: 1.6, mb: 1.5,
                      whiteSpace: 'pre-wrap',
                      display: '-webkit-box', WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}
                  >
                    {memo.memo}
                  </Typography>
                  {memo.tags && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {memo.tags.split(',').map((tag) => (
                        <Chip key={tag.trim()} label={tag.trim()} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {!loading && filtered.length === 0 && (
            <Grid size={12}>
              <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 8 }}>메모가 없습니다.</Typography>
            </Grid>
          )}
        </Grid>
      </Container>

      <MemoDrawer memo={openMemo} onClose={() => setOpenMemo(null)} />
    </Box>
  );
}

export default MemoPage;
