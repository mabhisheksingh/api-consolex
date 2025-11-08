import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import HomeIcon from '@mui/icons-material/Home'

function About({ onBack }) {
  return (
    <Card component="section" aria-label="About the developer" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={3} alignItems="center">
          <Avatar
            alt="Abhishek Singh"
            sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: '2.25rem' }}
          >
            AS
          </Avatar>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Abhishek Singh
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Creator of API ConsoleX · Full-stack Developer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
              Passionate about building intuitive developer tooling, API experiences, and modern
              web applications that scale across platforms.
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<GitHubIcon />}
              component={Link}
              href="https://github.com/mabhisheksingh/"
              target="_blank"
              rel="noopener"
            >
              View GitHub Repo
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<LinkedInIcon />}
              component={Link}
              href="https://www.linkedin.com/in/abhisheksingh214/"
              target="_blank"
              rel="noopener"
            >
              Connect on LinkedIn
            </Button>
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center' }}>
        <Button startIcon={<HomeIcon />} onClick={onBack} variant="text">
          Back to Console
        </Button>
      </CardActions>
    </Card>
  )
}

export default About
