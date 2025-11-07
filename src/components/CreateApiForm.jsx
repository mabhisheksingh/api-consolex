import { useState } from 'preact/hooks'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import RequestBodyEditor from './RequestBodyEditor'
import { getDefaultBodyState, getDefaultBodyConfig } from '../utils/bodyConfig'

const HTTP_METHOD_OPTIONS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const getDefaultNewCollection = () => ({
  name: '',
  description: '',
  endpoint: '',
  method: 'GET',
  isEnabled: true,
  headers: {},
  params: {},
  body: getDefaultBodyConfig(),
})

export default function CreateApiForm({ onCreate, onCancel, creating = false }) {
  const [form, setForm] = useState(getDefaultNewCollection())
  const [bodyState, setBodyState] = useState(getDefaultBodyState())
  const [error, setError] = useState('')

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setError('')
    const name = form.name.trim()
    const endpoint = form.endpoint.trim()
    if (!name || !endpoint) {
      setError('Name and endpoint are required.')
      return
    }

    // Prepare body config from editor state
    const payload = {
      name,
      description: form.description.trim(),
      endpoint,
      method: form.method,
      isEnabled: form.isEnabled,
      headers: form.headers,
      params: form.params,
      body: {
        ...getDefaultBodyConfig(),
        mode: bodyState.mode,
        rawLanguage: bodyState.rawLanguage,
        raw: bodyState.raw,
        formData: bodyState.formData,
        urlEncoded: bodyState.urlEncoded,
        binary: { fileName: bodyState.binary?.fileName || '' },
        graphql: { query: bodyState.graphql?.query || '', variables: bodyState.graphql?.variables || '{}' },
      },
    }

    await onCreate?.(payload)
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Create new API definition</Typography>

          {error && (
            <Typography variant="body2" color="error">{error}</Typography>
          )}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Name"
              value={form.name}
              onInput={(e) => handleChange('name', e.target.value)}
              fullWidth
              required
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="create-api-method-label">Method</InputLabel>
              <Select
                labelId="create-api-method-label"
                value={form.method}
                label="Method"
                onChange={(e) => handleChange('method', e.target.value)}
              >
                {HTTP_METHOD_OPTIONS.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isEnabled}
                  onChange={(e) => handleChange('isEnabled', e.target.checked)}
                />
              }
              label="Enabled"
            />
          </Stack>

          <TextField
            label="Description"
            value={form.description}
            onInput={(e) => handleChange('description', e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />

          <TextField
            label="Endpoint"
            value={form.endpoint}
            onInput={(e) => handleChange('endpoint', e.target.value)}
            fullWidth
            required
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>Body</Typography>
            <RequestBodyEditor bodyState={bodyState} setBodyState={setBodyState} />
          </Box>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleSubmit} disabled={creating}>
              {creating ? <CircularProgress color="inherit" size={22} /> : 'Create'}
            </Button>
            <Button variant="text" onClick={onCancel} disabled={creating}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
