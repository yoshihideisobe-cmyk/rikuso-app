import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'onboarding@resend.dev'; // Default to test email if not set

export async function sendAdminNotification(subject: string, content: string) {
    if (!resend) {
        console.warn('RESEND_API_KEY is not set. Skipping email notification.');
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Use a verified domain in production
            to: ADMIN_EMAIL,
            subject: subject,
            text: content,
        });

        if (error) {
            console.error('Failed to send email:', error);
        } else {
            console.log('Email sent successfully:', data?.id);
        }
    } catch (e) {
        console.error('Unexpected error sending email:', e);
    }
}
