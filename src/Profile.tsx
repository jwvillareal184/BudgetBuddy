import { Container, Form, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { supabase } from './supabaseClient';

export default function Profile() {
    const { user } = useUser();
    console.log("Current User:", user?.email, "User ID:", user?.id);

    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        contact: '',
        birthDate: '',
        location: '',
        occupation: ''
    });

    // Fetch user details from Supabase
    const fetchUser = async () => {
        if (!user?.id) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user?.id)
            .single(); // Fetch single record

        if (error) {
            console.error('Error fetching user:', error.message);
        } else if (data) {
            console.log("Fetched User Data:", data);
            setUserData({
                name: data.name || '',
                email: data.email || '',
                contact: data.contact || '',
                birthDate: data.birthDate || '',
                location: data.location || '',
                occupation: data.occupation || ''
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, [user]);

    // Handles input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
    };
    

    // Handles profile update
    const handleEditProfile = async () => {
        if (!user?.id) {
            console.error("No user ID found.");
            return;
        }

        try {
            console.log("Updating Profile with Data:", userData);

            const { error } = await supabase
                .from('users')
                .update({
                    email: userData.email,
                    occupation: userData.occupation,
                    birthDate: userData.birthDate,
                    contact: userData.contact,
                    location: userData.location
                })
                .eq('id', user?.id);

            if (error) {
                console.error('Error updating profile:', error.message);
                return;
            }

            alert('Profile updated successfully!');
            fetchUser(); // Refresh the data after updating
        } catch (error) {
            console.error('Unexpected error updating profile:', error);
        }
    };


    

    return (
        <Container className='mt-3'>
            <h1 className='custom-font-family-fredoka fw-semibold custom-color-font4 fs-1'>Profile</h1>
            <Form className='shadow-sm px-3 pt-4 pb-3'>
                <Form.Group controlId="formName">
                    <Form.Label className='custom-color-font5 fw-semibold fs-6 mt-2 custom-font-family'>Name</Form.Label>
                    <Form.Control disabled value={userData.name} type='text' />
                </Form.Group>
                <Form.Group controlId="formEmail">
                    <Form.Label className='custom-color-font5 fw-semibold fs-6 mt-2 custom-font-family'>Email Address</Form.Label>
                    <Form.Control 
                        type='email' 
                        name="email"
                        value={userData.email} 
                        onChange={handleChange} 
                    />
                </Form.Group>
                <Form.Group controlId="formContact">
                    <Form.Label className='custom-color-font5 fw-semibold fs-6 mt-2 custom-font-family'>Contact Number</Form.Label>
                    <Form.Control 
                        type='text' 
                        name="contact"
                        value={userData.contact} 
                        onChange={handleChange} 
                    />
                </Form.Group>
                <Form.Group controlId="formBirthDate">
                    <Form.Label className='custom-color-font5 fw-semibold fs-6 mt-2 custom-font-family'>Birth Date</Form.Label>
                    <Form.Control 
                        type='date' 
                        name="birthDate"
                        value={userData.birthDate} 
                        onChange={handleChange} 
                    />
                </Form.Group>
                <Form.Group controlId="formLocation">
                    <Form.Label className='custom-color-font5 fw-semibold fs-6 mt-2 custom-font-family'>Location</Form.Label>
                    <Form.Control 
                        type='text' 
                        name="location"
                        value={userData.location} 
                        onChange={handleChange} 
                    />
                </Form.Group>
                <Form.Group controlId="formOccupation">
                    <Form.Label className='custom-color-font5 fw-semibold fs-6 mt-2 custom-font-family'>Occupation</Form.Label>
                    <Form.Control 
                        type='text' 
                        name="occupation"
                        value={userData.occupation} 
                        onChange={handleChange} 
                    />
                </Form.Group>
                <Button className='mt-2 custom-font-family-fredoka text-white custom-bg-color5' onClick={handleEditProfile}>
                    Save
                </Button>
            </Form>
        </Container>
    );
}
