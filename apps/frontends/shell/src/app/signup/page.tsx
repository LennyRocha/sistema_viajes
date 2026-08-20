'use client';

import { FormEvent, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

const initialForm = {
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  curp: '',
  fecha_nacimiento: '',
  telefono: '',
  email: '',
  contra: '',
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, foto_perfil: 'default' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'No fue posible crear la cuenta');
      localStorage.setItem('nexoroute.accessToken', data.accessToken);
      localStorage.setItem('nexoroute.refreshToken', data.refreshToken);
      localStorage.setItem('nexoroute.user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper component="form" onSubmit={submit} sx={{ p: { xs: 3, md: 5 } }} elevation={4}>
        <Typography variant="h4" component="h1" gutterBottom>Crear cuenta</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Tu cuenta comienza con el rol ROLE_CONDUCTOR.</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField label="Nombre(s)" value={form.nombres} onChange={(event) => update('nombres', event.target.value)} required />
            <TextField label="Apellido paterno" value={form.apellido_paterno} onChange={(event) => update('apellido_paterno', event.target.value)} required />
            <TextField label="Apellido materno" value={form.apellido_materno} onChange={(event) => update('apellido_materno', event.target.value)} required />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField label="CURP" value={form.curp} onChange={(event) => update('curp', event.target.value.toUpperCase())} slotProps={{ htmlInput: { maxLength: 18 } }} required />
            <TextField label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento} onChange={(event) => update('fecha_nacimiento', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
          </Box>
          <TextField label="Telefono" value={form.telefono} onChange={(event) => update('telefono', event.target.value)} required />
          <TextField label="Correo electronico" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
          <TextField label="Contrasena" type="password" helperText="Minimo 8 caracteres, mayuscula, minuscula, numero y simbolo." value={form.contra} onChange={(event) => update('contra', event.target.value)} required />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Registrarme'}
          </Button>
          <Button onClick={() => router.push('/login')}>Ya tengo una cuenta</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
