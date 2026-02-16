import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import { supabase } from '../utils/supabase';

const SPINE_COLORS = ['#4285f4', '#5c9aff', '#3367d6', '#7baaf7', '#2a56c6', '#8ab4f8', '#1a73e8', '#669df6'];

function ArcaivesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [entries, setEntries] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  // Password dialog state
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const [pwTarget, setPwTarget] = useState(null); // entry for list-view unlock

  useEffect(() => {
    if (id) {
      const isUnlocked = location.state?.unlocked === true;
      setUnlocked(isUnlocked);
      supabase
        .from('repository_arcaives')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            navigate('/arcaives');
          } else if (data.is_secret && !isUnlocked) {
            if (data.secret_password) {
              // Has password → show password dialog
              setDetail(data);
              setPwDialogOpen(true);
            } else {
              // No password → completely private
              setDetail({ ...data, content: '[This entry is private.]' });
            }
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
  }, [id, navigate, location.state]);

  const handleBookClick = useCallback((entry) => {
    if (entry.is_secret) {
      if (entry.secret_password) {
        // Has password → open dialog
        setPwTarget(entry);
        setPwInput('');
        setPwError(false);
        setPwDialogOpen(true);
      }
      // No password → do nothing (fully locked)
      return;
    }
    navigate(`/arcaives/${entry.id}`);
  }, [navigate]);

  const handlePwSubmit = useCallback(() => {
    const target = pwTarget || detail;
    if (!target) return;

    if (pwInput === target.secret_password) {
      setPwDialogOpen(false);
      setPwInput('');
      setPwError(false);
      if (pwTarget) {
        // From list view → navigate to detail with unlocked state
        setPwTarget(null);
        navigate(`/arcaives/${target.id}`, { state: { unlocked: true } });
      } else {
        // From detail view (direct URL) → unlock in place
        setUnlocked(true);
      }
    } else {
      setPwError(true);
    }
  }, [pwInput, pwTarget, detail, navigate]);

  const handlePwCancel = useCallback(() => {
    setPwDialogOpen(false);
    setPwInput('');
    setPwError(false);
    if (!pwTarget && id) {
      // Was on detail page direct URL → go back to list
      navigate('/arcaives');
    }
    setPwTarget(null);
  }, [pwTarget, id, navigate]);

  // Detail view
  if (id) {
    if (loading) return null;
    const showContent = !detail?.is_secret || unlocked;
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
                {showContent ? detail.content : '[이 글은 비공개입니다.]'}
              </Box>
            </>
          )}
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
          책을 클릭하면 내용을 볼 수 있습니다.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {entries.map((entry, index) => {
            const hasPassword = entry.is_secret && entry.secret_password;
            const isClickable = !entry.is_secret || hasPassword;
            return (
              <Box
                key={entry.id}
                onClick={() => isClickable && handleBookClick(entry)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'transform 0.2s ease',
                  '&:hover': isClickable ? { transform: 'translateX(8px)' } : {},
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
                {/* Book cover */}
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
            );
          })}
          {!loading && entries.length === 0 && (
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 8 }}>
              아직 작성된 글이 없습니다.
            </Typography>
          )}
        </Box>
      </Container>

      {/* Password Dialog (list view) */}
      <Dialog open={pwDialogOpen} onClose={handlePwCancel} maxWidth="xs" fullWidth>
        <DialogTitle>Password Required</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            This entry is protected. Enter the password to view.
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={pwInput}
            onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={(e) => e.key === 'Enter' && handlePwSubmit()}
            error={pwError}
            helperText={pwError ? 'Incorrect password.' : ''}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePwCancel}>Cancel</Button>
          <Button variant="contained" onClick={handlePwSubmit}>Unlock</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ArcaivesPage;
