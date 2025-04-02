import { useState } from 'react';
import { Container, Form, Image, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import BudgetBuddyLogo from "./assets/BudgetBuddyLogo 1.png";

export default function RequestNewPassword() {
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

    const handleBack = (): void => {
        navigate('/');
    };

    const handlePasswordReset = async (): Promise<void> => {
        if (!email) {
            setMessage('Please enter your email.');
            return;
        }

        // Use Supabase Auth to send a password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "http://localhost:5173/reset-password" // Change to your actual frontend URL
        });

        if (error) {
            setMessage('Failed to send password reset email.');
            console.error(error);
        } else {
            setMessage('Password reset link sent to your email.');
        }
    };

    return (
        <Container fluid className='background d-flex justify-content-center align-items-center'>
            {/* Main container with responsive width */}
            <Container 
                className='bg-white rounded d-block'
                style={{
                    background: "linear-gradient(to bottom, #1F2544, #474F7A, #FFD0EC)",
                    minWidth: '350px',
                    maxWidth: '500px', // Make sure it doesn't stretch too wide
                    padding: '20px', // Ensure padding is applied for small screens
                }}
            >
                {/* Logo and title section */}
                <Container fluid className='mb-3 mt-4'>
                    <Container className='d-flex justify-content-center align-items-center'>
                        <Image src={BudgetBuddyLogo} fluid style={{ width: '180px' }} />
                    </Container>
                    <h1 className='fw-bold custom-font-color1 text-center mt-2 custom-font-family'>
                        Request New Password
                    </h1>
                </Container>

                {/* Email input */}
                <Container className='d-block mt-4'>
                    <Container fluid className='mb-2 px-3'>
                        <Form.Group>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                className='rounded-pill p-2 fs-5 w-100 custom-font-family'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>
                    </Container>
                </Container>

                {/* Message and buttons */}
                <Container fluid className='d-block mt-2'>
                    {message && <p className="text-center">{message}</p>}
                    <Button
                        className='btn w-100 custom-bg-color1 rounded-pill p-2 fs-5 mb-2 custom-font-family fw-bold'
                        onClick={handlePasswordReset}
                    >
                        Send
                    </Button>

                    <Button
                        onClick={handleBack}
                        className='btn w-100 custom-bg-color2 rounded-pill p-2 fs-5 custom-font-family fw-bold'
                    >
                        Back
                    </Button>
                </Container>
            </Container>
        </Container>
    );
}
