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
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import { supabase } from '../../utils/supabase';

const emptyEntry = { title: '', content: '', is_secret: false, sort_order: 0, secret_password: '' };

function ArcaivesManager() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState(emptyEntry);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('repository_arcaives')
      .select('*')
      .order('sort_order', { ascending: true });
    setEntries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleOpen = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({ title: entry.title, content: entry.content || '', is_secret: entry.is_secret, sort_order: entry.sort_order, secret_password: entry.secret_password || '' });
    } else {
      setEditingEntry(null);
      setFormData(emptyEntry);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setSnackbar({ open: true, message: '제목을 입력해주세요.', severity: 'warning' });
      return;
    }
    setSubmitting(true);
    const payload = { ...formData };
    if (!payload.is_secret) payload.secret_password = '';
    try {
      if (editingEntry) {
        await supabase.from('repository_arcaives').update(payload).eq('id', editingEntry.id);
        setSnackbar({ open: true, message: '수정되었습니다.', severity: 'success' });
      } else {
        await supabase.from('repository_arcaives').insert([payload]);
        setSnackbar({ open: true, message: '생성되었습니다.', severity: 'success' });
      }
      setDialogOpen(false);
      fetchEntries();
    } catch {
      setSnackbar({ open: true, message: '저장에 실패했습니다.', severity: 'error' });
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    await supabase.from('repository_arcaives').delete().eq('id', deleteTarget.id);
    setSnackbar({ open: true, message: '삭제되었습니다.', severity: 'success' });
    setDeleteTarget(null);
    fetchEntries();
    setSubmitting(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Arcaives ({entries.length})
        </Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => handleOpen()}>
          추가
        </Button>
      </Box>

      <Grid container spacing={2}>
        {entries.map((entry) => (
          <Grid key={entry.id} size={{ xs: 12, sm: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {entry.is_secret && <LockIcon sx={{ fontSize: 14, mr: 0.5 }} />}
                      {entry.title}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(entry)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(entry)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {entry.content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingEntry ? '글 수정' : '새 글 작성'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField fullWidth label="제목" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          <TextField fullWidth label="내용" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} multiline minRows={8} />
          <TextField fullWidth label="정렬 순서" type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })} />
          <FormControlLabel control={<Switch checked={formData.is_secret} onChange={(e) => setFormData({ ...formData, is_secret: e.target.checked })} />} label="비공개" />
          {formData.is_secret && (
            <TextField fullWidth label="열람 비밀번호 (선택)" value={formData.secret_password} onChange={(e) => setFormData({ ...formData, secret_password: e.target.value })} helperText="비밀번호를 설정하면 방문자가 비밀번호를 입력하여 열람할 수 있습니다" />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>글 삭제</DialogTitle>
        <DialogContent>
          <Typography>"{deleteTarget?.title}"을(를) 삭제하시겠습니까?</Typography>
        </DialogContent>
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

export default ArcaivesManager;
