import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

export default function ResetPassword() {
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

    const handleResetPassword = async (): Promise<void> => {
        if (!password) {
            setMessage('Please enter a new password.');
            return;
        }

        // Hash the password before storing it
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Update the password in the users table (Assuming user email is stored in session)
        const { data: { user }, error: sessionError } = await supabase.auth.getUser();

        if (sessionError || !user) {
            setMessage('User session not found.');
            console.error(sessionError);
            return;
        }

        const { error } = await supabase
            .from('users')
            .update({ password: hashedPassword }) // Ensure the table has a 'password' column
            .eq('id', user.id); // Match by authenticated user ID

        if (error) {
            setMessage('Failed to reset password.');
            console.error(error);
        } else {
            setMessage('Password updated successfully. Redirecting to login...');
            setTimeout(() => navigate('/'), 3000); // Redirect after 3 seconds
        }
    };

    return (
        <div className="reset-password-container">
            <h1>Reset Your Password</h1>
            <input 
                type="password" 
                placeholder="Enter new password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button onClick={handleResetPassword}>Reset Password</button>
            {message && <p>{message}</p>}
        </div>
    );
}
