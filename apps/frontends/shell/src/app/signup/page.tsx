'use client';

import { FormEvent, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, LinearProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
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

const passwordRequirements = [
  { label: '8 caracteres como mínimo', test: (value: string) => value.length >= 8 },
  { label: 'Una letra mayúscula', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'Una letra minúscula', test: (value: string) => /[a-z]/.test(value) },
  { label: 'Un número', test: (value: string) => /\d/.test(value) },
  { label: 'Un símbolo', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordChecks = passwordRequirements.map((requirement) => ({
    ...requirement,
    complete: requirement.test(form.contra),
  }));
  const completedPasswordChecks = passwordChecks.filter((requirement) => requirement.complete).length;
  const passwordIsValid = completedPasswordChecks === passwordRequirements.length;

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
      router.push('/');
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
        <Typography color="text.secondary" sx={{ mb: 3 }}>Completa tus datos para crear la cuenta.</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2}>
          <TextField
            label="Rol de la cuenta"
            value="Cliente"
            helperText="Los roles operativos se asignan desde administración."
            slotProps={{ input: { readOnly: true } }}
            fullWidth
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField label="Nombre(s)" value={form.nombres} onChange={(event) => update('nombres', event.target.value)} required />
            <TextField label="Apellido paterno" value={form.apellido_paterno} onChange={(event) => update('apellido_paterno', event.target.value)} required />
            <TextField label="Apellido materno" value={form.apellido_materno} onChange={(event) => update('apellido_materno', event.target.value)} required />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="CURP"
              value={form.curp}
              onChange={(event) => update('curp', event.target.value.toUpperCase().slice(0, 18))}
              slotProps={{ htmlInput: { minLength: 18, maxLength: 18 } }}
              helperText={`${form.curp.length}/18 caracteres`}
              error={form.curp.length > 0 && form.curp.length !== 18}
              required
            />
            <TextField label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento} onChange={(event) => update('fecha_nacimiento', event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
          </Box>
          <TextField
            label="Teléfono"
            value={form.telefono}
            onChange={(event) => update('telefono', event.target.value.replace(/\D/g, '').slice(0, 10))}
            slotProps={{ htmlInput: { maxLength: 10, inputMode: 'numeric', pattern: '[0-9]{10}' } }}
            helperText={`${form.telefono.length}/10 dígitos`}
            error={form.telefono.length > 0 && form.telefono.length !== 10}
            required
          />
          <TextField label="Correo electronico" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
          <TextField label="Contraseña" type="password" value={form.contra} onChange={(event) => update('contra', event.target.value)} required />
          <Box aria-live="polite">
            <LinearProgress
              variant="determinate"
              value={(completedPasswordChecks / passwordRequirements.length) * 100}
              color={passwordIsValid ? 'success' : 'primary'}
              sx={{ mb: 1.5, height: 6, borderRadius: 1 }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 0.75 }}>
              {passwordChecks.map((requirement) => (
                <Stack key={requirement.label} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  {requirement.complete ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                  )}
                  <Typography variant="caption" color={requirement.complete ? 'success.main' : 'text.secondary'}>
                    {requirement.label}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Box>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || form.curp.length !== 18 || form.telefono.length !== 10 || !passwordIsValid}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Registrarme'}
          </Button>
          <Button onClick={() => router.push('/login')}>Ya tengo una cuenta</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
