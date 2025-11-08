import { useEffect, useRef } from 'preact/hooks'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Stack from '@mui/material/Stack'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

function Header({ onMenuClick, sidebarVisible, colorMode = 'dark', onToggleTheme }) {
  const toolbarRef = useRef(null)

  useEffect(() => {
    const element = toolbarRef.current
    if (!element || typeof window === 'undefined' || typeof document === 'undefined') return undefined

    const setHeightVariable = () => {
      const height = element.offsetHeight || 0
      document.documentElement.style.setProperty('--app-shell-header-height', `${height}px`)
    }

    setHeightVariable()

    let observer
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        setHeightVariable()
      })
      observer.observe(element)
    } else {
      window.addEventListener('resize', setHeightVariable)
    }

    return () => {
      document.documentElement.style.removeProperty('--app-shell-header-height')
      if (observer) {
        observer.disconnect()
      } else {
        window.removeEventListener('resize', setHeightVariable)
      }
    }
  }, [])

  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundImage: 'linear-gradient(90deg, rgba(100,181,246,1) 0%, rgba(63,81,181,1) 100%)',
      }}
    >
      <Toolbar
        ref={toolbarRef}
        sx={{
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: { xs: 'flex-start', sm: 'center' },
          rowGap: { xs: 1, sm: 0 },
          minHeight: { xs: 68, sm: 72 },
          py: { xs: 1, sm: 1 },
          position: 'relative',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ minWidth: 0, flexWrap: 'wrap', rowGap: 1 }}
        >
          <IconButton
            color="inherit"
            aria-label={sidebarVisible ? 'Close navigation' : 'Open navigation'}
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            {sidebarVisible ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 600, whiteSpace: { xs: 'normal', sm: 'nowrap' } }}
            >
              API ConsoleX
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Manage and explore your API collections with ease
            </Typography>
          </Box>
        </Stack>
        <Box
          sx={{
            position: { xs: 'absolute', sm: 'static' },
            top: { xs: 8, sm: 'auto' },
            right: { xs: 8, sm: 'auto' },
            ml: { xs: 0, sm: 'auto' },
            alignSelf: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Tooltip title={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton
              color="inherit"
              onClick={onToggleTheme}
              aria-label="Toggle color mode"
              sx={{
                alignSelf: 'flex-start',
              }}
            >
              {colorMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
