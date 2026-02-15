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
import { supabase } from '../../utils/supabase';

const emptyContact = { image_url: '', link_url: '', sort_order: 0, is_active: true };

function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState(emptyContact);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingContact) {
        await supabase.from('repository_contacts').update(formData).eq('id', editingContact.id);
        setSnackbar({ open: true, message: 'Updated.', severity: 'success' });
      } else {
        await supabase.from('repository_contacts').insert([formData]);
        setSnackbar({ open: true, message: 'Created.', severity: 'success' });
      }
      setDialogOpen(false);
      fetchContacts();
    } catch {
      setSnackbar({ open: true, message: 'Failed.', severity: 'error' });
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    await supabase.from('repository_contacts').delete().eq('id', deleteTarget.id);
    setSnackbar({ open: true, message: 'Deleted.', severity: 'success' });
    setDeleteTarget(null);
    fetchContacts();
    setSubmitting(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Contact Images ({contacts.length})
        </Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => handleOpen()}>
          Add
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
                    <Typography sx={{ color: '#bbb', fontSize: '0.75rem' }}>No image</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: contact.is_active ? 'primary.main' : 'text.secondary' }}>
                    {contact.is_active ? 'Active' : 'Inactive'}
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
        <DialogTitle>{editingContact ? 'Edit Contact' : 'New Contact'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField fullWidth label="Image URL" placeholder="https://..." value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
          <TextField fullWidth label="Link URL" placeholder="https://..." value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} />
          <TextField fullWidth label="Sort Order" type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })} />
          <FormControlLabel control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />} label="Active" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent><Typography>Delete this contact?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={submitting}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default ContactManager;
