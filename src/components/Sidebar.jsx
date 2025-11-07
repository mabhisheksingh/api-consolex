import ApiIcon from '@mui/icons-material/Api'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import MenuIcon from '@mui/icons-material/Menu'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

function Sidebar({
  drawerWidth,
  collections,
  selectedId,
  mobileOpen,
  onClose,
  onSelect,
  collapsed = false,
  onToggle,
}) {
  const desktopWidth = collapsed ? 72 : drawerWidth

  const content = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            API Collections
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {collections.length} available
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={collapsed ? onToggle : onClose}
          sx={{ display: 'inline-flex' }}
          aria-label={collapsed ? 'Open navigation' : 'Close navigation'}
        >
          {collapsed ? <MenuIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Box sx={{ px: 3, py: 2, display: { xs: 'none', sm: 'block' } }}>
        <Typography variant="h6" gutterBottom>
          Collections
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {collections.length} available
        </Typography>
      </Box>
      <Divider sx={{ display: { xs: 'none', sm: 'block' } }} />
      <List sx={{ flexGrow: 1, overflowY: 'auto', py: 0 }}>
        {collections.map((collection) => {
          const identifier = collection.id || collection.key
          const isSelected = identifier === selectedId
          const Icon = collection.isEnabled ? CheckCircleIcon : HighlightOffIcon
          return (
            <ListItem key={identifier} disablePadding>
              <ListItemButton
                selected={isSelected}
                onClick={() => onSelect(identifier)}
                sx={{ alignItems: 'flex-start', py: 1.5 }}
              >
                <ListItemIcon sx={{ mt: 0.5 }}>
                  {collection.isEnabled ? (
                    <Icon color="success" />
                  ) : (
                    <Icon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {collection.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {collection.description || 'No description provided'}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Divider />
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ApiIcon color="primary" />
        <Typography variant="body2" color="text.secondary">
          API ConsoleX v1.0
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: desktopWidth },
        flexShrink: { sm: 0 },
        display: 'flex',
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shortest,
          }),
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': (theme) => {
            const toolbarHeight = theme.mixins.toolbar?.minHeight ?? 64
            return {
              boxSizing: 'border-box',
              width: drawerWidth,
              top: toolbarHeight,
              height: `calc(100% - ${toolbarHeight}px)`,
            }
          },
        }}
      >
        {content}
      </Drawer>
      {collapsed ? (
        <Paper
          elevation={0}
          square
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            width: desktopWidth,
            height: '100%',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              color="primary"
              onClick={onToggle}
              aria-label="Open navigation"
              size="large"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          square
          sx={{
            display: { xs: 'none', sm: 'flex' },
            width: desktopWidth,
            height: '100%',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          {content}
        </Paper>
      )}
    </Box>
  )
}

export default Sidebar
