import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

function Header({ onMenuClick, sidebarVisible }) {
  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundImage: 'linear-gradient(90deg, rgba(100,181,246,1) 0%, rgba(63,81,181,1) 100%)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label={sidebarVisible ? 'Close navigation' : 'Open navigation'}
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { xs: 'flex', sm: 'none' } }}
        >
          {sidebarVisible ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            API ConsoleX
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Manage and explore your API collections with ease
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
