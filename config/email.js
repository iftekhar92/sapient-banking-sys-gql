const path = require("path");
const nodemailer = require("nodemailer");
const Email = require("email-templates");

const { gmail } = require("./constants");

// GMAIL
module.exports.GmailTransport = nodemailer.createTransport({
  service: gmail.SERVICE_NAME,
  host: gmail.SERVICE_HOST,
  secure: gmail.SERVICE_SECURE,
  port: gmail.SERVICE_PORT,
  auth: {
    user: gmail.USER_NAME,
    pass: gmail.USER_PASSWORD,
  },
});

module.exports.sendEmail = (transport, template, message, locals) =>
  new Promise((resolve) => {
    const email = new Email({
      transport,
      send: true,
      preview: false,
      views: {
        root: path.resolve("templates"),
      },
    });
    email
      .send({
        template,
        message,
        locals,
      })
      .then((response) => resolve({ error: response ? false : true, response }))
      .catch((response) => resolve({ error: true, response }));
  });
