// Envoi de SMS pluggable. Si Twilio est configuré -> vrai SMS.
// Sinon -> mode STUB : le code est seulement journalisé (test sans coût).

export const HAS_TWILIO = Boolean(
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM
);

export async function sendSms(to: string, body: string): Promise<{ sent: boolean; stub: boolean }> {
  if (!HAS_TWILIO) {
    console.log(`📩 [SMS STUB] vers ${to} : ${body}`);
    return { sent: false, stub: true };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM!;

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[Twilio] échec envoi SMS:", res.status, detail);
    throw new Error("Échec de l'envoi du SMS.");
  }
  return { sent: true, stub: false };
}

export function otpMessage(code: string): string {
  return `Zako : votre code de connexion est ${code}. Valable 5 minutes. Ne le partagez avec personne.`;
}
