import { useState, useEffect, memo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a1a', lineHeight: 1.4, flex: 1 }}>
          {memo.title}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ flexShrink: 0, mt: '-4px' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {memo.tags && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {memo.tags.split(',').map((tag) => (
            <Chip key={tag.trim()} label={tag.trim()} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.72rem', height: 22 }} />
          ))}
        </Box>
      )}

      <Divider />

      <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.85, whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1 }}>
        {memo.memo || '내용이 없습니다.'}
      </Typography>

      {memo.link && (
        <>
          <Divider />
          <Box
            component="a" href={memo.link} target="_blank" rel="noopener noreferrer"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'primary.main', fontSize: '0.82rem', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            <OpenInNewIcon sx={{ fontSize: 15 }} />
            {memo.link}
          </Box>
        </>
      )}

      <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
        {new Date(memo.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
      </Typography>
    </Drawer>
  );
}

const MemoSection = memo(function MemoSection() {
  const [memos, setMemos] = useState([]);
  const [openMemo, setOpenMemo] = useState(null);

  useEffect(() => {
    supabase
      .from('repository_memos')
      .select('*')
      .eq('is_secret', false)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setMemos(data || []));
  }, []);

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#f8f9fa' }}>
      <Container maxWidth="lg">
        <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.2em', display: 'block', textAlign: 'center', mb: 1 }}>
          Memo
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 6, color: '#1a1a1a' }}>
          메모
        </Typography>

        <Grid container spacing={2}>
          {memos.map((memo) => (
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
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 1, color: '#1a1a1a' }}>
                    {memo.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      mb: 1, lineHeight: 1.6,
                    }}
                  >
                    {memo.memo}
                  </Typography>
                  {memo.tags && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {memo.tags.split(',').slice(0, 3).map((tag) => (
                        <Chip key={tag.trim()} label={tag.trim()} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {memos.length === 0 && (
            <Grid size={12}>
              <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>아직 메모가 없습니다.</Typography>
            </Grid>
          )}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button component={Link} to="/memo" variant="outlined" size="small">전체 보기</Button>
        </Box>
      </Container>

      <MemoDrawer memo={openMemo} onClose={() => setOpenMemo(null)} />
    </Box>
  );
});

export default MemoSection;
