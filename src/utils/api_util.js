import rawCollections from '../../data/apiCollections.json'

const LS_KEY = 'api_consolex_collections'

// record <-> array helpers
const mapCollections = (record) =>
  Object.entries(record || {}).map(([key, value]) => ({
    ...value,
    key,
    id: value?.id || key,
  }))

const toRecord = (list) =>
  (list || []).reduce((acc, item) => {
    const id = item.id || item.key
    if (id) acc[id] = { ...item, id }
    return acc
  }, {})

function readStore() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  // fallback to bundled json
  return rawCollections || {}
}

function writeStore(record) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(record))
  } catch (e) {
    console.warn('Failed to persist to localStorage:', e)
  }
}

export async function listCollections() {
  const data = readStore()
  return mapCollections(data)
}

export async function getCollectionById(id) {
  const data = readStore()
  return data?.[id] ? { ...data[id], id: data[id].id || id, key: id } : null
}

export async function createCollectionUtil(payload) {
  const data = readStore()
  const id = payload.id || payload.key || `api-${Date.now()}`
  const record = {
    ...data,
    [id]: { ...payload, id },
  }
  const created = record[id]
  return { ...created, id, key: id }
}

export async function updateCollection(id, updates) {
  const data = readStore()
  const existing = data[id] || {}
  const record = {
    ...data,
    [id]: { ...existing, ...updates, id },
  }
  writeStore(record)
  return { ...record[id] }
}

export async function deleteCollection(id) {
  const data = readStore()
  if (!data[id]) return false
  const { [id]: removed, ...rest } = data
  writeStore(rest)
  return true
}
