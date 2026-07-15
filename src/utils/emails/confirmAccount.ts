import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail({
  email,
  name,
  lastName,
  token,
}: {
  email: string;
  name: string;
  lastName: string;
  token: string;
}) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirmá tu email",
    html: `<!DOCTYPE html>
          <html lang="es">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirmá tu correo</title>
          </head>
          <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f4f7;padding:40px 20px;">
              <tr>
                  <td align="center">

                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">

                          <!-- Header -->
                          <tr>
                              <td align="center" style="background:#2563eb;padding:40px 20px;">
                                  <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:bold;">
                                      Form Custom
                                  </h1>
                                  <p style="margin:12px 0 0;color:#dbeafe;font-size:16px;">
                                      Creá formularios personalizados de forma simple.
                                  </p>
                              </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                              <td style="padding:40px 35px;color:#333333;">

                                  <h2 style="margin-top:0;font-size:26px;color:#111827;">
                                      ¡Bienvenido, ${name} ${lastName}!
                                  </h2>

                                  <p style="font-size:16px;line-height:1.7;margin-bottom:20px;">
                                      Gracias por registrarte en <strong>Form Custom</strong>.
                                  </p>

                                  <p style="font-size:16px;line-height:1.7;margin-bottom:30px;">
                                      Antes de comenzar, necesitamos verificar que esta dirección de correo electrónico te pertenece.
                                  </p>

                                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                      <tr>
                                          <td align="center">
                                              <a href="${verificationUrl}"
                                                style="display:inline-block;
                                                        background:#2563eb;
                                                        color:#ffffff;
                                                        text-decoration:none;
                                                        padding:16px 32px;
                                                        border-radius:8px;
                                                        font-size:16px;
                                                        font-weight:bold;">
                                                  Confirmar mi correo
                                              </a>
                                          </td>
                                      </tr>
                                  </table>

                                  <p style="margin-top:35px;font-size:15px;line-height:1.7;color:#555555;">
                                      Si el botón no funciona, copiá y pegá el siguiente enlace en tu navegador:
                                  </p>

                                  <p style="word-break:break-all;font-size:14px;color:#2563eb;">
                                      ${verificationUrl}
                                  </p>

                                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:35px 0;">

                                  <p style="font-size:14px;color:#6b7280;line-height:1.6;">
                                      Si no creaste una cuenta en Form Custom, simplemente ignorá este correo. No se realizará ninguna acción.
                                  </p>

                              </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                              <td align="center" style="padding:25px;background:#f9fafb;border-top:1px solid #e5e7eb;">

                                  <p style="margin:0;font-size:14px;color:#6b7280;">
                                      © ${new Date().getFullYear()} Form Custom. Todos los derechos reservados.
                                  </p>

                                  <p style="margin:10px 0 0;font-size:13px;color:#9ca3af;">
                                      Este correo fue enviado automáticamente. Por favor, no respondas este mensaje.
                                  </p>

                              </td>
                          </tr>

                      </table>

                  </td>
              </tr>
          </table>

          </body>
          </html>
`,
  });
}
