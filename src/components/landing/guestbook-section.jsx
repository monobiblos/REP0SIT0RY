import { useState, useEffect, memo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { supabase } from '../../utils/supabase';

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
    if (!name.trim() || !message.trim()) return;
    if (message.length > 200) return;
    setLoading(true);
    await supabase.from('repository_guestbook').insert({ name: name.trim(), message: message.trim() });
    setName('');
    setMessage('');
    await fetchEntries();
    setLoading(false);
  };

  return (
    <Box component="section" id="guestbook" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#fafafa' }}>
      <Container maxWidth="md">

        {/* 섹션 헤더 */}
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', letterSpacing: '0.2em', display: 'block', textAlign: 'center', mb: 1 }}
        >
          Guestbook
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, textAlign: 'center', mb: 6, color: '#1a1a1a' }}
        >
          방명록
        </Typography>

        {/* 입력 폼 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 6 }}>
          <TextField
            label="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ maxLength: 20 }}
            size="small"
            sx={{ maxWidth: 240 }}
          />
          <TextField
            label="메시지"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={3}
            inputProps={{ maxLength: 200 }}
            helperText={`${message.length}/200`}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !message.trim()}
            sx={{ alignSelf: 'flex-start' }}
          >
            {loading ? '전송 중...' : '남기기'}
          </Button>
        </Box>

        {/* 목록 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {entries.length === 0 && (
            <Typography sx={{ color: '#bbb', textAlign: 'center', py: 4 }}>
              첫 번째 방명록을 남겨보세요!
            </Typography>
          )}
          {entries.map((entry, i) => (
            <Box key={entry.id}>
              <Box sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>
                    {entry.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#aaa' }}>
                    {new Date(entry.created_at).toLocaleDateString('ko-KR')}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.9rem', color: '#555', whiteSpace: 'pre-wrap' }}>
                  {entry.message}
                </Typography>
              </Box>
              {i < entries.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>

      </Container>
    </Box>
  );
});

export default GuestbookSection;