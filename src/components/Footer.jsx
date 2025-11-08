import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

function Footer({ onAboutClick, onDocumentationClick }) {
  const navLinkStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    px: 0,
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.2,
  }

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Divider sx={{ mb: 2 }} aria-hidden />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 1 },
        }}
      >
        <Typography component="p" variant="body2" color="text.secondary">
          © {new Date().getFullYear()} API ConsoleX. All rights reserved.
        </Typography>
        <Box
          component="nav"
          aria-label="Footer navigation"
          sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}
        >
          <Link
            component="button"
            type="button"
            onClick={onDocumentationClick}
            color="inherit"
            underline="hover"
            variant="body2"
            sx={{
              ...navLinkStyles,
              background: 'none',
              border: 0,
              cursor: 'pointer',
            }}
          >
            Documentation
          </Link>
          <Link
            component="button"
            type="button"
            onClick={onAboutClick}
            color="inherit"
            underline="hover"
            variant="body2"
            sx={{
              ...navLinkStyles,
              background: 'none',
              border: 0,
              cursor: 'pointer',
            }}
          >
            About
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
