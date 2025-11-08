import { useEffect, useState } from 'preact/hooks'
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
import { getDefaultBodyState, getDefaultBodyConfig, DEFAULT_FORM_DATA_ROW, DEFAULT_URL_ENCODED_ROW } from '../utils/bodyConfig'
import { detectCurlCommand, parseCurlCommand } from '../utils/curlParser'

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
  const [curlNotice, setCurlNotice] = useState('')
  const [isParsingCurl, setIsParsingCurl] = useState(false)

  const handleChange = (field, value) => {
    if (field === 'endpoint') {
      if (!detectCurlCommand(value)) {
        setCurlNotice('')
      }
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const applyParsedCurl = (parsed) => {
    if (!parsed) return

    setForm((prev) => {
      let inferredName = prev.name
      if (!inferredName && parsed.url) {
        try {
          const urlObject = new URL(parsed.url)
          const path = urlObject.pathname === '/' ? urlObject.hostname : urlObject.pathname
          inferredName = `${parsed.method || 'GET'} ${path}`
        } catch (error) {
          inferredName = parsed.url
        }
      }

      return {
        ...prev,
        name: inferredName || prev.name,
        endpoint: parsed.url || '',
        method: parsed.method || prev.method,
        headers: parsed.headers || {},
        params: parsed.params || {},
      }
    })

    const nextBodyState = (() => {
      const base = getDefaultBodyState()
      const mode = parsed.body?.mode || 'none'

      if (mode === 'raw') {
        base.mode = 'raw'
        base.raw = parsed.body?.raw || ''
        base.rawLanguage = parsed.body?.rawLanguage || base.rawLanguage
      } else if (mode === 'form-data') {
        base.mode = 'form-data'
        base.formData = parsed.body?.formData?.length
          ? parsed.body.formData.map((item) => ({
              key: item.key || '',
              value: item.value ?? '',
              type: item.type || 'text',
            }))
          : [{ ...DEFAULT_FORM_DATA_ROW }]
      } else if (mode === 'urlencoded') {
        base.mode = 'urlencoded'
        base.urlEncoded = parsed.body?.urlEncoded?.length
          ? parsed.body.urlEncoded.map((item) => ({
              key: item.key || '',
              value: item.value ?? '',
            }))
          : [{ ...DEFAULT_URL_ENCODED_ROW }]
      } else if (mode === 'graphql') {
        base.mode = 'graphql'
        base.graphql = {
          query: parsed.body?.graphql?.query || '',
          variables: parsed.body?.graphql?.variables || '{}',
        }
      }

      return base
    })()

    setBodyState(nextBodyState)
    setCurlNotice('Loaded fields from detected cURL command.')
  }

  useEffect(() => {
    if (!detectCurlCommand(form.endpoint)) {
      setIsParsingCurl(false)
      return undefined
    }

    setIsParsingCurl(true)
    const timer = setTimeout(() => {
      const parsed = parseCurlCommand(form.endpoint)
      if (parsed && parsed.url) {
        applyParsedCurl(parsed)
      }
      setIsParsingCurl(false)
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [form.endpoint])

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
            helperText={
              detectCurlCommand(form.endpoint)
                ? isParsingCurl
                  ? 'Detecting cURL command…'
                  : 'Detected cURL command. Parsing…'
                : curlNotice
            }
          />

          <RequestBodyEditor bodyState={bodyState} setBodyState={setBodyState} />

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
