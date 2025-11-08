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
        sx={{
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: { xs: 'flex-start', sm: 'center' },
          rowGap: { xs: 1.5, sm: 0 },
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
        <Tooltip title={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}>
          <IconButton color="inherit" onClick={onToggleTheme} aria-label="Toggle color mode">
            {colorMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}

export default Header
