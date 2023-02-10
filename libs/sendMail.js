const MailConfig = require("../config/email");
const gmailTransport = MailConfig.GmailTransport;

const sendMail = ({ from, to, template, context }) =>
  new Promise((resolve) => {
    try {
      return MailConfig.sendEmail(gmailTransport, template, { from, to }, context)
        .then((response) => resolve(response))
        .catch(() => resolve({ error: "Error sending email", response: "" }));
    } catch {
      return resolve({ error: "Error sending email", response: "" });
    }
  });

module.exports = { sendMail };
