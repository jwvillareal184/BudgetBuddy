import { Container, Form, Row, Col, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from './supabaseClient';
import BudgetBuddyLogo from "./assets/BudgetBuddyLogo 1.png";

export default function SignUp() {
    const navigate = useNavigate();
    const handleBack = () => navigate('/');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        birthDate: '',
        occupation: '',
        password: '',
        location: 'N/A'
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
    
        const { email, password, name, contact, birthDate, occupation, location } = formData;
    
        try {
            // Supabase Sign-Up
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
    
            if (error) {
                setErrorMessage(error.message);
                return;
            }
    
            if (data.user) {
                // Insert additional user info into the "users" table
                const { error: insertError } = await supabase.from('users').insert([
                    {
                        id: data.user.id,
                        name,
                        email,
                        contact,
                        birthDate: new Date(birthDate).toISOString().split('T')[0],
                        occupation,
                        location,
                        created_at: new Date().toISOString(),
                        password,
                    },
                ]);
    
                if (insertError) {
                    setErrorMessage('Failed to save user details: ' + insertError.message);
                    return;
                }
    
                setSuccessMessage('Sign-up successful! Please check your email to verify your account.');
                setFormData({
                    name: '',
                    email: '',
                    contact: '',
                    birthDate: '',
                    occupation: '',
                    password: '',
                    location: 'N/A',
                });
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMessage('An unexpected error occurred: ' + err.message);
            } else {
                setErrorMessage('An unexpected error occurred.');
            }
        }
    };

    return (
        <Container fluid className='background d-flex justify-content-center align-items-center'>
            <Container fluid className='rounded shadow-sm' style={{ height: '75vh', width: '30vw', background: "linear-gradient(to bottom, #1F2544, #474F7A, #FFD0EC)", minWidth: '400px' }}>
                <Container fluid className='mb-3 mt-5'>
                    <Container className='d-flex justify-content-center align-items-center mt-4'>
                        <Image src={BudgetBuddyLogo} fluid style={{ width: '180px' }} />
                    </Container>
                    <h1 className='fw-bold custom-font-color1 text-center mt-2 custom-font-family'>Sign Up</h1>
                </Container>

                <Form className='px-3 pt-4 pb-3' onSubmit={handleSignUp}>
                    <Container fluid>
                        <Row>
                            <Col>
                                <Form.Group controlId="formName">
                                    <Form.Control className='rounded-pill custom-color-font4 custom-font-family fw-regular mt-2 pt-2' name="name" placeholder='Name' type='text' value={formData.name} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group controlId="formEmail">
                                    <Form.Control className='rounded-pill custom-color-font4 custom-font-family fw-regular mt-2 pt-2' name="email" placeholder='Email' type='email' value={formData.email} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group controlId="formContact">
                                    <Form.Control className='rounded-pill custom-color-font4 custom-font-family fw-regular mt-2 pt-2' name="contact" placeholder='Contact Number' type='text' value={formData.contact} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="formBirthDate">
                                    <Form.Control className='rounded-pill custom-color-font4 custom-font-family fw-regular mt-2 pt-2' name="birthDate" placeholder='Birth Date' type='date' value={formData.birthDate} onChange={handleChange} required />
                                </Form.Group>
                                <Form.Group controlId="formOccupation">
                                    <Form.Control className='rounded-pill custom-color-font4 custom-font-family fw-regular mt-2 pt-2' name="occupation" placeholder='Occupation' type='text' value={formData.occupation} onChange={handleChange} />
                                </Form.Group>
                                <Form.Group controlId="formPassword">
                                    <Form.Control className='rounded-pill custom-color-font4 custom-font-family fw-regular mt-2 pt-2' name="password" placeholder='Password' type='password' value={formData.password} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Container>

                    {errorMessage && <p className="text-danger text-center mt-2">{errorMessage}</p>}
                    {successMessage && <p className="text-success text-center mt-2">{successMessage}</p>}

                    <Container fluid className='mt-3'>
                        <button type="submit" className='mt-2 custom-font-family-fredoka text-white custom-bg-color5 w-100 rounded-pill p-2'>Save</button>
                        <button className='mt-2 custom-font-family-fredoka text-white custom-bg-color5 w-100 rounded-pill p-2' onClick={handleBack}>Back</button>
                    </Container>
                </Form>
            </Container>
        </Container>
    );
}
