import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '@/App'

describe('App shell', () => {
  it('renders the mount point', () => {
    render(<App />)
    expect(screen.getByTestId('app-shell')).toBeInTheDocument()
  })
})
