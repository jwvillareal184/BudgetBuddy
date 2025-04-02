import express from 'express';
import resend from 'resend';

const app = express();
app.use(express.json());

app.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;

    const transporter = resend.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-app-password',
        },
    });

    try {
        await transporter.sendMail({ from: 'your-email@gmail.com', to, subject, text });
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));
