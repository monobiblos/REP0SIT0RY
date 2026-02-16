import { useState, useEffect, memo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

const MemoSection = memo(function MemoSection() {
  const [memos, setMemos] = useState([]);

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
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', letterSpacing: '0.2em', display: 'block', textAlign: 'center', mb: 1 }}
        >
          Memo
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, textAlign: 'center', mb: 6, color: '#1a1a1a' }}
        >
          최근 메모
        </Typography>

        <Grid container spacing={2}>
          {memos.map((memo) => (
            <Grid key={memo.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: '0 4px 20px rgba(66,133,244,0.15)' },
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
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 1,
                      lineHeight: 1.6,
                    }}
                  >
                    {memo.memo}
                  </Typography>
                  {memo.tags && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {memo.tags.split(',').slice(0, 3).map((tag) => (
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
          {memos.length === 0 && (
            <Grid size={12}>
              <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
                아직 메모가 없습니다.
              </Typography>
            </Grid>
          )}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button component={Link} to="/memo" variant="outlined" size="small">
            전체 보기
          </Button>
        </Box>
      </Container>
    </Box>
  );
});

export default MemoSection;
