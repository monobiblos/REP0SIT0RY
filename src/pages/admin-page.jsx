import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ArcaivesManager from '../components/admin/arcaives-manager';
import MemoManager from '../components/admin/memo-manager';
import ContactManager from '../components/admin/contact-manager';

const ADMIN_PASSWORD_HASH = '372698ec836c29a92e938223c5fb64c26be26cc4fc8e2041b501fdd5b390ebf3';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('repo_admin_auth') === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      const hash = await hashPassword(password);
      if (hash === ADMIN_PASSWORD_HASH) {
        sessionStorage.setItem('repo_admin_auth', 'true');
        setIsAuthenticated(true);
      } else {
        setError('비밀번호가 틀렸습니다.');
      }
    } catch {
      setError('HTTPS 연결이 필요합니다.');
    }
  }, [password]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('repo_admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  }, []);

  if (!isAuthenticated) {
    return (
      <Box component="main" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
              Admin
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                type="password"
                label="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!error}
                helperText={error}
                sx={{ mb: 2 }}
              />
              <Button fullWidth variant="contained" type="submit">
                로그인
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Admin
          </Typography>
          <Button variant="outlined" size="small" onClick={handleLogout}>
            로그아웃
          </Button>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Arcaives" />
          <Tab label="Memo" />
          <Tab label="Short Cut" />
        </Tabs>

        {activeTab === 0 && <ArcaivesManager />}
        {activeTab === 1 && <MemoManager />}
        {activeTab === 2 && <ContactManager />}
      </Container>
    </Box>
  );
}

export default AdminPage;
