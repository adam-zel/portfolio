import { useEffect } from 'react'
import { bind } from 'cuelume'
import { PortfolioPage } from '@/components/portfolio/PortfolioPage'

function App() {
  useEffect(() => {
    bind()
  }, [])

  return (
    <div data-testid="app-shell" className="min-h-svh">
      <PortfolioPage />
    </div>
  )
}

export default App
