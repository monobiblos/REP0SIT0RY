import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { supabase } from '../../utils/supabase';

function GuestbookManager() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('repository_guestbook')
      .select('*')
      .order('created_at', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleDelete = async (id) => {
    if (!window.confirm('이 방명록을 삭제할까요?')) return;
    setDeletingId(id);
    await supabase.from('repository_guestbook').delete().eq('id', id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          방명록 관리
        </Typography>
        <Chip label={`${entries.length}개`} size="small" />
      </Box>

      {/* 목록 */}
      {entries.length === 0 ? (
        <Typography sx={{ color: 'text.disabled', py: 6, textAlign: 'center' }}>
          등록된 방명록이 없습니다.
        </Typography>
      ) : (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          {entries.map((entry, i) => (
            <Box key={entry.id}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, px: 2.5, py: 2 }}>
                {/* 이름 + 날짜 */}
                <Box sx={{ minWidth: 120, flexShrink: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                    {entry.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.3 }}>
                    {new Date(entry.created_at).toLocaleString('ko-KR', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </Typography>
                </Box>

                {/* 메시지 */}
                <Typography sx={{ flex: 1, fontSize: '0.875rem', color: 'text.secondary', wordBreak: 'break-word', lineHeight: 1.6 }}>
                  {entry.message}
                </Typography>

                {/* 삭제 버튼 */}
                <IconButton
                  size="small"
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  sx={{ color: 'error.main', flexShrink: 0 }}
                >
                  {deletingId === entry.id
                    ? <CircularProgress size={16} color="inherit" />
                    : <DeleteOutlineIcon fontSize="small" />}
                </IconButton>
              </Box>
              {i < entries.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default GuestbookManager;