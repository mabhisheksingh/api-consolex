import { useMemo, useState } from 'preact/hooks'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const SNIPPETS = [
  { value: 'curl', label: 'cURL' },
  { value: 'fetch', label: 'JavaScript Fetch' },
  { value: 'node', label: 'Node Axios' },
]

function sanitizeHeaders(headers = {}) {
  return Object.entries(headers).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) return acc
    const stringValue = String(value)
    if (!stringValue.length) return acc
    acc[key] = stringValue
    return acc
  }, {})
}

function buildCurl({ endpoint, method, headers, body }) {
  if (!endpoint) return ''
  const headerLines = Object.entries(headers)
    .map(([key, value]) => `  -H "${key}: ${value}"`)
    .join(' \\\n')

  const hasRawBody = body?.mode === 'raw' && body.raw
  const dataLine = hasRawBody ? `  --data '${body.raw}'` : ''

  return [
    `curl -X ${method} \\\n  "${endpoint}"`,
    headerLines,
    dataLine,
  ]
    .filter(Boolean)
    .join(' \\\n')
}

function buildFetch({ endpoint, method, headers, body }) {
  if (!endpoint) return ''
  const lines = []
  lines.push(`fetch("${endpoint}", {`)
  lines.push(`  method: "${method}",`)
  if (Object.keys(headers).length) {
    lines.push('  headers: ' + JSON.stringify(headers, null, 2).replace(/^(.)/gm, '  $1') + ',')
  }
  if (body?.mode === 'raw' && body.raw) {
    lines.push(`  body: ${JSON.stringify(body.raw)},`)
  }
  lines.push('})')
  lines.push('  .then((response) => response.json())')
  lines.push('  .then((data) => console.log(data))')
  lines.push('  .catch((error) => console.error(error))')
  return lines.join('\n')
}

function buildNodeAxios({ endpoint, method, headers, body }) {
  if (!endpoint) return ''
  const lines = []
  lines.push("import axios from 'axios'")
  lines.push('')
  lines.push('async function run() {')
  lines.push('  try {')
  lines.push('    const response = await axios({')
  lines.push(`      method: '${method.toLowerCase()}',`)
  lines.push(`      url: '${endpoint}',`)
  if (Object.keys(headers).length) {
    lines.push(
      '      headers: ' +
        JSON.stringify(headers, null, 2)
          .split('\n')
          .map((line) => `      ${line}`)
          .join('\n') +
        ',',
    )
  }
  if (body?.mode === 'raw' && body.raw) {
    lines.push(`      data: ${JSON.stringify(body.raw)},`)
  }
  lines.push('    })')
  lines.push('    console.log(response.data)')
  lines.push('  } catch (error) {')
  lines.push('    console.error(error)')
  lines.push('  }')
  lines.push('}')
  lines.push('')
  lines.push('run()')
  return lines.join('\n')
}

const BUILDERS = {
  curl: buildCurl,
  fetch: buildFetch,
  node: buildNodeAxios,
}

export default function RequestSnippetPanel({
  endpoint,
  method = 'GET',
  headers = {},
  body,
  collapsed: collapsedProp,
  onCollapsedChange,
}) {
  const [selected, setSelected] = useState('curl')
  const [copied, setCopied] = useState(false)
  const [internalCollapsed, setInternalCollapsed] = useState(false)

  const normalizedHeaders = useMemo(() => sanitizeHeaders(headers), [headers])

  const snippet = useMemo(() => {
    const builder = BUILDERS[selected]
    if (!builder) return ''
    return builder({ endpoint, method, headers: normalizedHeaders, body })
  }, [selected, endpoint, method, normalizedHeaders, body])

  const handleCopy = async () => {
    if (!snippet) return
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.warn('Failed to copy snippet', error)
    }
  }

  const isControlled = collapsedProp !== undefined
  const collapsed = isControlled ? collapsedProp : internalCollapsed

  const handleToggleCollapsed = () => {
    const next = !collapsed
    onCollapsedChange?.(next)
    if (!isControlled) {
      setInternalCollapsed(next)
    }
  }

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Request snippets
        </Typography>
        <IconButton
          size="small"
          onClick={handleToggleCollapsed}
          aria-label={collapsed ? 'Expand snippet panel' : 'Collapse snippet panel'}
        >
          {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
        </IconButton>
      </CardActions>
      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="snippet-select-label">Snippet</InputLabel>
              <Select
                labelId="snippet-select-label"
                value={selected}
                label="Snippet"
                onChange={(event) => setSelected(event.target.value)}
              >
                {SNIPPETS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCopy}
              disabled={!snippet}
              startIcon={<ContentCopyIcon fontSize="small" />}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
        </Stack>

          <Divider />

          <Box
            sx={{
              flex: 1,
              bgcolor: 'background.default',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              p: 2,
              overflow: 'auto',
              fontFamily: 'Roboto Mono, monospace',
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {snippet || 'Select an API request to view snippets.'}
          </Box>

          <Typography variant="caption" color="text.secondary">
            Snippets are generated from the current endpoint, method, headers, and raw body.
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  )
}
