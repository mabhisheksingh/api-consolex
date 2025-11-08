import { useEffect, useMemo, useState } from 'preact/hooks'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import createAppTheme from './theme'
import { fetchCollections, createCollection, updateCollection, deleteCollection } from './services/apiCollections'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import CreateApiForm from './components/CreateApiForm'
import Footer from './components/Footer'
import About from './components/About'
import Documentation from './components/Documentation'

const drawerWidth = 280

export function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const isDesktop = useMediaQuery('(min-width:600px)')

  const [colorMode, setColorMode] = useState(() => {
    if (typeof window === 'undefined') return prefersDarkMode ? 'dark' : 'light'
    const stored = window.localStorage.getItem('api-consolex-color-mode')
    if (stored === 'light' || stored === 'dark') return stored
    return prefersDarkMode ? 'dark' : 'light'
  })

  useEffect(() => {
    setColorMode((prev) => prev || (prefersDarkMode ? 'dark' : 'light'))
  }, [prefersDarkMode])

  const [collections, setCollections] = useState([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)
  const [collectionsError, setCollectionsError] = useState(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isAboutVisible, setIsAboutVisible] = useState(false)
  const [isDocsVisible, setIsDocsVisible] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    let active = true
    const load = async () => {
      setCollectionsLoading(true)
      setCollectionsError(null)
      try {
        const data = await fetchCollections()
        if (!active) return
        setCollections(data)
        if (data.length) {
          setSelectedCollectionId((prev) => prev || data[0].id || data[0].key || '')
        }
      } catch (error) {
        if (!active) return
        setCollectionsError(error.message || 'Failed to load API collections')
      } finally {
        if (active) {
          setCollectionsLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!collections.length) {
      setSelectedCollectionId('')
    } else if (
      collections.length &&
      !collections.find((collection) => (collection.id || collection.key) === selectedCollectionId)
    ) {
      setSelectedCollectionId(collections[0].id || collections[0].key || '')
    }
  }, [collections, selectedCollectionId])

  const filteredCollections = useMemo(() => {
    if (filterStatus === 'enabled') {
      return collections.filter((collection) => collection.isEnabled)
    }
    if (filterStatus === 'disabled') {
      return collections.filter((collection) => !collection.isEnabled)
    }
    return collections
  }, [collections, filterStatus])

  const selectedCollection = useMemo(() => {
    if (!collections.length) return null
    if (!selectedCollectionId) return null

    return (
      collections.find(
        (collection) =>
          collection.id === selectedCollectionId || collection.key === selectedCollectionId
      ) || null
    )
  }, [collections, selectedCollectionId])

  const handleSelectCollection = (collectionId) => {
    setSelectedCollectionId(collectionId)
    setIsSidebarOpen(false)
    setIsCreating(false)
    setIsAboutVisible(false)
    setIsDocsVisible(false)
  }

  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(false)
    } else {
      setIsSidebarCollapsed(false)
    }
  }, [isDesktop])

  const handleMenuToggle = () => {
    if (isDesktop) {
      setIsSidebarCollapsed((collapsed) => !collapsed)
    } else {
      setIsSidebarOpen((open) => !open)
    }
  }

  const handleSidebarClose = () => {
    if (isDesktop) {
      setIsSidebarCollapsed(true)
    } else {
      setIsSidebarOpen(false)
    }
  }

  const isSidebarVisible = isDesktop ? !isSidebarCollapsed : isSidebarOpen

  const theme = useMemo(() => createAppTheme(colorMode), [colorMode])

  const handleCreateCollection = async (payload) => {
    const created = await createCollection(payload)
    setCollections((prev) => [...prev, created])
    setSelectedCollectionId(created.id || created.key)
    setIsCreating(false)
    return created
  }

  const handleCreateClick = () => {
    setIsCreating(true)
    // close mobile sidebar to reveal main area
    setIsSidebarOpen(false)
    setIsAboutVisible(false)
    setIsDocsVisible(false)
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
  }

  const handleToggleEnabled = async (collectionId, nextEnabled) => {
    const target = collections.find(
      (collection) => (collection.id || collection.key) === collectionId
    )
    if (!target) return

    const updated = await updateCollection(collectionId, { isEnabled: nextEnabled })
    setCollections((prev) =>
      prev.map((collection) => {
        const identifier = collection.id || collection.key
        if (identifier !== collectionId) return collection
        return { ...collection, ...updated }
      })
    )
  }

  const handleFilterChange = (status) => {
    setFilterStatus(status)
  }

  const handleDeleteCollection = async (collectionId) => {
    if (!collectionId) return
    const confirmed = typeof window === 'undefined' ? true : window.confirm('Delete this API collection?')
    if (!confirmed) return

    const deleted = await deleteCollection(collectionId)
    if (!deleted) return

    setCollections((prev) => prev.filter((collection) => (collection.id || collection.key) !== collectionId))

    setSelectedCollectionId((prevSelected) => {
      if (prevSelected === collectionId) {
        return ''
      }
      return prevSelected
    })
  }

  const handleAboutClick = () => {
    setIsAboutVisible(true)
    setIsCreating(false)
    setIsSidebarOpen(false)
    setIsDocsVisible(false)
  }

  const handleCloseAbout = () => {
    setIsAboutVisible(false)
  }

  const handleDocumentationClick = () => {
    setIsDocsVisible(true)
    setIsAboutVisible(false)
    setIsCreating(false)
    setIsSidebarOpen(false)
  }

  const handleCloseDocumentation = () => {
    setIsDocsVisible(false)
  }

  const handleToggleTheme = () => {
    setColorMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try {
        window.localStorage.setItem('api-consolex-color-mode', next)
      } catch (error) {
        console.warn('Failed to persist color mode', error)
      }
      return next
    })
  }

  useEffect(() => {
    if (isCreating) return
    if (!filteredCollections.length) {
      setSelectedCollectionId('')
      return
    }
    const exists = filteredCollections.find(
      (collection) =>
        (collection.id || collection.key) === selectedCollectionId
    )
    if (!exists) {
      const first = filteredCollections[0]
      setSelectedCollectionId(first.id || first.key || '')
    }
  }, [filteredCollections, filterStatus, isCreating, selectedCollectionId])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <Header
          onMenuClick={handleMenuToggle}
          sidebarVisible={isSidebarVisible}
          colorMode={colorMode}
          onToggleTheme={handleToggleTheme}
        />
        <Box sx={{ display: 'flex', flexGrow: 1, width: '100%' }}>
          <Sidebar
            drawerWidth={drawerWidth}
            collections={filteredCollections}
            totalCount={collections.length}
            selectedId={selectedCollection?.id || selectedCollection?.key || ''}
            mobileOpen={isSidebarOpen}
            onClose={handleSidebarClose}
            onSelect={handleSelectCollection}
            collapsed={isDesktop && isSidebarCollapsed}
            onToggle={handleMenuToggle}
            onCreateClick={handleCreateClick}
            filterStatus={filterStatus}
            onFilterChange={handleFilterChange}
            onDelete={handleDeleteCollection}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2, sm: 3, md: 4 },
              }}
            >
              <Box sx={{ width: '100%', maxWidth: 1240, display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
                {isDocsVisible ? (
                  <Documentation onBack={handleCloseDocumentation} />
                ) : isAboutVisible ? (
                  <About onBack={handleCloseAbout} />
                ) : isCreating ? (
                  <CreateApiForm onCreate={handleCreateCollection} onCancel={handleCancelCreate} />
                ) : (
                  <MainContent
                    collection={selectedCollection}
                    collectionsLoading={collectionsLoading}
                    collectionsError={collectionsError}
                    onToggleEnabled={handleToggleEnabled}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        <Footer onAboutClick={handleAboutClick} onDocumentationClick={handleDocumentationClick} />
      </Box>
    </ThemeProvider>
  )
}
