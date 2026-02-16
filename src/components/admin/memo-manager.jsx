import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import { supabase } from '../../utils/supabase';

const emptyMemo = { title: '', link: '', memo: '', tags: '', is_secret: false };

function MemoManager() {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState(null);
  const [formData, setFormData] = useState(emptyMemo);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchMemos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('repository_memos')
      .select('*')
      .order('created_at', { ascending: false });
    setMemos(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMemos(); }, [fetchMemos]);

  const handleOpen = (memo = null) => {
    if (memo) {
      setEditingMemo(memo);
      setFormData({ title: memo.title, link: memo.link || '', memo: memo.memo || '', tags: memo.tags || '', is_secret: memo.is_secret });
    } else {
      setEditingMemo(null);
      setFormData(emptyMemo);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setSnackbar({ open: true, message: '제목을 입력해주세요.', severity: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      if (editingMemo) {
        await supabase.from('repository_memos').update(formData).eq('id', editingMemo.id);
        setSnackbar({ open: true, message: '수정되었습니다.', severity: 'success' });
      } else {
        await supabase.from('repository_memos').insert([formData]);
        setSnackbar({ open: true, message: '생성되었습니다.', severity: 'success' });
      }
      setDialogOpen(false);
      fetchMemos();
    } catch {
      setSnackbar({ open: true, message: '저장에 실패했습니다.', severity: 'error' });
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    await supabase.from('repository_memos').delete().eq('id', deleteTarget.id);
    setSnackbar({ open: true, message: '삭제되었습니다.', severity: 'success' });
    setDeleteTarget(null);
    fetchMemos();
    setSubmitting(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Memos ({memos.length})
        </Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => handleOpen()}>
          추가
        </Button>
      </Box>

      <Grid container spacing={2}>
        {memos.map((memo) => (
          <Grid key={memo.id} size={{ xs: 12, sm: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', flex: 1 }}>
                    {memo.is_secret && <LockIcon sx={{ fontSize: 14, mr: 0.5 }} />}
                    {memo.title}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(memo)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(memo)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
                {memo.tags && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {memo.tags.split(',').map((t) => <Chip key={t.trim()} label={t.trim()} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />)}
                  </Box>
                )}
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {memo.memo}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingMemo ? '메모 수정' : '새 메모 작성'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField fullWidth label="제목" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          <TextField fullWidth label="링크" placeholder="https://..." value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
          <TextField fullWidth label="메모" value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} multiline minRows={4} />
          <TextField fullWidth label="태그" placeholder="태그1, 태그2, 태그3" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} helperText="쉼표로 구분. 첫 번째 태그가 카테고리로 사용됩니다." />
          <FormControlLabel control={<Switch checked={formData.is_secret} onChange={(e) => setFormData({ ...formData, is_secret: e.target.checked })} />} label="비공개" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>{submitting ? '저장 중...' : '저장'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>메모 삭제</DialogTitle>
        <DialogContent><Typography>"{deleteTarget?.title}"을(를) 삭제하시겠습니까?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>취소</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={submitting}>삭제</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default MemoManager;
