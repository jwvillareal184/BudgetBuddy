
import React, { useState } from 'react';
import { useUser } from './UserContext';
import { useNavigate, Link } from 'react-router-dom';

import { Container, Form, Image, Button } from 'react-bootstrap';
import './App.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useUser();
  const { user} = useUser();
    console.log(user?.email);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (login(email, password)) {
        // Login successful; redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(true);
    }
  };

  const handleSignUp = () => {
    navigate('/signup')
  }

  const handleForgotPass = () => {
    navigate('/request-new-password')
  }
  return (
    <Container fluid className='background d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
      <Container 
        className='bg-white rounded d-flex flex-column align-items-center p-4'
        style={{
          minHeight: '80vh', 
          maxWidth: '400px',
          width: '100%',  
          background: "linear-gradient(to bottom, #1F2544, #474F7A, #FFD0EC)",
          overflowY: 'auto',
        }}
      >
        <Container fluid className='text-center mb-4'>
          <Image src='BudgetBuddyLogo 1.png' fluid style={{ width: '150px' }} />
          <h1 className='fw-bold custom-font-color1 custom-font-family mt-3'>Login</h1>
        </Container>

   
        <Container className='flex-grow-1 w-100 mt-4'>
          <Form.Group className="mb-3 px-3">
            <Form.Control
              type="text"
              placeholder="Email"
              value={email} onChange={(e) => setEmail(e.target.value)} required
              className='rounded-pill p-2 fs-6 w-100 custom-font-family custom-form-input'
            />
          </Form.Group>

          <Form.Group className="mb-3 px-3">
            <Form.Control
              type="password"
              placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)} required
              className='rounded-pill p-2 fs-6 w-100 custom-font-family custom-form-input'
            />
          </Form.Group>
        </Container>

      
      

        <Container fluid className='w-100 px-3'>
          <Button onClick={handleForgotPass} className='bg-transparent custom-font-color1 border-transparent w-100 p-2 fs-6 custom-font-family fw-semibold' 
            style={{ backgroundColor: "transparent", borderColor: "transparent", boxShadow: "none" }}>
            Forgot Password
          </Button>

          <Button onClick={handleSubmit} className='btn w-100 custom-bg-color1 rounded-pill p-2 fs-5 mb-2 custom-font-family fw-bold custom-button1'>
            Login
          </Button>

          <Button onClick={handleSignUp} className='btn w-100 rounded-pill p-2 fs-5 custom-font-family fw-bold custom-button2'>
            Sign Up
          </Button>
        </Container>
      </Container>
    </Container>
  );
}
