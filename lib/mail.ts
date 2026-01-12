import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'onboarding@resend.dev'; // Default to test email if not set

export async function sendAdminNotification(subject: string, content: string) {
    if (!resend) {
        console.warn('--- EMAIL SKIPPED: RESEND_API_KEY is missing ---');
        console.warn('Check your .env.local file. Admin Email:', ADMIN_EMAIL);
        return;
    }

    try {
        console.log(`Attempting to send email to ${ADMIN_EMAIL}...`);
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Use a verified domain in production
            to: ADMIN_EMAIL,
            subject: subject,
            text: content,
        });

        if (error) {
            console.error('--- EMAIL FAILED ---');
            console.error(error);
        } else {
            console.log('--- EMAIL SENT SUCCESS ---');
            console.log('ID:', data?.id);
        }
    } catch (e) {
        console.error('--- EMAIL EXCEPTION ---');
        console.error(e);
    }
}
