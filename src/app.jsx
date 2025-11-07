import { useEffect, useMemo, useState } from 'preact/hooks'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import theme from './theme'
import { getApiCollections } from './services/apiCollections'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import Footer from './components/Footer'

const drawerWidth = 280

export function App() {
  const collections = useMemo(() => getApiCollections(), [])
  const [selectedCollectionId, setSelectedCollectionId] = useState(
    collections[0]?.id || collections[0]?.key || ''
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const isDesktop = useMediaQuery('(min-width:600px)')

  const selectedCollection = useMemo(() => {
    if (!collections.length) return null
    if (!selectedCollectionId) return collections[0]

    return (
      collections.find(
        (collection) =>
          collection.id === selectedCollectionId || collection.key === selectedCollectionId
      ) || collections[0]
    )
  }, [collections, selectedCollectionId])

  const handleSelectCollection = (collectionId) => {
    setSelectedCollectionId(collectionId)
    setIsSidebarOpen(false)
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
        <Header onMenuClick={handleMenuToggle} sidebarVisible={isSidebarVisible} />
        <Box sx={{ display: 'flex', flexGrow: 1, width: '100%' }}>
          <Sidebar
            drawerWidth={drawerWidth}
            collections={collections}
            selectedId={selectedCollection?.id || selectedCollection?.key || ''}
            mobileOpen={isSidebarOpen}
            onClose={handleSidebarClose}
            onSelect={handleSelectCollection}
            collapsed={isDesktop && isSidebarCollapsed}
            onToggle={handleMenuToggle}
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
            <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: '100%' }}>
              <MainContent collection={selectedCollection} />
            </Box>
          </Box>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  )
}
