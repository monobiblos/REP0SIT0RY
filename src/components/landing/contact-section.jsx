import { useState, useEffect, memo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { supabase } from '../../utils/supabase';

const SLOTS = 5;

const ContactSection = memo(function ContactSection() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    supabase
      .from('repository_contacts')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(SLOTS)
      .then(({ data }) => setContacts(data || []));
  }, []);

  const slots = Array.from({ length: SLOTS }, (_, i) => contacts[i] || null);

  return (
    <Box component="section" id="shortcut" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#fff' }}>
      <Container maxWidth="lg">
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', letterSpacing: '0.2em', display: 'block', textAlign: 'center', mb: 1 }}
        >
          Short Cut
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, textAlign: 'center', mb: 6, color: '#1a1a1a' }}
        >
          바로가기
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {slots.map((slot, i) => (
            <Box
              key={i}
              component={slot?.link_url ? 'a' : 'div'}
              href={slot?.link_url || undefined}
              target={slot?.link_url ? '_blank' : undefined}
              rel={slot?.link_url ? 'noopener noreferrer' : undefined}
              sx={{
                width: { xs: '45%', sm: 180, md: 200 },
                maxWidth: 400,
                height: { xs: 100, sm: 120, md: 130 },
                maxHeight: 200,
                borderRadius: '3px',
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
                backgroundColor: slot?.image_url ? 'transparent' : '#e8e8e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                cursor: slot?.link_url ? 'pointer' : 'default',
                textDecoration: 'none',
                '&:hover': slot?.link_url ? {
                  boxShadow: '0 4px 16px rgba(66,133,244,0.2)',
                  transform: 'translateY(-2px)',
                } : {},
              }}
            >
              {slot?.image_url ? (
                <Box
                  component="img"
                  src={slot.image_url}
                  alt="contact"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography sx={{ color: '#bbb', fontSize: '0.75rem' }}>비어 있음</Typography>
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
});

export default ContactSection;
