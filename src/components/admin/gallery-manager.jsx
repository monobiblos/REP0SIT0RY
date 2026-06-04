import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import { supabase } from '../../utils/supabase';

const emptyForm = { title: '', description: '', url: '' };

// 이미지 미리보기 — 우클릭 방지 + hover 효과
function ProtectedImage({ src, alt, onRemove, size = 'normal' }) {
  const [hovered, setHovered] = useState(false);
  const dim = size === 'small' ? 60 : 100;

  return (
    <Box
      sx={{ position: 'relative', width: dim, height: dim, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          userSelect: 'none',
          transition: 'transform 0.25s ease, filter 0.25s ease',
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          filter: hovered ? 'brightness(0.75)' : 'brightness(1)',
          pointerEvents: 'none', // 추가 우클릭 방지
        }}
      />
      {onRemove && hovered && (
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            position: 'absolute', top: 2, right: 2,
            bgcolor: 'rgba(0,0,0,0.6)', color: '#fff',
            width: 22, height: 22,
            '&:hover': { bgcolor: 'rgba(200,0,0,0.8)' },
          }}
        >
          <CloseIcon sx={{ fontSize: 13 }} />
        </IconButton>
      )}
    </Box>
  );
}

// 이미지 업로드 박스
function ImageUploadSlot({ imageUrl, imageFile, onFileChange, onRemove, label }) {
  const hasImage = imageUrl || imageFile;
  const previewSrc = imageFile ? URL.createObjectURL(imageFile) : imageUrl;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{label}</Typography>
      {hasImage ? (
        <Box sx={{ position: 'relative', width: 100, height: 100, borderRadius: 1.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <ProtectedImage src={previewSrc} alt={label} onRemove={onRemove} />
        </Box>
      ) : (
        <Box
          component="label"
          sx={{
            width: 100, height: 100,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            gap: 0.5,
            transition: 'border-color 0.2s, background 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
          }}
        >
          <AddPhotoAlternateIcon sx={{ fontSize: 24, color: 'text.disabled' }} />
          <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>이미지 추가</Typography>
          <input type="file" accept="image/*" hidden onChange={onFileChange} />
        </Box>
      )}
    </Box>
  );
}

function GalleryManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  // 기존 이미지 URL (수정 시)
  const [existingImg1, setExistingImg1] = useState('');
  const [existingImg2, setExistingImg2] = useState('');
  // 새로 선택한 파일
  const [imgFile1, setImgFile1] = useState(null);
  const [imgFile2, setImgFile2] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('repository_gallery')
      .select('*')
      .order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ title: item.title || '', description: item.description || '', url: item.url || '' });
      setExistingImg1(item.image_url_1 || '');
      setExistingImg2(item.image_url_2 || '');
    } else {
      setEditingItem(null);
      setFormData(emptyForm);
      setExistingImg1('');
      setExistingImg2('');
    }
    setImgFile1(null);
    setImgFile2(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setImgFile1(null);
    setImgFile2(null);
  };

  async function uploadImg(file, slot) {
    const ext = file.name.split('.').pop();
    const fileName = `gallery_${slot}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('shortcut-images').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('shortcut-images').getPublicUrl(fileName).data.publicUrl;
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setSnackbar({ open: true, message: '제목을 입력해주세요.', severity: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      let img1 = existingImg1;
      let img2 = existingImg2;
      if (imgFile1) img1 = await uploadImg(imgFile1, 1);
      if (imgFile2) img2 = await uploadImg(imgFile2, 2);

      const payload = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        image_url_1: img1 || null,
        image_url_2: img2 || null,
      };

      if (editingItem) {
        await supabase.from('repository_gallery').update(payload).eq('id', editingItem.id);
        setSnackbar({ open: true, message: '수정되었습니다.', severity: 'success' });
      } else {
        await supabase.from('repository_gallery').insert([payload]);
        setSnackbar({ open: true, message: '추가되었습니다.', severity: 'success' });
      }
      handleClose();
      fetchItems();
    } catch (err) {
      setSnackbar({ open: true, message: '저장 실패: ' + err.message, severity: 'error' });
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    await supabase.from('repository_gallery').delete().eq('id', deleteTarget.id);
    setSnackbar({ open: true, message: '삭제되었습니다.', severity: 'success' });
    setDeleteTarget(null);
    fetchItems();
    setSubmitting(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Gallery ({items.length})
        </Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => handleOpen()}>
          추가
        </Button>
      </Box>

      {loading ? (
        <Typography sx={{ color: 'text.disabled', py: 4, textAlign: 'center' }}>불러오는 중...</Typography>
      ) : items.length === 0 ? (
        <Typography sx={{ color: 'text.disabled', py: 4, textAlign: 'center' }}>등록된 항목이 없습니다.</Typography>
      ) : (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.92rem', flex: 1, pr: 1 }}>
                      {item.title}
                    </Typography>
                    <Box sx={{ display: 'flex', flexShrink: 0 }}>
                      <IconButton size="small" onClick={() => handleOpen(item)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>

                  {/* 이미지 썸네일 행 */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {item.image_url_1 && <ProtectedImage src={item.image_url_1} alt="이미지1" size="small" />}
                    {item.image_url_2 && <ProtectedImage src={item.image_url_2} alt="이미지2" size="small" />}
                    {!item.image_url_1 && !item.image_url_2 && (
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>이미지 없음</Typography>
                    )}
                  </Box>

                  {item.description && (
                    <Typography variant="body2" sx={{
                      color: 'text.secondary', fontSize: '0.78rem',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      mb: 0.5,
                    }}>
                      {item.description}
                    </Typography>
                  )}
                  {item.url && (
                    <Chip
                      label={(() => { try { return new URL(item.url).hostname; } catch { return item.url; } })()}
                      size="small"
                      component="a"
                      href={item.url}
                      target="_blank"
                      clickable
                      sx={{ fontSize: '0.68rem', height: 20, mt: 0.5 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 추가/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? '갤러리 항목 수정' : '갤러리 항목 추가'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <TextField
            fullWidth label="제목" value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            fullWidth label="설명 (선택)" value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline minRows={2}
          />
          <TextField
            fullWidth label="링크 URL (선택)" placeholder="https://..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />

          {/* 이미지 업로드 2슬롯 */}
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, mb: 1.5 }}>
              이미지 (최대 2개)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ImageUploadSlot
                label="이미지 1"
                imageUrl={existingImg1}
                imageFile={imgFile1}
                onFileChange={(e) => { setImgFile1(e.target.files[0]); setExistingImg1(''); }}
                onRemove={() => { setImgFile1(null); setExistingImg1(''); }}
              />
              <ImageUploadSlot
                label="이미지 2"
                imageUrl={existingImg2}
                imageFile={imgFile2}
                onFileChange={(e) => { setImgFile2(e.target.files[0]); setExistingImg2(''); }}
                onRemove={() => { setImgFile2(null); setExistingImg2(''); }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>항목 삭제</DialogTitle>
        <DialogContent>
          <Typography>"{deleteTarget?.title}"을(를) 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>취소</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={submitting}>삭제</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GalleryManager;
