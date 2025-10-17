'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    // Check if dark mode is preferred
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    setIsDark(prefersDark)

    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)

    if (newTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={toggleTheme}
      className='h-9 w-9 p-0'
    >
      {isDark ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
      <span className='sr-only'>Toggle theme</span>
    </Button>
  )
}
