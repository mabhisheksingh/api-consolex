import { useMemo } from 'preact/hooks'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import DescriptionIcon from '@mui/icons-material/Description'
import HomeIcon from '@mui/icons-material/Home'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

import readmeContent from '../../README.md?raw'

marked.setOptions({
  breaks: true,
  headerIds: false,
  mangle: false,
})

function Documentation({ onBack }) {
  const parsedHtml = useMemo(() => {
    const rendered = marked.parse(readmeContent || '')
    return DOMPurify.sanitize(rendered)
  }, [])

  return (
    <Card component="article" aria-label="Project documentation" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Documentation
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box
          className="markdown-body"
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            p: { xs: 2, md: 3 },
            maxHeight: { xs: '60vh', md: '70vh' },
            overflow: 'auto',
            bgcolor: 'background.default',
          }}
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        <Button startIcon={<HomeIcon />} onClick={onBack} variant="outlined">
          Back to Console
        </Button>
      </CardActions>
    </Card>
  )
}

export default Documentation
