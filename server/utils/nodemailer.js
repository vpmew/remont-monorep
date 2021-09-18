import nodemailer from "nodemailer";

const {
  EMAIL_SERVICE: service,
  EMAIL_USER: user,
  EMAIL_PASS: pass,
} = process.env;

let transporter;

async function applyTransporter(f) {
  if (!transporter) {
    if (service !== "gmail") {
      const { user, pass, smtp } = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        ...smtp,
        auth: {
          user,
          pass,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        service,
        auth: {
          user,
          pass,
        },
      });
    }
  }
  return f;
}

export const initMailer = applyTransporter.bind(
  null,
  async (email, url, pass) => {
    const message = {
      from: `"Ремонт техники в Оренбурге" <${user}>`,
      to: email,
      subject: "Ваш новый пароль!",
      text: `Мы создали для вас новый надёжный пароль: ${pass}\n\n\nЧтобы применить его, перейдите по ссылке ниже.\n\n\nСсылка для подтверждения: ${url}`,
      html: `
      <h3>Привет :)</h3>
      <div>Вот новый надёжный пароль для вашего аккаунта: <b>${pass}</b></div>
      <div><i>(Рекомендуем сохранить его в надёжном месте)</i></div>
      <br/>
      <div>Чтобы применить его, перейдите по ссылке ниже. Ссылка действительна в течение 1 часа.</div>
      <br/>
      <div>Ссылка для подтверждения: <a href="#">${url}</a></div>
    `,
    };
    try {
      const info = await transporter.sendMail(message);
      if (service === "ethereal") {
        console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      throw error;
    }
  }
);
