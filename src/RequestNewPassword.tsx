import { useState } from 'react';
import { Container, Form, Image, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
//import { Resend } from 'resend';
import { supabase } from './supabaseClient';

export default function RequestNewPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/')
    }

    const generateRandomPassword = (length = 12) => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        return Array.from(crypto.getRandomValues(new Uint8Array(length)))
            .map(x => charset[x % charset.length])
            .join('');
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setMessage('Please enter your email.');
            return;
        }

        // Step 1: Check if the user exists
        const { data: users, error: fetchError } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', email);

        if (fetchError || !users.length) {
            setMessage('Email not found.');
            console.error(fetchError);
            return;
        }

        // Step 2: Generate new password
        const newPassword = generateRandomPassword();

        // Step 3: Update the user's password
        const { error: updateError } = await supabase.auth.admin.updateUserById(users[0].id, {
            password: newPassword
        });

        if (updateError) {
            setMessage('Failed to reset password.');
            console.error(updateError);
            return;
        }

        // Step 4: Send email with the new password
 /*       const resend = new Resend('jean');

        try {
            await resend.emails.send({
                from: 'support@yourdomain.com',
                to: email,
                subject: 'Your New Password',
                html: `<p>Your new password is: <strong>${newPassword}</strong></p><p>Please change it after logging in.</p>`
            });

            setMessage('New password sent to your email.');
        } catch (emailError) {
            setMessage('Failed to send email.');
            console.error(emailError);
        }*/
    };

    return (
        <Container fluid className='background d-flex justify-content-center align-items-center'>
            <Container className='bg-white rounded d-block' style={{ height: '75vh', width: '30vw', background: "linear-gradient(to bottom, #1F2544, #474F7A, #FFD0EC)", minWidth: '400px' }}>
                <Container fluid className='mb-3 mt-5'>
                    <Container className='d-flex justify-content-center align-items-center mt-4'>
                        <Image src='BudgetBuddyLogo 1.png' fluid style={{ width: '180px' }} />
                    </Container>
                    <h1 className='fw-bold custom-font-color1 text-center mt-2 custom-font-family'>Request New Password</h1>
                </Container>

                <Container className='d-block mt-5'>
                    <Container fluid className='mb-2 px-5'>
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

                <Container fluid className='d-block mt-2 px-5'>
                    {message && <p className="text-center">{message}</p>}
                    <Button className='btn w-100 custom-bg-color1 rounded-pill p-2 fs-5 mb-2 custom-font-family fw-bold' onClick={handlePasswordReset}>
                        Send
                    </Button>

                    <Button  onClick={handleBack} className='btn w-100 custom-bg-color2 rounded-pill p-2 fs-5 custom-font-family fw-bold'>
                        Back
                    </Button>
                </Container>
            </Container>
        </Container>
    );
}
