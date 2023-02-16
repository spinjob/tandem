import React from 'react'
import { render, screen } from '@testing-library/react'
import RegistrationForm from '../src/components/RegistrationForm'
import '@testing-library/jest-dom'


describe('Index', () => {
  it('renders a heading', () => {
    render(<RegistrationForm />)

    // const heading = screen.getByRole('heading', {
    //   title: /Login Page\.js!/i,
    // })

    // expect(heading).toBeInTheDocument()
  })
})
