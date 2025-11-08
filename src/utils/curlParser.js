const CURL_METHOD_REGEX = /\b-X\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/i
const CURL_URL_REGEX = /curl\s+-X?\s*(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)?\s*"([^"]+)"|curl\s+"([^"]+)"/i
const HEADER_REGEX = /-H\s+"([^"]*?)"/gi
const DATA_RAW_REGEX = /--data-raw\s+'([^']*)'|--data-raw\s+"([^"]*)"/i
const DATA_URLENCODED_REGEX = /--data-urlencode\s+'([^']*)'|--data-urlencode\s+"([^"]*)"/gi
const DATA_FORM_REGEX = /-F\s+"([^"]*?)"/gi
const JSON_CONTENT_TYPE_REGEX = /application\/json/i
const URLENCODED_CONTENT_TYPE_REGEX = /application\/x-www-form-urlencoded/i

const parseKeyValuePairs = (input) => {
  if (!input) return {}
  return input.split('&').reduce((acc, pair) => {
    const [key, value] = pair.split('=').map((part) => part?.trim())
    if (key) {
      acc[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
    }
    return acc
  }, {})
}

export const detectCurlCommand = (value) => {
  if (typeof value !== 'string') return false
  return value.trim().toLowerCase().startsWith('curl ')
}

export const parseCurlCommand = (command) => {
  if (!detectCurlCommand(command)) return null

  const methodMatch = command.match(CURL_METHOD_REGEX)
  const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET'

  const urlMatch = command.match(CURL_URL_REGEX)
  const url = urlMatch ? urlMatch[1] || urlMatch[2] : ''

  const headers = {}
  let headerMatch
  while ((headerMatch = HEADER_REGEX.exec(command)) !== null) {
    const [key, value] = headerMatch[1].split(':').map((part) => part.trim())
    if (key) {
      headers[key] = value || ''
    }
  }

  const params = (() => {
    try {
      const urlObject = new URL(url)
      return Array.from(urlObject.searchParams.entries()).reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {})
    } catch (error) {
      return {}
    }
  })()

  const rawDataMatch = command.match(DATA_RAW_REGEX)
  const rawBody = rawDataMatch ? rawDataMatch[1] || rawDataMatch[2] : ''

  const urlEncodedEntries = []
  let urlEncodedMatch
  while ((urlEncodedMatch = DATA_URLENCODED_REGEX.exec(command)) !== null) {
    const pair = urlEncodedMatch[1] || urlEncodedMatch[2]
    if (pair) {
      urlEncodedEntries.push(pair)
    }
  }

  const formDataEntries = []
  let formDataMatch
  while ((formDataMatch = DATA_FORM_REGEX.exec(command)) !== null) {
    const fragment = formDataMatch[1]
    if (!fragment) continue
    const [key, value] = fragment.split('=').map((part) => part?.trim())
    if (key) {
      formDataEntries.push({ key, value: value ?? '', type: 'text' })
    }
  }

  const contentTypeHeader = Object.entries(headers).find(([key]) => key.toLowerCase() === 'content-type')
  const contentType = contentTypeHeader ? contentTypeHeader[1] : ''

  const body = (() => {
    if (formDataEntries.length) {
      return {
        mode: 'form-data',
        formData: formDataEntries,
      }
    }
    if (urlEncodedEntries.length || URLENCODED_CONTENT_TYPE_REGEX.test(contentType)) {
      return {
        mode: 'urlencoded',
        urlEncoded: urlEncodedEntries.length
          ? urlEncodedEntries.map((pair) => {
              const [key, value] = pair.split('=').map((part) => part?.trim())
              return { key, value: value ?? '' }
            })
          : Object.entries(parseKeyValuePairs(rawBody)).map(([key, value]) => ({ key, value })),
      }
    }
    if (rawBody) {
      return {
        mode: JSON_CONTENT_TYPE_REGEX.test(contentType) ? 'raw' : 'raw',
        rawLanguage: JSON_CONTENT_TYPE_REGEX.test(contentType) ? 'json' : 'text',
        raw: rawBody,
      }
    }
    return {
      mode: 'none',
    }
  })()

  return {
    method,
    url,
    headers,
    params,
    body,
  }
}

export default parseCurlCommand
