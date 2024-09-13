import { sendEmail } from "../helpers.js";

export const formSubmitEmail = async (to, name, email, message, origin) => {
  const text = `Hello,\n\n
  Someone has just submitted your form on ${origin}.\n\n
  Here's what they had to say:\n\n
  Name: ${name}\n
  Email: ${email}\n
  Message:\n
  ${message}\n\n
  Regards,\n
  Your Team`;

  const html = `
    <html>
    <body>
      <p>Hello,</p>
      <p>Someone has just submitted your form on ${origin}.</p>
      <p>Here's what they had to say:</p>
      <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 100px;">Name:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 100px;">Email:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 100px;">Message:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${message}</td>
        </tr>
      </table>
      <br>
      <p>Regards,</p>
      <p>Your Team</p>
    </body>
    </html>
  `;

  await sendEmail({
    to,
    subject: "New Contact Form Submission",
    text,
    html,
  });
};
