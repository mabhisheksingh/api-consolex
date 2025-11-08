import AddIcon from '@mui/icons-material/Add'
import ApiIcon from '@mui/icons-material/Api'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import FilterListIcon from '@mui/icons-material/FilterList'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
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
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'

function Sidebar({
  drawerWidth,
  collections,
  totalCount = 0,
  selectedId,
  mobileOpen,
  onClose,
  onSelect,
  collapsed = false,
  onToggle,
  onCreateClick,
  filterStatus = 'all',
  onFilterChange,
  onDelete,
}) {
  const desktopWidth = collapsed ? 72 : drawerWidth

  const handleFilterSelect = (event) => {
    onFilterChange?.(event.target.value)
  }

  const cycleFilter = () => {
    const order = ['all', 'enabled', 'disabled']
    const currentIndex = order.indexOf(filterStatus)
    const next = order[(currentIndex + 1) % order.length]
    onFilterChange?.(next)
  }

  const content = (
    <Box
      component="aside"
      aria-label="API collections navigation"
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
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            API Collections
          </Typography>
          <IconButton
            size="small"
            onClick={collapsed ? onToggle : onClose}
            aria-label={collapsed ? 'Open navigation' : 'Close navigation'}
            sx={{ display: 'inline-flex' }}
          >
            {collapsed ? <MenuIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
          </IconButton>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 160 }, flexGrow: 1 }}>
              <InputLabel id="filter-status-label">Filter</InputLabel>
              <Select
                labelId="filter-status-label"
                value={filterStatus}
                label="Filter"
                onChange={handleFilterSelect}
              >
                <MenuItem value="all">All APIs</MenuItem>
                <MenuItem value="enabled">Enabled</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
            <IconButton
              size="small"
              onClick={onCreateClick}
              sx={{ display: 'inline-flex' }}
              aria-label="Create new API"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {collections.length} shown · {totalCount} total
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, overflowY: 'auto', py: 0 }} component="nav" aria-label="API collection list">
        {collections.map((collection) => {
          const identifier = collection.id || collection.key
          const isSelected = identifier === selectedId
          const Icon = collection.isEnabled ? CheckCircleIcon : HighlightOffIcon
          return (
            <ListItem key={identifier} disablePadding secondaryAction={
              onDelete ? (
                <Tooltip title="Delete API" placement="left">
                  <IconButton
                    edge="end"
                    aria-label="Delete API"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDelete(identifier)
                    }}
                    size="small"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null
            }>
              <ListItemButton
                selected={isSelected}
                onClick={() => onSelect(identifier)}
                sx={{ alignItems: 'flex-start', py: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
                aria-current={isSelected ? 'true' : undefined}
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                      {collection.name}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
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
              top: `var(--app-shell-header-height, ${toolbarHeight}px)`,
              height: `calc(100% - var(--app-shell-header-height, ${toolbarHeight}px))`,
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
            <Tooltip title={`Filter: ${filterStatus}`}>
              <IconButton
                color="primary"
                onClick={cycleFilter}
                aria-label="Cycle filter"
                size="large"
                sx={{ mb: 1 }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              color="primary"
              onClick={onCreateClick}
              aria-label="Create new API"
              size="large"
              sx={{ mb: 1 }}
            >
              <AddIcon />
            </IconButton>
          </Box>
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
