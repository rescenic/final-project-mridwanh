// src/utils/mail/mail.ts

import { ZOHO_PASS, ZOHO_USER } from "@/utils/env";
import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "Zoho",
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: ZOHO_USER,
    pass: ZOHO_PASS,
  },
  requireTLS: true,
});

// Function to send an email
const send = async ({
  to,
  subject,
  content,
}: {
  to: string | string[];
  subject: string;
  content: string;
}) => {
  try {
    const result = await transporter.sendMail({
      from: ZOHO_USER,
      to,
      subject,
      html: content,
    });
    console.log("Email sent: ", result);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

// Function to render EJS template
const render = async (template: string, data: any) => {
  try {
    const templatePath = path.join(__dirname, "templates", template);
    const content = await ejs.renderFile(templatePath, data);
    return content as string;
  } catch (error) {
    console.error("Error rendering email template: ", error);
    throw error;
  }
};

export default {
  send,
  render,
};
