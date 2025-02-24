import { Container, Form, Button } from 'react-bootstrap';
import { useState } from 'react';
import { useUser } from './UserContext';
import { supabase } from './supabaseClient';

export default function ChangePassword() {
    const { user } = useUser();
    console.log(user?.email);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'newPassword') setNewPassword(value);
        if (name === 'confirmPassword') setConfirmPassword(value);
    };

    const handleEditPassword = async () => {
        if (!user?.id) {
            console.error("No user ID found.");
            return;
        }

        try {
            console.log("Updating Password with Data:", newPassword);

            const { error } = await supabase
                .from('users')
                .update({
                    password: newPassword
                })
                .eq('id', user?.id);

            if (error) {
                console.error('Error updating Password:', error.message);
                return;
            }

            alert('Password updated successfully!');
           
        } catch (error) {
            console.error('Unexpected error updating Password:', error);
        }
    };

    return (
        <Container className='mt-3'>
            <h1 className='custom-font-family-fredoka fw-semibold custom-color-font4 fs-1'>Change Password</h1>
            <Form className='shadow-sm px-3 pt-4 pb-3'>
                <Form.Group controlId="newPassword">
                    <Form.Label className='custom-color-font5 fw-semibold fs-6 mt-2 custom-font-family'>New Password</Form.Label>
                    <Form.Control 
                        type='password' 
                        name='newPassword'
                        value={newPassword}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Form.Group controlId="confirmPassword">
                    <Form.Label className='custom-color-font5 fw-semibold fs-6 mt-2 custom-font-family'>Re-Enter New Password</Form.Label>
                    <Form.Control 
                        type='password' 
                        name='confirmPassword'
                        value={confirmPassword}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Button 
                    className='mt-2 custom-font-family-fredoka text-white custom-bg-color5'
                    onClick={handleEditPassword}
                >
                    Save
                </Button>
            </Form>
        </Container>
    );
}
