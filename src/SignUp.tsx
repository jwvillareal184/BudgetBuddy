import { Container, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { useState } from 'react';
import { supabase } from './supabaseClient'; // Ensure this is the correct Supabase client import
//import bcrypt from 'bcryptjs';

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        birthDate: '',
        occupation: '',
        password: '',
        created_at: '',
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Handle input changes
    const handleChange = ( e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const handleSignUp = async () => {
        //e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const { email, password, name, contact, birthDate, occupation } = formData;

        // Supabase Sign-Up
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            setErrorMessage(error.message);
            return;
        }

        if (data.user) {
            // Insert additional user info into a "users" table in Supabase
            const { error: insertError } = await supabase.from('users').insert([
                {
                    id: data.user.id, // Store the same ID as the authentication user
                    name,
                    email,
                    contact,
                    birthDate,
                    occupation, 
                    password,
                    created_at: data.user.created_at
                    
                }
            ]);

            if (insertError) {
                setErrorMessage('Failed to save user details.');
                return;
            }

            setSuccessMessage('Sign-up successful! Please check your email to verify your account.');
        }
    }
    
    return (
        <Container fluid className='background d-flex justify-content-center align-items-center'>
            <Container fluid className='rounded shadow-sm' style={{ height: '75vh', width: '30vw', background: "linear-gradient(to bottom, #1F2544, #474F7A, #FFD0EC)", minWidth: '400px' }}>
                <Container fluid className='mb-3 mt-5'>
                    <Container className='d-flex justify-content-center align-items-center mt-4'>
                        <Image src='BudgetBuddyLogo 1.png' fluid style={{ width: '180px' }} />
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
                        <Button type="submit" className='mt-2 custom-font-family-fredoka text-white custom-bg-color5 w-100 rounded-pill p-2'>Save</Button>
                        <Button className='mt-2 custom-font-family-fredoka text-white custom-bg-color5 w-100 rounded-pill p-2'>Back</Button>
                    </Container>
                </Form>
            </Container>
        </Container>
    );
}