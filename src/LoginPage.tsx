import React, { useState } from 'react';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Image, Button } from 'react-bootstrap';
import BudgetBuddyLogo from "./assets/BudgetBuddyLogo 1.png"
import './App.css';

const LoginPage: React.FC = () => {
  // Define state variables with proper types
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  // Extract functions from `useUser` hook
  const { login, user } = useUser();
  const navigate = useNavigate();

  console.log(user?.email); // Debugging output

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const success = await login(email, password); // Assuming `login` returns a Promise<boolean>
      if (success) {
        navigate('/dashboard'); // Redirect on successful login
      } else {
        setError(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(true);
    }
  };

  // Navigation handlers
  const handleSignUp = () => navigate('/signup');
  const handleForgotPass = () => navigate('/request-new-password');

  return (
    <Container fluid className="background d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Container
        className="bg-white rounded d-flex flex-column align-items-center p-4"
        style={{
          minHeight: '80vh',
          maxWidth: '400px',
          width: '100%',
          background: 'linear-gradient(to bottom, #1F2544, #474F7A, #FFD0EC)',
          overflowY: 'auto',
        }}
      >
        {/* Logo and Heading */}
        <Container fluid className="text-center mb-4">
          <Image src={BudgetBuddyLogo} fluid style={{ width: '150px' }} />
          <h1 className="fw-bold custom-font-color1 custom-font-family mt-3">Login</h1>
        </Container>

        {/* Login Form */}
        <Form onSubmit={handleSubmit} className="w-100">
          <Form.Group className="mb-3 px-3">
            <Form.Control
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="rounded-pill p-2 fs-6 w-100 custom-font-family custom-form-input"
            />
          </Form.Group>

          <Form.Group className="mb-3 px-3">
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="rounded-pill p-2 fs-6 w-100 custom-font-family custom-form-input"
            />
          </Form.Group>

          {/* Error Message */}
          {error && <p className="text-danger text-center">Invalid email or password</p>}

          {/* Action Buttons */}
          <Container fluid className="w-100 px-3">
            <Button
              type="button"
              onClick={handleForgotPass}
              className="bg-transparent custom-font-color1 border-transparent w-100 p-2 fs-6 custom-font-family fw-semibold"
              style={{ backgroundColor: 'transparent', borderColor: 'transparent', boxShadow: 'none' }}
            >
              Forgot Password
            </Button>

            <Button
              type="submit"
              className="btn w-100 custom-bg-color1 rounded-pill p-2 fs-5 mb-2 custom-font-family fw-bold custom-button1"
            >
              Login
            </Button>

            <Button
              type="button"
              onClick={handleSignUp}
              className="btn w-100 rounded-pill p-2 fs-5 custom-font-family fw-bold custom-button2"
            >
              Sign Up
            </Button>
          </Container>
        </Form>
      </Container>
    </Container>
  );
};

export default LoginPage;
