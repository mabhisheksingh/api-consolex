import { useMemo } from 'preact/hooks'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { JsonView, defaultStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

import {
  DEFAULT_FORM_DATA_ROW,
  DEFAULT_URL_ENCODED_ROW,
  RAW_LANGUAGE_OPTIONS,
  BODY_MODE_OPTIONS,
} from '../utils/bodyConfig'

function RequestBodyEditor({ bodyState, setBodyState }) {
  const isRawJson = useMemo(
    () => bodyState.mode === 'raw' && (bodyState.rawLanguage || 'json') === 'json',
    [bodyState.mode, bodyState.rawLanguage]
  )

  const rawJsonInfo = useMemo(() => {
    if (!isRawJson) return { data: null, error: null }
    if (!bodyState.raw || !bodyState.raw.trim()) return { data: null, error: null }
    try {
      return { data: JSON.parse(bodyState.raw), error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }, [isRawJson, bodyState.raw])

  const handleBeautifyJson = () => {
    if (!rawJsonInfo.data) return
    setBodyState((prev) => ({
      ...prev,
      raw: JSON.stringify(rawJsonInfo.data, null, 2),
    }))
  }

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="subtitle1">Body</Typography>
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: 'wrap', gap: { xs: 1, sm: 1 }, rowGap: { xs: 1, sm: 1 } }}
        >
          {BODY_MODE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={bodyState.mode === option.value ? 'contained' : 'outlined'}
              size="small"
              onClick={() =>
                setBodyState((prev) => ({
                  ...prev,
                  mode: option.value,
                }))
              }
            >
              {option.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {bodyState.mode === 'none' && (
        <Typography variant="body2" color="text.secondary">
          No body will be sent with this request.
        </Typography>
      )}

      {bodyState.mode === 'raw' && (
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ width: 220 }}>
              <InputLabel id="raw-language-select">Language</InputLabel>
              <Select
                labelId="raw-language-select"
                value={bodyState.rawLanguage || 'json'}
                label="Language"
                onChange={(event) =>
                  setBodyState((prev) => ({
                    ...prev,
                    rawLanguage: event.target.value,
                  }))
                }
              >
                {RAW_LANGUAGE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {isRawJson && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleBeautifyJson}
                disabled={!rawJsonInfo.data}
              >
                Beautify JSON
              </Button>
            )}
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
            <TextField
              multiline
              minRows={6}
              maxRows={18}
              value={bodyState.raw ?? ''}
              onInput={(event) =>
                setBodyState((prev) => ({
                  ...prev,
                  raw: event.target.value,
                }))
              }
              fullWidth
              placeholder="Enter raw request body"
              sx={{ flex: 1 }}
            />
            {isRawJson && (
              <Box
                sx={{
                  flex: 1,
                  minHeight: { xs: 0, md: 240 },
                  border: '1px solid',
                  borderColor: rawJsonInfo.error ? 'error.main' : 'divider',
                  borderRadius: 1,
                  p: 1.5,
                  overflow: 'auto',
                  bgcolor: 'background.default',
                }}
              >
                {rawJsonInfo.error ? (
                  <Typography variant="body2" color="error">
                    Invalid JSON: {rawJsonInfo.error}
                  </Typography>
                ) : rawJsonInfo.data ? (
                  <JsonView data={rawJsonInfo.data} shouldExpandNode={() => true} style={defaultStyles} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    JSON preview will appear here once you add valid JSON.
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
          {isRawJson && rawJsonInfo.error && (
            <Typography variant="caption" color="error">
              Your JSON is invalid. Please fix the highlighted issues above.
            </Typography>
          )}
        </Stack>
      )}

      {bodyState.mode === 'form-data' && (
        <Stack spacing={1.5}>
          {bodyState.formData.map((item, index) => (
            <Stack key={`form-data-${index}`} direction="row" spacing={1} alignItems="center">
              <TextField
                label="Key"
                value={item.key}
                onInput={(event) =>
                  setBodyState((prev) => {
                    const next = { ...prev }
                    next.formData = [...prev.formData]
                    next.formData[index] = {
                      ...next.formData[index],
                      key: event.target.value,
                    }
                    return next
                  })
                }
                size="small"
                sx={{ width: 160 }}
              />
              <FormControl size="small" sx={{ width: 140 }}>
                <InputLabel id={`form-data-type-${index}`}>Type</InputLabel>
                <Select
                  labelId={`form-data-type-${index}`}
                  value={item.type || 'text'}
                  label="Type"
                  onChange={(event) =>
                    setBodyState((prev) => {
                      const next = { ...prev }
                      next.formData = [...prev.formData]
                      next.formData[index] = {
                        ...next.formData[index],
                        type: event.target.value,
                        value:
                          event.target.value === 'file'
                            ? ''
                            : next.formData[index].value ?? '',
                      }
                      return next
                    })
                  }
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="file">File</MenuItem>
                </Select>
              </FormControl>
              {item.type === 'file' ? (
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  sx={{ flexGrow: 1, justifyContent: 'flex-start' }}
                >
                  {item.value instanceof File ? item.value.name : 'Choose file'}
                  <input
                    type="file"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      setBodyState((prev) => {
                        const next = { ...prev }
                        next.formData = [...prev.formData]
                        next.formData[index] = {
                          ...next.formData[index],
                          value: file || '',
                        }
                        return next
                      })
                    }}
                  />
                </Button>
              ) : (
                <TextField
                  label="Value"
                  value={item.value ?? ''}
                  onInput={(event) =>
                    setBodyState((prev) => {
                      const next = { ...prev }
                      next.formData = [...prev.formData]
                      next.formData[index] = {
                        ...next.formData[index],
                        value: event.target.value,
                      }
                      return next
                    })
                  }
                  size="small"
                  fullWidth
                />
              )}
              <IconButton
                size="small"
                color="error"
                onClick={() =>
                  setBodyState((prev) => {
                    const next = { ...prev }
                    next.formData = prev.formData.filter((_, idx) => idx !== index)
                    if (!next.formData.length) {
                      next.formData = [{ ...DEFAULT_FORM_DATA_ROW }]
                    }
                    return next
                  })
                }
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          <Button
            variant="text"
            size="small"
            startIcon={<AddCircleOutlineIcon fontSize="small" />}
            onClick={() =>
              setBodyState((prev) => ({
                ...prev,
                formData: [...prev.formData, { ...DEFAULT_FORM_DATA_ROW }],
              }))
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            Add form-data field
          </Button>
        </Stack>
      )}

      {bodyState.mode === 'urlencoded' && (
        <Stack spacing={1.5}>
          {bodyState.urlEncoded.map((item, index) => (
            <Stack key={`urlencoded-${index}`} direction="row" spacing={1} alignItems="center">
              <TextField
                label="Key"
                value={item.key}
                onInput={(event) =>
                  setBodyState((prev) => {
                    const next = { ...prev }
                    next.urlEncoded = [...prev.urlEncoded]
                    next.urlEncoded[index] = {
                      ...next.urlEncoded[index],
                      key: event.target.value,
                    }
                    return next
                  })
                }
                size="small"
                sx={{ width: 160 }}
              />
              <TextField
                label="Value"
                value={item.value ?? ''}
                onInput={(event) =>
                  setBodyState((prev) => {
                    const next = { ...prev }
                    next.urlEncoded = [...prev.urlEncoded]
                    next.urlEncoded[index] = {
                      ...next.urlEncoded[index],
                      value: event.target.value,
                    }
                    return next
                  })
                }
                size="small"
                fullWidth
              />
              <IconButton
                size="small"
                color="error"
                onClick={() =>
                  setBodyState((prev) => {
                    const next = { ...prev }
                    next.urlEncoded = prev.urlEncoded.filter((_, idx) => idx !== index)
                    if (!next.urlEncoded.length) {
                      next.urlEncoded = [{ ...DEFAULT_URL_ENCODED_ROW }]
                    }
                    return next
                  })
                }
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          <Button
            variant="text"
            size="small"
            startIcon={<AddCircleOutlineIcon fontSize="small" />}
            onClick={() =>
              setBodyState((prev) => ({
                ...prev,
                urlEncoded: [...prev.urlEncoded, { ...DEFAULT_URL_ENCODED_ROW }],
              }))
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            Add urlencoded field
          </Button>
        </Stack>
      )}

      {bodyState.mode === 'binary' && (
        <Stack spacing={1}>
          <Button variant="outlined" component="label" size="small" sx={{ alignSelf: 'flex-start' }}>
            {bodyState.binary?.file instanceof File
              ? bodyState.binary.file.name
              : bodyState.binary?.fileName || bodyState.binary?.file?.name || 'Choose file'}
            <input
              type="file"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0]
                setBodyState((prev) => ({
                  ...prev,
                  binary: {
                    ...prev.binary,
                    file: file || null,
                    fileName: file?.name || prev.binary?.fileName || '',
                  },
                }))
              }}
            />
          </Button>
        </Stack>
      )}

      {bodyState.mode === 'graphql' && (
        <Stack spacing={2}>
          <TextField
            label="Query"
            value={bodyState.graphql?.query ?? ''}
            onInput={(event) =>
              setBodyState((prev) => ({
                ...prev,
                graphql: {
                  ...prev.graphql,
                  query: event.target.value,
                },
              }))
            }
            multiline
            minRows={6}
            maxRows={18}
            fullWidth
          />
          <TextField
            label="Variables"
            value={bodyState.graphql?.variables ?? '{}'}
            onInput={(event) =>
              setBodyState((prev) => ({
                ...prev,
                graphql: {
                  ...prev.graphql,
                  variables: event.target.value,
                },
              }))
            }
            multiline
            minRows={4}
            maxRows={12}
            fullWidth
          />
        </Stack>
      )}
    </Stack>
  )
}

export default RequestBodyEditor
