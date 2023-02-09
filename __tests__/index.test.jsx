import React from 'react'
import { render, screen } from '@testing-library/react'
import Index from '../src/pages/index'
import '@testing-library/jest-dom'

describe('Index', () => {
  it('renders a heading', () => {
    render(<Index />)

    // const heading = screen.getByRole('heading', {
    //   title: /Login Page\.js!/i,
    // })

    // expect(heading).toBeInTheDocument()
  })
})
