export const DEFAULT_FORM_DATA_ROW = { key: '', value: '', type: 'text' }
export const DEFAULT_URL_ENCODED_ROW = { key: '', value: '' }

export const RAW_LANGUAGE_OPTIONS = [
  { value: 'json', label: 'JSON' },
  { value: 'text', label: 'Text' },
  { value: 'xml', label: 'XML' },
  { value: 'html', label: 'HTML' },
]

export const BODY_MODE_OPTIONS = [
  { value: 'none', label: 'none' },
  { value: 'form-data', label: 'form-data' },
  { value: 'raw', label: 'raw' },
  { value: 'binary', label: 'binary' },
  { value: 'urlencoded', label: 'x-www-form-urlencoded' },
  { value: 'graphql', label: 'GraphQL' },
]

export const normalizeBodyMode = (mode) => {
  const normalized = (mode || '').toLowerCase()
  if (normalized === 'formdata' || normalized === 'form-data') return 'form-data'
  if (normalized === 'raw') return 'raw'
  if (normalized === 'binary') return 'binary'
  if (normalized === 'graphql') return 'graphql'
  if (normalized === 'x-www-form-urlencoded' || normalized === 'urlencoded') return 'urlencoded'
  return 'none'
}

export const getDefaultBodyConfig = () => ({
  mode: 'none',
  rawLanguage: 'json',
  raw: '',
  formData: [],
  urlEncoded: [],
  binary: { fileName: '' },
  graphql: { query: '', variables: '{}' },
})

export const getDefaultBodyState = () => ({
  mode: 'none',
  rawLanguage: 'json',
  raw: '',
  formData: [{ ...DEFAULT_FORM_DATA_ROW }],
  urlEncoded: [{ ...DEFAULT_URL_ENCODED_ROW }],
  binary: { fileName: '', file: null },
  graphql: { query: '', variables: '{}' },
})
