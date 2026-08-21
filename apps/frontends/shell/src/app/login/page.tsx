'use client';

import { FormEvent, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, Paper, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'No fue posible iniciar sesion');
      localStorage.setItem('nexoroute.accessToken', data.accessToken);
      localStorage.setItem('nexoroute.refreshToken', data.refreshToken);
      localStorage.setItem('nexoroute.user', JSON.stringify(data.user));
      const operationalRoles = [
        'ROLE_ADMIN',
        'ROLE_OPERADOR',
        'ROLE_SUPERVISOR',
        'ROLE_CONDUCTOR',
      ];
      const roles = Array.isArray(data.user?.roles) ? data.user.roles : [];
      router.push(roles.some((role: string) => operationalRoles.includes(role)) ? '/dashboard' : '/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible iniciar sesion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 10 } }}>
      <Paper component="form" onSubmit={submit} sx={{ p: { xs: 3, md: 5 } }} elevation={4}>
        <Typography variant="h4" component="h1" gutterBottom>Iniciar sesion</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Accede a tu cuenta de Nexoroute.</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField label="Correo electronico" type="email" value={email} onChange={(event) => setEmail(event.target.value)} fullWidth required sx={{ mb: 2 }} />
        <TextField label="Contrasena" type="password" value={password} onChange={(event) => setPassword(event.target.value)} fullWidth required sx={{ mb: 3 }} />
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Entrar'}
        </Button>
        <Button onClick={() => router.push('/signup')} fullWidth sx={{ mt: 1 }}>Crear cuenta</Button>
      </Paper>
    </Container>
  );
}
