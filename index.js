const Imap = require('imap')
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const SMTPConnection = require('nodemailer/lib/smtp-connection')
require('dotenv').config()

const AUTO_REPLY_ADDRESS = 'v.club.archery@gmail.com'

async function sendEmail(recipientEmails = [], subject, body) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER, // generated ethereal user
      pass: process.env.GMAIL_PASSWORD, // generated ethereal password
    },
  });

  try {
    let info = await transporter.sendMail({
      from: process.env.GMAIL_USER, // sender address
      to: AUTO_REPLY_ADDRESS, // list of receivers
      subject: subject, // Subject line
      text: body, // plain text body
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

function manageInbox() {
  const imap = new Imap({
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { servername: 'imap.gmail.com' }
  });

  function getEmail(start, number) {
    console.log(`Getting email from seq: ${start}:${start + number}`)
    const f = imap.seq.fetch(`${start}:${start + number}`, {
      bodies: '',
      struct: true
    });
    f.on('message', function (msg, seqno) {
      const prefix = '#' + seqno;
      msg.on('body', stream => {
        simpleParser(stream, async (err, parsed) => {
          const { from, to, subject, date, textAsHtml, text } = parsed;
          console.log("-------------------");
          console.log("Email No. %s", prefix)
          console.log({ from: from.value[0], to: to.value, subject, date, textAsHtml, text });
          console.log("-------------------");

          if (from.value[0].address == AUTO_REPLY_ADDRESS) {
            sendEmail([from.value[0].address], `Re: ${subject}`, `Noted with thanks.\nRight on it, boss!\n\nHave a great day,\n${process.env.YOUR_NAME}`)
          }
        });
      });
    });
  }

  imap.once('error', function (err) {
    console.log(`Error: ${err}`);
  });

  imap.once('end', function () {
    console.log('Connection ended');
  });


  imap.on('ready', () => {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) console.log(err)
      else console.log('Recipient is ready for accepting')
    })
  })

  let numberOfEmails = 0
  imap.on('mail', number => {
    if (numberOfEmails == 0) {
      console.log(`Current number of emails in inbox: ${number}`)
      numberOfEmails = number
    } else {
      getEmail(numberOfEmails + 1, number - 1)
      numberOfEmails += number
      console.log(`Number of emails updated to ${numberOfEmails}`)
    }
  })

  imap.on('expunge', number => {
    if (number <= numberOfEmails) {
      console.log(`Email #${number} was deleted`)
      numberOfEmails -= 1
      console.log(`Number of emails updated to ${numberOfEmails}`)
    }
  })

  imap.connect();
}

manageInbox()