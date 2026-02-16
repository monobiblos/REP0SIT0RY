import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { supabase } from '../utils/supabase';

function MemoPage() {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('ALL');

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
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a', fontSize: { xs: '1.75rem', md: '2.5rem' } }}
        >
          Memo
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          {filtered.length}개의 메모{secretCount > 0 ? ` (+${secretCount}개 비공개)` : ''}
        </Typography>

        {/* Tag filter */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
          {allTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant={selectedTag === tag ? 'filled' : 'outlined'}
              color={selectedTag === tag ? 'primary' : 'default'}
              onClick={() => setSelectedTag(tag)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>

        {/* Memo grid */}
        <Grid container spacing={2}>
          {filtered.map((memo) => (
            <Grid key={memo.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: '0 4px 20px rgba(66,133,244,0.15)' },
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
                        sx={{ ml: 0.5, flexShrink: 0 }}
                      >
                        <OpenInNewIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      mb: 1.5,
                      whiteSpace: 'pre-wrap',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {memo.memo}
                  </Typography>
                  {memo.tags && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {memo.tags.split(',').map((tag) => (
                        <Chip
                          key={tag.trim()}
                          label={tag.trim()}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {!loading && filtered.length === 0 && (
            <Grid size={12}>
              <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 8 }}>
                메모가 없습니다.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}

export default MemoPage;
