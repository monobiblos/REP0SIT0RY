import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import { supabase } from '../utils/supabase';

const SPINE_COLORS = ['#4285f4', '#5c9aff', '#3367d6', '#7baaf7', '#2a56c6', '#8ab4f8', '#1a73e8', '#669df6'];

function ArcaivesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      supabase
        .from('repository_arcaives')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            navigate('/arcaives');
          } else if (data.is_secret) {
            setDetail({ ...data, content: '[This entry is private.]' });
          } else {
            setDetail(data);
          }
          setLoading(false);
        });
    } else {
      supabase
        .from('repository_arcaives')
        .select('*')
        .order('sort_order', { ascending: true })
        .then(({ data }) => {
          setEntries(data || []);
          setLoading(false);
        });
    }
  }, [id, navigate]);

  // Detail view (Notion-like)
  if (id) {
    if (loading) return null;
    return (
      <Box component="main" sx={{ minHeight: '100vh', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="md">
          <IconButton onClick={() => navigate('/arcaives')} sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          {detail && (
            <>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, mb: 4, color: '#1a1a1a', fontSize: { xs: '1.75rem', md: '2.5rem' } }}
              >
                {detail.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mb: 4 }}
              >
                {new Date(detail.created_at).toLocaleDateString('ko-KR')}
              </Typography>
              <Box
                sx={{
                  color: '#1a1a1a',
                  lineHeight: 1.8,
                  fontSize: '1rem',
                  whiteSpace: 'pre-wrap',
                  '& p': { mb: 2 },
                }}
              >
                {detail.content}
              </Box>
            </>
          )}
        </Container>
      </Box>
    );
  }

  // List view (stacked books)
  return (
    <Box component="main" sx={{ minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a', fontSize: { xs: '1.75rem', md: '2.5rem' } }}
        >
          Arcaives
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 6 }}>
          Click a book to read.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {entries.map((entry, index) => (
            <Box
              key={entry.id}
              onClick={() => !entry.is_secret && navigate(`/arcaives/${entry.id}`)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: entry.is_secret ? 'default' : 'pointer',
                transition: 'transform 0.2s ease',
                '&:hover': entry.is_secret ? {} : { transform: 'translateX(8px)' },
              }}
            >
              {/* Book spine */}
              <Box
                sx={{
                  width: { xs: 28, md: 36 },
                  height: { xs: 50, md: 60 },
                  backgroundColor: SPINE_COLORS[index % SPINE_COLORS.length],
                  borderRadius: '3px 0 0 3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  borderRight: '2px solid rgba(0,0,0,0.1)',
                }}
              >
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}>
                  {String(index + 1).padStart(2, '0')}
                </Typography>
              </Box>
              {/* Book cover (flat side) */}
              <Box
                sx={{
                  flex: 1,
                  height: { xs: 50, md: 60 },
                  backgroundColor: '#f8f9fa',
                  borderTop: '1px solid #e0e0e0',
                  borderBottom: '1px solid #e0e0e0',
                  borderRight: '1px solid #e0e0e0',
                  borderRadius: '0 3px 3px 0',
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', md: '0.95rem' },
                    color: entry.is_secret ? 'text.secondary' : '#1a1a1a',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {entry.title}
                </Typography>
                {entry.is_secret && <LockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                  {new Date(entry.created_at).toLocaleDateString('ko-KR')}
                </Typography>
              </Box>
            </Box>
          ))}
          {!loading && entries.length === 0 && (
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 8 }}>
              No entries yet.
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default ArcaivesPage;
