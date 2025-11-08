import { useEffect, useState } from 'preact/hooks'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import SendIcon from '@mui/icons-material/Send'
import CodeIcon from '@mui/icons-material/Code'
import RequestBodyEditor from './RequestBodyEditor'
import RequestSnippetPanel from './RequestSnippetPanel'
import {
  DEFAULT_FORM_DATA_ROW,
  DEFAULT_URL_ENCODED_ROW,
  normalizeBodyMode,
  getDefaultBodyState,
} from '../utils/bodyConfig'

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

function MainContent({
  collection,
  collectionsLoading,
  collectionsError,
  onToggleEnabled,
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [headersState, setHeadersState] = useState({})
  const [paramsState, setParamsState] = useState({})
  const [bodyState, setBodyState] = useState(getDefaultBodyState())
  const [isSending, setIsSending] = useState(false)
  const [responseInfo, setResponseInfo] = useState(null)
  const [isEditingEndpoint, setIsEditingEndpoint] = useState(false)
  const [currentEndpoint, setCurrentEndpoint] = useState('')
  const [isSnippetCollapsed, setIsSnippetCollapsed] = useState(false)

  useEffect(() => {
    if (!collection) return
    setActiveTab(0)
    setHeadersState(toEditableState(collection.headers))
    setParamsState(toEditableState(collection.params))
    const bodyConfig = collection.body || {}
    const buildFormData = (source) =>
      Array.isArray(source)
        ? source.map((item) => ({
            key: item?.key || '',
            value: item?.value ?? '',
            type: item?.type || 'text',
          }))
        : []
    const buildUrlEncoded = (source) =>
      Array.isArray(source)
        ? source.map((item) => ({
            key: item?.key || '',
            value: item?.value ?? '',
          }))
        : []
    const formData = buildFormData(bodyConfig.formData)
    const urlEncoded = buildUrlEncoded(bodyConfig.urlEncoded)
    setBodyState({
      mode: normalizeBodyMode(bodyConfig.mode || 'none'),
      rawLanguage: bodyConfig.rawLanguage || 'json',
      raw: bodyConfig.raw ?? '',
      formData: formData.length ? formData : [{ ...DEFAULT_FORM_DATA_ROW }],
      urlEncoded: urlEncoded.length ? urlEncoded : [{ ...DEFAULT_URL_ENCODED_ROW }],
      binary: {
        fileName: bodyConfig.binary?.fileName ?? '',
        file: null,
      },
      graphql: {
        query: bodyConfig.graphql?.query ?? '',
        variables: bodyConfig.graphql?.variables ?? '{}',
      },
    })
    setResponseInfo(null)
    setCurrentEndpoint(collection.endpoint || '')
    setIsEditingEndpoint(false)
  }, [collection])

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

      const fetchOptions = {
        method,
        headers: { ...preparedHeaders },
      }

      const methodHasBody = !['GET', 'HEAD'].includes(method)
      if (methodHasBody) {
        const setHeader = (headers, name, value) => {
          const existingKey = Object.keys(headers).find((key) => key.toLowerCase() === name.toLowerCase())
          if (existingKey) {
            headers[existingKey] = value
          } else {
            headers[name] = value
          }
        }

        const removeHeader = (headers, name) => {
          const existingKey = Object.keys(headers).find((key) => key.toLowerCase() === name.toLowerCase())
          if (existingKey) {
            delete headers[existingKey]
          }
        }

        const bodyMode = bodyState.mode
        if (bodyMode === 'raw') {
          const rawValue = bodyState.raw || ''
          const language = bodyState.rawLanguage || 'json'
          const contentTypeMap = {
            json: 'application/json',
            text: 'text/plain',
            xml: 'application/xml',
            html: 'text/html',
          }
          setHeader(fetchOptions.headers, 'Content-Type', contentTypeMap[language] || 'text/plain')
          fetchOptions.body = rawValue
        } else if (bodyMode === 'form-data') {
          const formData = new FormData()
          bodyState.formData.forEach((item) => {
            if (!item.key) return
            if (item.type === 'file') {
              if (item.value instanceof File) {
                formData.append(item.key, item.value)
              }
            } else {
              if (item.value !== undefined && item.value !== null) {
                formData.append(item.key, String(item.value))
              }
            }
          })
          fetchOptions.body = formData
          removeHeader(fetchOptions.headers, 'Content-Type')
        } else if (bodyMode === 'binary') {
          if (bodyState.binary?.file instanceof File) {
            fetchOptions.body = bodyState.binary.file
            removeHeader(fetchOptions.headers, 'Content-Type')
          } else {
            fetchOptions.body = null
          }
        } else if (bodyMode === 'urlencoded') {
          const params = new URLSearchParams()
          bodyState.urlEncoded.forEach((item) => {
            if (!item.key) return
            params.append(item.key, item.value ?? '')
          })
          setHeader(fetchOptions.headers, 'Content-Type', 'application/x-www-form-urlencoded')
          fetchOptions.body = params.toString()
        } else if (bodyMode === 'graphql') {
          const payload = {
            query: bodyState.graphql?.query || '',
            variables: (() => {
              try {
                return JSON.parse(bodyState.graphql?.variables || '{}')
              } catch (error) {
                return bodyState.graphql?.variables || '{}'
              }
            })(),
          }
          setHeader(fetchOptions.headers, 'Content-Type', 'application/json')
          fetchOptions.body = JSON.stringify(payload)
        } else {
          fetchOptions.body = null
        }
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

  const handleToggleEnabled = () => {
    if (!collection) return
    const identifier = collection.id || collection.key
    onToggleEnabled?.(identifier, !collection.isEnabled)
  }

  return (
    <Stack spacing={3} component="section" aria-label="API request workspace">
      {collectionsError && (
        <Alert severity="error">{collectionsError}</Alert>
      )}

      {collectionsLoading && (
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>Loading API collections…</Typography>
          </CardContent>
        </Card>
      )}

      {collection ? (
        <Box sx={{ width: '100%', px: { xs: 1.5, sm: 0 } }}>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            alignItems="stretch"
            component="section"
            aria-label={`${collection.name} details`}
            sx={{ width: '100%', mx: 0 }}
          >
          <Grid item xs={12} lg={isSnippetCollapsed ? 12 : 7} xl={isSnippetCollapsed ? 12 : 8}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <Card component="section" aria-label="API summary">
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={2}
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                      justifyContent="space-between"
                      component="header"
                      aria-label="API overview"
                    >
                      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
                          {collection.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                          {collection.description || 'No description provided.'}
                        </Typography>
                      </Stack>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        sx={{ width: '100%', maxWidth: { xs: '100%', md: 320 } }}
                      >
                        <Button
                          variant={collection.isEnabled ? 'outlined' : 'contained'}
                          color={collection.isEnabled ? 'warning' : 'success'}
                          onClick={handleToggleEnabled}
                          sx={{ minWidth: 140 }}
                        >
                          {collection.isEnabled ? 'Disable API' : 'Enable API'}
                        </Button>
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
                      </Stack>
                    </Stack>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      sx={{ flexWrap: 'wrap' }}
                    >
                      <Chip
                        label={collection.method?.toUpperCase() || 'UNKNOWN'}
                        color="primary"
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip label={collection.id || collection.key || 'No ID'} variant="outlined" />
                      {collection.tags?.length ? (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                          {collection.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      ) : null}
                    </Stack>
                    <Divider flexItem />
                    <Box component="section" aria-label="Endpoint">
                      <Typography
                        variant="overline"
                        display="block"
                        gutterBottom
                        sx={{ letterSpacing: '0.1em' }}
                      >
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
                            maxWidth: '100%',
                            wordBreak: 'break-all',
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
                    <RequestBodyEditor bodyState={bodyState} setBodyState={setBodyState} />
                  </TabPanel>
                </CardContent>
              </Card>

              {responseInfo && (
                <Card component="section" aria-label="Response preview">
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
          </Grid>
            {isSnippetCollapsed ? (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CodeIcon />}
                    onClick={() => setIsSnippetCollapsed(false)}
                  >
                    Show request snippets
                  </Button>
                </Box>
              </Grid>
            ) : (
              <Grid item xs={12} lg={5} xl={4}>
                <RequestSnippetPanel
                  endpoint={currentEndpoint || collection.endpoint || ''}
                  method={(collection.method || 'GET').toUpperCase()}
                  headers={headersState}
                  body={bodyState}
                  collapsed={isSnippetCollapsed}
                  onCollapsedChange={setIsSnippetCollapsed}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      ) : (
        !collectionsLoading && <EmptyState />
      )}
    </Stack>
  )
}

export default MainContent
