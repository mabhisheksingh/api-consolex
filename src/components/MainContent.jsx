import { useEffect, useMemo, useState } from 'preact/hooks'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SendIcon from '@mui/icons-material/Send'

function EmptyState() {
  return (
    <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          No API collections found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add new API definitions to `data/apiCollections.json` to start exploring.
        </Typography>
      </CardContent>
    </Card>
  )
}

function TabPanel({ value, index, children }) {
  if (value !== index) return null
  return (
    <Box role="tabpanel" sx={{ py: 2 }}>
      {children}
    </Box>
  )
}

function toEditableState(record = {}) {
  return Object.entries(record).reduce((acc, [key, value]) => {
    acc[key] = value === undefined || value === null ? '' : String(value)
    return acc
  }, {})
}

function MainContent({ collection }) {
  const [activeTab, setActiveTab] = useState(0)
  const [headersState, setHeadersState] = useState({})
  const [paramsState, setParamsState] = useState({})
  const [bodyState, setBodyState] = useState({})
  const [isSending, setIsSending] = useState(false)
  const [responseInfo, setResponseInfo] = useState(null)
  const [isEditingEndpoint, setIsEditingEndpoint] = useState(false)
  const [currentEndpoint, setCurrentEndpoint] = useState('')

  const inputSchema = useMemo(() => collection?.inputSchema || {}, [collection])

  useEffect(() => {
    if (!collection) return
    setActiveTab(0)
    setHeadersState(toEditableState(collection.headers))
    setParamsState(toEditableState(collection.params))
    setBodyState(
      Object.entries(collection.inputSchema || {}).reduce((acc, [key, schema]) => {
        const initial = schema?.value ?? schema?.defaultValue ?? ''
        acc[key] = initial === undefined || initial === null ? '' : String(initial)
        return acc
      }, {})
    )
    setResponseInfo(null)
    setCurrentEndpoint(collection.endpoint || '')
    setIsEditingEndpoint(false)
  }, [collection])

  if (!collection) {
    return (
      <Box sx={{ py: 2 }}>
        <EmptyState />
      </Box>
    )
  }

  const handleSend = async () => {
    const trimmedEndpoint = currentEndpoint.trim()

    if (!trimmedEndpoint) {
      setResponseInfo({
        status: 'INVALID_ENDPOINT',
        ok: false,
        body: 'Endpoint cannot be empty.',
        url: '',
        durationMs: 0,
      })
      return
    }

    const getNow = () =>
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now()

    const startTime = getNow()

    setIsSending(true)
    setResponseInfo(null)

    try {
      const method = (collection.method || 'GET').toUpperCase()
      const hasProtocol = /^https?:\/\//i.test(trimmedEndpoint)
      const requestUrl = new URL(trimmedEndpoint, hasProtocol ? undefined : window.location.origin)

      Object.entries(paramsState).forEach(([key, value]) => {
        if (value === undefined || value === null || String(value).length === 0) return
        requestUrl.searchParams.set(key, String(value))
      })

      const preparedHeaders = Object.entries(headersState).reduce((acc, [key, value]) => {
        if (value === undefined || value === null || String(value).length === 0) return acc
        acc[key] = String(value)
        return acc
      }, {})

      const bodyPayload = Object.entries(bodyState).reduce((acc, [key, value]) => {
        if (value === undefined || value === null || String(value).length === 0) return acc
        acc[key] = value
        return acc
      }, {})

      const fetchOptions = {
        method,
        headers: { ...preparedHeaders },
      }

      const methodHasBody = !['GET', 'HEAD'].includes(method)
      if (methodHasBody) {
        if (!fetchOptions.headers['Content-Type']) {
          fetchOptions.headers['Content-Type'] = 'application/json'
        }
        fetchOptions.body = Object.keys(bodyPayload).length ? JSON.stringify(bodyPayload) : null
      }

      const response = await fetch(requestUrl.toString(), fetchOptions)
      const text = await response.text()
      let parsed
      try {
        parsed = text ? JSON.parse(text) : null
      } catch (parseError) {
        parsed = text
      }

      const duration = getNow() - startTime

      setResponseInfo({
        status: response.status,
        ok: response.ok,
        body: parsed,
        url: requestUrl.toString(),
        durationMs: duration,
      })

      if (!response.ok) {
        setResponseInfo((prev) =>
          prev
            ? prev
            : {
                status: response.status,
                ok: false,
                body: parsed,
                url: requestUrl.toString(),
                durationMs: duration,
              }
        )
      }
    } catch (error) {
      const message = error?.message || 'Request failed.'
      setResponseInfo({
        status: 'NETWORK_ERROR',
        ok: false,
        body: message,
        url: trimmedEndpoint,
        durationMs: getNow() - startTime,
      })
    } finally {
      setIsSending(false)
    }
  }

  const renderKeyValueFields = (entries, state, updater, emptyLabel) => {
    if (!entries.length) {
      return (
        <Typography variant="body2" color="text.secondary">
          {emptyLabel}
        </Typography>
      )
    }

    return (
      <Stack spacing={2}>
        {entries.map(([key]) => (
          <TextField
            key={key}
            label={key}
            value={state[key] ?? ''}
            onInput={(event) =>
              updater((prev) => ({
                ...prev,
                [key]: event.target.value,
              }))
            }
            fullWidth
            size="small"
          />
        ))}
      </Stack>
    )
  }

  const schemaEntries = Object.entries(inputSchema)

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {collection.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {collection.description || 'No description provided.'}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={!isSending ? <SendIcon /> : null}
                onClick={handleSend}
                disabled={isSending || !collection.isEnabled}
                sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' } }}
              >
                {isSending ? <CircularProgress color="inherit" size={22} /> : 'Send Request'}
              </Button>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Chip label={collection.method?.toUpperCase() || 'UNKNOWN'} color="primary" variant="filled" sx={{ fontWeight: 600 }} />
              <Chip label={collection.isEnabled ? 'Enabled' : 'Disabled'} color={collection.isEnabled ? 'success' : 'default'} variant={collection.isEnabled ? 'filled' : 'outlined'} />
              <Chip label={collection.id || collection.key || 'No ID'} variant="outlined" />
            </Stack>
            <Divider flexItem />
            <Box>
              <Typography variant="overline" display="block" gutterBottom sx={{ letterSpacing: '0.1em' }}>
                Endpoint
              </Typography>
              {isEditingEndpoint ? (
                <TextField
                  value={currentEndpoint}
                  onChange={(event) => setCurrentEndpoint(event.target.value)}
                  onBlur={() => setIsEditingEndpoint(false)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      setIsEditingEndpoint(false)
                    }
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      setCurrentEndpoint(collection.endpoint || '')
                      setIsEditingEndpoint(false)
                    }
                  }}
                  autoFocus
                  size="small"
                  fullWidth
                  placeholder="https://api.example.com/resource"
                />
              ) : (
                <Typography
                  variant="h6"
                  component="code"
                  onClick={() => setIsEditingEndpoint(true)}
                  sx={{
                    p: 1.25,
                    display: 'inline-block',
                    borderRadius: 1,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.light',
                    },
                  }}
                >
                  {currentEndpoint || 'Click to set endpoint'}
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            allowScrollButtonsMobile
          >
            <Tab label="Headers" />
            <Tab label="Params" />
            <Tab label="Body" />
          </Tabs>
          <Divider />
          <TabPanel value={activeTab} index={0}>
            {renderKeyValueFields(Object.entries(collection.headers || {}), headersState, setHeadersState, 'No headers configured.')}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderKeyValueFields(Object.entries(collection.params || {}), paramsState, setParamsState, 'No parameters configured.')}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {schemaEntries.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No input schema documented.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {schemaEntries.map(([fieldName, schema]) => (
                  <TextField
                    key={fieldName}
                    label={`${fieldName}${schema?.type ? ` (${schema.type})` : ''}`}
                    value={bodyState[fieldName] ?? ''}
                    onInput={(event) =>
                      setBodyState((prev) => ({
                        ...prev,
                        [fieldName]: event.target.value,
                      }))
                    }
                    fullWidth
                    size="small"
                    helperText={schema?.isMandatory ? 'Mandatory field' : 'Optional field'}
                  />
                ))}
              </Stack>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {responseInfo && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6">
                  Response
                </Typography>
                <Chip
                  label={`Status: ${responseInfo.status}`}
                  color={responseInfo.ok ? 'success' : 'error'}
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Response time: {((responseInfo.durationMs ?? 0) / 1000).toFixed(3)} seconds
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {responseInfo.url}
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 2,
                  maxHeight: 320,
                  overflow: 'auto',
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: '0.85rem',
                }}
              >
                {typeof responseInfo.body === 'string'
                  ? responseInfo.body || 'No content returned.'
                  : JSON.stringify(responseInfo.body, null, 2)}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}

export default MainContent
