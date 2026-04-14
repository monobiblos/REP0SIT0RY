import { useState, useEffect, memo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { supabase } from '../../utils/supabase';

const ACCENT = '#2a56c6';
const ACCENT_LIGHT = '#4285f4';
const ACCENT_BORDER = '#8ab4f8';

function getInitial(name) {
  return name ? name.trim().charAt(0).toUpperCase() : '?';
}

const GuestbookSection = memo(function GuestbookSection() {
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('repository_guestbook')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setEntries(data || []);
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim() || message.length > 200) return;
    setLoading(true);
    await supabase.from('repository_guestbook').insert({
      name: name.trim(),
      message: message.trim(),
    });
    setName('');
    setMessage('');
    await fetchEntries();
    setLoading(false);
  };

  return (
    <Box component="section" id="guestbook" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#fafafa' }}>
      <Container maxWidth="sm">

        {/* 헤더 */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 24, height: '1px', bgcolor: 'divider' }} />
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.18em', fontSize: '0.68rem' }}>
              Guestbook
            </Typography>
            <Box sx={{ width: 24, height: '1px', bgcolor: 'divider' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            방명록
            <Box component="span" sx={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', bgcolor: ACCENT, mb: '6px' }} />
          </Typography>
        </Box>

        {/* 폼 */}
        <Box sx={{
          bgcolor: '#fff',
          border: '1px solid #2a56c6',
          borderRadius: 3,
          p: 2.5,
          mb: 3,
        }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', minWidth: 28 }}>이름</Typography>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
              size="small"
              fullWidth
              inputProps={{ maxLength: 20 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', minWidth: 28, mt: 1 }}>글</Typography>
            <TextField
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 남겨보세요 (200자 이내)"
              size="small"
              fullWidth
              multiline
              rows={3}
              inputProps={{ maxLength: 200 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
              {message.length} / 200
            </Typography>
            <Button
              onClick={handleSubmit}
              disabled={loading || !name.trim() || !message.trim()}
              size="small"
              sx={{
                borderRadius: 999,
                border: `1px solid ${ACCENT}`,
                color: ACCENT,
                px: 2.5,
                fontSize: '0.78rem',
                '&:hover': { bgcolor: ACCENT_LIGHT },
                '&.Mui-disabled': { borderColor: '#e0e0e0' },
              }}
            >
              {loading ? '전송 중...' : '남기기'}
            </Button>
          </Box>
        </Box>

        {/* 목록 */}
        {entries.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'text.disabled', py: 5, fontSize: '0.875rem' }}>
            첫 번째 방명록을 남겨보세요!
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {entries.map((entry) => (
              <Box key={entry.id} sx={{
                bgcolor: '#fff',
                border: '1px solid #2a56c6',
                borderRadius: 3,
                p: '14px 18px',
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
              }}>
                {/* 아바타 */}
                <Box sx={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  bgcolor: ACCENT_LIGHT,
                  border: `1px solid ${ACCENT_BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  color: '#8ab4f8',
                  flexShrink: 0,
                }}>
                  {getInitial(entry.name)}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a' }}>
                      {entry.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
                      {new Date(entry.created_at).toLocaleDateString('ko-KR')}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {entry.message}
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

export default GuestbookSection;