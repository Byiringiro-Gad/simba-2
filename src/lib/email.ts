import nodemailer from 'nodemailer';

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function fromAddress() {
  return process.env.SMTP_FROM ?? 'Simba Supermarket <noreply@simba.rw>';
}

// ── Password Reset ────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(opts: {
  name: string;
  email: string;
  resetLink: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[email] SMTP not configured — skipping password-reset email');
    return false;
  }

  try {
    await transporter.sendMail({
      from: fromAddress(),
      to: opts.email,
      subject: 'Reset your Simba password',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <div style="background:#0F172A;padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:#EAB308;margin:0;font-size:26px;letter-spacing:-0.5px">SIMBA</h1>
            <p style="color:rgba(255,255,255,0.55);margin:4px 0 0;font-size:13px">Password Reset</p>
          </div>
          <div style="background:#f9fafb;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p style="margin:0 0 16px">Hi <strong>${opts.name}</strong>,</p>
            <p style="margin:0 0 24px;color:#374151">
              We received a request to reset the password for your Simba account.
              Click the button below — the link expires in <strong>1 hour</strong>.
            </p>
            <p style="margin:0 0 24px">
              <a href="${opts.resetLink}"
                 style="display:inline-block;background:#0F172A;color:#EAB308;text-decoration:none;
                        padding:13px 28px;border-radius:8px;font-weight:700;font-size:15px">
                Reset Password
              </a>
            </p>
            <p style="color:#6b7280;font-size:13px;margin:0 0 8px">
              If the button does not work, paste this link into your browser:
            </p>
            <p style="word-break:break-all;color:#374151;font-size:13px;margin:0 0 24px">
              ${opts.resetLink}
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px"/>
            <p style="color:#9ca3af;font-size:12px;margin:0">
              If you did not request a password reset, you can ignore this email.
              Your password will not change.
            </p>
          </div>
        </div>`,
      text: `Hi ${opts.name},\n\nReset your Simba password here:\n${opts.resetLink}\n\nThis link expires in 1 hour.\n\nIf you did not request this, ignore this email.`,
    });
    return true;
  } catch (err: any) {
    console.error('[email] Failed to send password-reset email:', err.message);
    return false;
  }
}

// ── Order Confirmation ────────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(opts: {
  orderId: string;
  name: string;
  email: string;
  branch: string;
  total: number;
  deposit: number;
  items: { name: string; quantity: number; price: number; unit?: string }[];
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[email] SMTP not configured — skipping order-confirmation email');
    return false;
  }

  const rows = opts.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right">${(item.price * item.quantity).toLocaleString()} RWF</td>
        </tr>`
    )
    .join('');

  try {
    await transporter.sendMail({
      from: fromAddress(),
      to: opts.email,
      subject: `Order Confirmed — #${opts.orderId} | Simba Supermarket`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <div style="background:#0F172A;padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:#EAB308;margin:0;font-size:26px;letter-spacing:-0.5px">SIMBA</h1>
            <p style="color:rgba(255,255,255,0.55);margin:4px 0 0;font-size:13px">Order Confirmation</p>
          </div>
          <div style="background:#f9fafb;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p style="margin:0 0 8px">Hi <strong>${opts.name}</strong>,</p>
            <p style="margin:0 0 20px;color:#374151">
              Your order <strong>#${opts.orderId}</strong> has been placed successfully and will be
              ready for pickup at <strong>${opts.branch}</strong> in <strong>20–45 minutes</strong>.
            </p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px">
              <thead>
                <tr style="background:#f3f4f6">
                  <th style="padding:8px 12px;text-align:left;font-weight:600">Product</th>
                  <th style="padding:8px 12px;text-align:center;font-weight:600">Qty</th>
                  <th style="padding:8px 12px;text-align:right;font-weight:600">Price</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <p style="text-align:right;font-size:16px;font-weight:700;margin:0 0 4px">
              Total: ${opts.total.toLocaleString()} RWF
            </p>
            <p style="text-align:right;color:#6b7280;font-size:13px;margin:0 0 24px">
              Deposit paid: ${opts.deposit.toLocaleString()} RWF
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px"/>
            <p style="color:#9ca3af;font-size:12px;margin:0">
              Thank you for shopping with Simba Supermarket — Rwanda's trusted supermarket.
            </p>
          </div>
        </div>`,
      text: `Hi ${opts.name},\n\nYour order #${opts.orderId} is confirmed.\nPickup at: ${opts.branch}\nTotal: ${opts.total.toLocaleString()} RWF\n\nThank you for shopping with Simba!`,
    });
    return true;
  } catch (err: any) {
    console.error('[email] Failed to send order-confirmation email:', err.message);
    return false;
  }
}

// ── Back in Stock ─────────────────────────────────────────────────────────────

export async function sendBackInStockEmail(opts: {
  email: string;
  productName: string;
  productId: number;
  siteUrl: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[email] SMTP not configured — skipping back-in-stock email');
    return false;
  }

  const productUrl = `${opts.siteUrl}/products/${opts.productId}`;

  try {
    await transporter.sendMail({
      from: fromAddress(),
      to: opts.email,
      subject: `Back in stock: ${opts.productName} — Simba Supermarket`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <div style="background:#0F172A;padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:#EAB308;margin:0;font-size:26px;letter-spacing:-0.5px">SIMBA</h1>
            <p style="color:rgba(255,255,255,0.55);margin:4px 0 0;font-size:13px">Back in Stock Alert</p>
          </div>
          <div style="background:#f9fafb;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p style="margin:0 0 16px;color:#374151">Good news! An item on your watchlist is back in stock at Simba Supermarket.</p>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px">
              <p style="font-size:16px;font-weight:700;color:#111827;margin:0">${opts.productName}</p>
            </div>
            <p style="margin:0 0 20px">
              <a href="${productUrl}"
                 style="display:inline-block;background:#0F172A;color:#EAB308;text-decoration:none;
                        padding:13px 28px;border-radius:8px;font-weight:700;font-size:15px">
                View Product
              </a>
            </p>
            <p style="color:#9ca3af;font-size:12px;margin:0">
              You received this because you requested a notification for this item.
              Stock is limited — order soon for pickup in 20–45 minutes.
            </p>
          </div>
        </div>`,
      text: `Good news! "${opts.productName}" is back in stock at Simba Supermarket.\n\nView it here: ${productUrl}\n\nOrder for pickup in 20-45 minutes.`,
    });
    return true;
  } catch (err: any) {
    console.error('[email] Failed to send back-in-stock email:', err.message);
    return false;
  }
}
