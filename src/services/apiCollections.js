import rawCollections from '../../data/apiCollections.json'

export function getApiCollections() {
  return Object.entries(rawCollections).map(([key, value]) => ({
    ...value,
    key,
  }))
}

export function getCollectionById(id) {
  const collections = getApiCollections()
  return collections.find((collection) => collection.id === id || collection.key === id) || null
}
