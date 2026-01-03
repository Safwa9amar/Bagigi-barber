import nodemailer from 'nodemailer';

export async function sendConfirmationEmail(to: string, code: string) {
  // Validate environment variables
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  console.log('Sending confirmation email to:', to);

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error('❌ Missing SMTP environment variables.');
    throw new Error('SMTP configuration is incomplete');
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465 (SSL), false otherwise
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: SMTP_FROM || `"Green Pedal" <${SMTP_USER}>`,
    to,
    subject: 'Confirm your email address',
    text: `Your confirmation code is: ${code}`,
    html: `
     <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; padding: 24px; direction: rtl;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

    <h2 style="margin-top: 0; color: #111827; text-align: center;">
      مرحبًا بك في Bagigi 👋
    </h2>

    <p style="font-size: 14px;">
      أهلًا وسهلًا،
    </p>

    <p style="font-size: 14px;">
      شكرًا لانضمامك إلى <strong>Bagigi</strong>.  
      لإكمال عملية التسجيل، يرجى استخدام رمز التأكيد التالي:
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <span style="display: inline-block; font-size: 22px; font-weight: bold; letter-spacing: 4px; color: #2e7d32; background-color: #e8f5e9; padding: 12px 20px; border-radius: 6px;">
        ${code}
      </span>
    </div>

    <p style="font-size: 14px;">
      هذا الرمز صالح لمدة محدودة.  
      إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة وسيبقى حسابك آمنًا.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

    <p style="font-size: 12px; color: #6b7280;">
      Bagigi هو تطبيق احترافي لحجز الخدمات، مصمم لتسهيل تجربتك وجعلها أكثر سلاسة وموثوقية.
    </p>

    <p style="font-size: 12px; color: #6b7280;">
      هل تحتاج إلى مساعدة؟ تواصل معنا عبر:
      <br />
      <a href="mailto:support@bagigi.app" style="color: #2563eb; text-decoration: none;">
        support@bagigi.app
      </a>
    </p>

    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px;">
      © ${new Date().getFullYear()} Bagigi. جميع الحقوق محفوظة.
    </p>

  </div>
</div>

    `,
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    throw new Error('Email sending failed');
  }
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  console.log('Sending password reset email to:', to);

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error('❌ Missing SMTP environment variables.');
    throw new Error('SMTP configuration is incomplete');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: SMTP_FROM || `"Bagigi" <${SMTP_USER}>`,
    to,
    subject: 'إعادة تعيين كلمة المرور – Bagigi',
    text: `رمز إعادة تعيين كلمة المرور الخاص بك هو: ${code}`,
    html: `
<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; padding: 24px; direction: rtl;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

    <h2 style="margin-top: 0; color: #111827; text-align: center;">
      إعادة تعيين كلمة المرور 🔐
    </h2>

    <p style="font-size: 14px;">
      مرحبًا،
    </p>

    <p style="font-size: 14px;">
      تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك في
      <strong>Bagigi</strong>.
    </p>

    <p style="font-size: 14px;">
      يرجى استخدام رمز التحقق التالي لإكمال العملية:
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <span style="display: inline-block; font-size: 22px; font-weight: bold; letter-spacing: 4px; color: #b91c1c; background-color: #fee2e2; padding: 12px 20px; border-radius: 6px;">
        ${code}
      </span>
    </div>

    <p style="font-size: 14px;">
      هذا الرمز صالح لمدة محدودة فقط.
    </p>

    <p style="font-size: 14px;">
      إذا لم تقم بطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة — حسابك سيبقى آمنًا.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

    <p style="font-size: 12px; color: #6b7280;">
      Bagigi هو تطبيق احترافي لحجز الخدمات، يضمن لك تجربة آمنة وسلسة.
    </p>

    <p style="font-size: 12px; color: #6b7280;">
      هل تحتاج إلى مساعدة؟
      <br />
      <a href="mailto:support@bagigi.app" style="color: #2563eb; text-decoration: none;">
        support@bagigi.app
      </a>
    </p>

    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px;">
      © ${new Date().getFullYear()} Bagigi. جميع الحقوق محفوظة.
    </p>

  </div>
</div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw new Error('Email sending failed');
  }
}
