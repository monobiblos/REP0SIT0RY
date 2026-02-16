import { useState, useEffect, useCallback, useRef } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { supabase } from '../../utils/supabase';

const BUCKET = 'shortcut-images';
const emptyContact = { image_url: '', link_url: '', sort_order: 0, is_active: true };

function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState(emptyContact);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('repository_contacts')
      .select('*')
      .order('sort_order', { ascending: true });
    setContacts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleOpen = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({ image_url: contact.image_url || '', link_url: contact.link_url || '', sort_order: contact.sort_order, is_active: contact.is_active });
    } else {
      setEditingContact(null);
      setFormData(emptyContact);
    }
    setDialogOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setSnackbar({ open: true, message: '이미지 파일만 업로드할 수 있습니다.', severity: 'warning' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: '파일 크기는 5MB 이하여야 합니다.', severity: 'warning' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      setSnackbar({ open: true, message: '이미지가 업로드되었습니다.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: `업로드 실패: ${err.message}`, severity: 'error' });
    }
    setUploading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingContact) {
        await supabase.from('repository_contacts').update(formData).eq('id', editingContact.id);
        setSnackbar({ open: true, message: '수정되었습니다.', severity: 'success' });
      } else {
        await supabase.from('repository_contacts').insert([formData]);
        setSnackbar({ open: true, message: '생성되었습니다.', severity: 'success' });
      }
      setDialogOpen(false);
      fetchContacts();
    } catch {
      setSnackbar({ open: true, message: '저장에 실패했습니다.', severity: 'error' });
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    await supabase.from('repository_contacts').delete().eq('id', deleteTarget.id);
    setSnackbar({ open: true, message: '삭제되었습니다.', severity: 'success' });
    setDeleteTarget(null);
    fetchContacts();
    setSubmitting(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          바로가기 이미지 ({contacts.length})
        </Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => handleOpen()}>
          추가
        </Button>
      </Box>

      <Grid container spacing={2}>
        {contacts.map((contact) => (
          <Grid key={contact.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {contact.image_url ? (
                  <Box
                    component="img"
                    src={contact.image_url}
                    alt="contact"
                    sx={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: '3px', mb: 1 }}
                  />
                ) : (
                  <Box sx={{ width: '100%', height: 100, backgroundColor: '#e8e8e8', borderRadius: '3px', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#bbb', fontSize: '0.75rem' }}>이미지 없음</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: contact.is_active ? 'primary.main' : 'text.secondary' }}>
                    {contact.is_active ? '활성' : '비활성'}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpen(contact)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(contact)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingContact ? '바로가기 수정' : '새 바로가기 추가'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {/* Image upload area */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>이미지</Typography>
            {formData.image_url ? (
              <Box sx={{ position: 'relative', mb: 1 }}>
                <Box
                  component="img"
                  src={formData.image_url}
                  alt="preview"
                  sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '3px', border: '1px solid #e0e0e0' }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setFormData({ ...formData, image_url: '' })}
                  sx={{ mt: 1 }}
                >
                  이미지 제거
                </Button>
              </Box>
            ) : (
              <Box
                onClick={() => !uploading && fileInputRef.current?.click()}
                sx={{
                  width: '100%',
                  height: 120,
                  border: '2px dashed #ccc',
                  borderRadius: '3px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: uploading ? 'default' : 'pointer',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: uploading ? '#ccc' : '#4285f4' },
                }}
              >
                {uploading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 32, color: '#bbb', mb: 0.5 }} />
                    <Typography sx={{ color: '#999', fontSize: '0.8rem' }}>클릭하여 이미지 업로드</Typography>
                    <Typography sx={{ color: '#bbb', fontSize: '0.7rem' }}>최대 5MB</Typography>
                  </>
                )}
              </Box>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </Box>
          <TextField fullWidth label="링크 URL" placeholder="https://..." value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} />
          <TextField fullWidth label="정렬 순서" type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })} />
          <FormControlLabel control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />} label="활성" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting || uploading}>{submitting ? '저장 중...' : '저장'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>바로가기 삭제</DialogTitle>
        <DialogContent><Typography>이 바로가기를 삭제하시겠습니까?</Typography></DialogContent>
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

export default ContactManager;
