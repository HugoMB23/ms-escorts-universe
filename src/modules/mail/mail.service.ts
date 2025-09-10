import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend('re_f9te9mge_KtadGxitJ1ydzSqcVXc3fLNV'); // Reemplaza 'your-resend-api-key' con tu clave API de Resend
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const resetUrl = `https://warp-test.vercel.app/reset-password?token=${token}&email=${email}`;
    const { data, error } = await this.resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['enwallcs2@gmail.com'],
      subject: 'Hello World',
      html: `
      <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        .header {
            text-align: center;
            padding: 10px 0;
            background-color: #007bff;
            border-radius: 8px 8px 0 0;
            color: #ffffff;
        }
        .header img {
            max-width: 50px;
            margin-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content h2 {
            font-size: 20px;
            color: #333333;
        }
        .content p {
            font-size: 16px;
            color: #666666;
            line-height: 1.5;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            margin-top: 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #999999;
        }
        .footer p {
            margin: 5px 0;
        }
        .social-icons {
            margin-top: 10px;
        }
        .social-icons img {
            width: 24px;
            margin: 0 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://cdn-icons-png.flaticon.com/512/893/893292.png" alt="Logo">
            <h1>Restablecer Contraseña</h1>
        </div>
        <div class="content">
            <h2>Hola,</h2>
            <p>Hemos recibido una solicitud para restablecer tu contraseña. Si no solicitaste este cambio, puedes ignorar este correo electrónico.</p>
            <p>Para restablecer tu contraseña, haz clic en el botón a continuación:</p>
            <a href="${resetUrl}" class="btn">Restablecer Contraseña</a>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.</p>
        </div>
        <div class="footer">
            <p>© 2023 Tu Empresa. Todos los derechos reservados.</p>
            <p>Síguenos en nuestras redes sociales:</p>
            <div class="social-icons">
                <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook"></a>
                <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Twitter"></a>
                <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram"></a>
            </div>
        </div>
    </div>
</body>
</html>
    `,
    });

    if (error) {
      return console.error({ error });
    }

    // const emailResponse = await this.resend.emails.send({
    //   from: 'enwallcs2@gmail.com', // Dirección de correo desde la cual se enviará el correo
    //   to: email,
    //   subject: 'Restablecer contraseña',
    //   html: `
    //     <h1>Restablecer contraseña</h1>
    //     <p>Hola,</p>
    //     <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el enlace a continuación para continuar:</p>
    //     <a href="${resetUrl}">Restablecer Contraseña</a>
    //     <p>Si no solicitaste este restablecimiento, puedes ignorar este correo.</p>
    //   `,
    // });

    console.log('Correo enviado:', data);
  }
}
