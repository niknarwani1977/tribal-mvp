// netlify/functions/sendCircleInvite.js
// A Netlify Function that sends a circle-invite email via SendGrid

const sgMail = require('@sendgrid/mail')

// Read your SendGrid API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

/**
 * Handler invoked by Netlify when POSTed to /.netlify/functions/sendCircleInvite
 * Expects a JSON body with: { email, circleName, token }
 */
exports.handler = async (event) => {
  try {
    // Parse the incoming request body
    const { email, circleName, token } = JSON.parse(event.body)

    // Build the URL your users will click to join the circle
    const inviteLink = `${process.env.APP_URL}/join-circle?token=${token}`

    // Compose the email
    const msg = {
      to: email,
      from: 'nikhil77@gmail.com',
      subject: `Invite to join “${circleName}” on TribalConnect`,
      html: `
        <p>Hello,</p>
        <p>You’ve been invited to join the circle <strong>${circleName}</strong> on TribalConnect.</p>
        <p><a href="${inviteLink}">Click here to accept your invite</a>.</p>
        <p>If you didn’t expect this, you can ignore this email.</p>
      `,
    }

    // Send it!
    await sgMail.send(msg)
    console.log('Invite email sent to', email)

    // Return a successful response
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    }
  } catch (error) {
    console.error('Error sending invite email:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
    }
  }
}
