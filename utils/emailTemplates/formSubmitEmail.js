import { sendEmail } from "../helpers.js";

export const formSubmitEmail = async (to, name, email, message) => {
  const text = `Someone just submitted your form on https://www.fleamarketyo.it/.\n\n
  Here's what they had to say:\n\n
  Name:\n\n
  ${name}\n\n
  Email:\n\n
  ${email}\n\n
  Message:\n\n
  ${message}\n\n`;

  const html = `<p>Someone just submitted your form on https://www.fleamarketyo.it/.</p>
    <p>Here's what they had to say:</p>
    <p><strong>Name:</strong></p>
    <p>${name}</p>
    <p><strong>Email:</strong></p>
    <p>${email}</p>
      <p><strong>Message:</strong></p>
    <p>${message}</p>`;

  await sendEmail({
    to,
    subject: "Nuovo contatto",
    text,
    html,
  });
};
