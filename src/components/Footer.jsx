import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        px: { xs: 2, md: 4 },
        pb: { xs: 2, md: 3 },
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Divider sx={{ mb: 2 }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} API ConsoleX. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href="#" color="inherit" underline="hover" variant="body2">
            Documentation
          </Link>
          <Link href="#" color="inherit" underline="hover" variant="body2">
            Support
          </Link>
          <Link href="#" color="inherit" underline="hover" variant="body2">
            Release Notes
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
