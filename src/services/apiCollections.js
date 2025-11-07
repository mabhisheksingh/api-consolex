import rawCollections from '../../data/apiCollections.json'
import {
  listCollections,
  createCollectionUtil,
  updateCollection as updateCollectionUtil,
} from '../utils/api_util'
const mapCollections = (record) =>
  Object.entries(record || {}).map(([key, value]) => ({
    ...value,
    key,
    id: value?.id || key,
  }))

export async function fetchCollections() {
  try {
    const list = await listCollections()
    // listCollections already returns array; if it returns record, map it
    if (Array.isArray(list)) return list
    return mapCollections(list)
  } catch (error) {
    console.error('Falling back to bundled collections:', error)
    return mapCollections(rawCollections)
  }
}

export async function createCollection(newCollection) {
  const created = await createCollectionUtil(newCollection)
  return created
}

export async function updateCollection(id, updates) {
  const updated = await updateCollectionUtil(id, updates)
  return updated
}
