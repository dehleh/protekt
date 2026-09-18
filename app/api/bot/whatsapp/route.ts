import { NextRequest, NextResponse } from 'next/server';
import { processInboundMessage } from '@/lib/bot-gateway.ts';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'shomar_protect_webhook_secret';

/**
 * GET handler: Webhook verification handshake for Meta WhatsApp Cloud API
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST handler: Inbound message processor from WhatsApp Cloud API or Twilio
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, any>;

    // 1. Meta WhatsApp Cloud API payload format
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      if (!message || message.type !== 'text') {
        return NextResponse.json({ status: 'ignored' }, { status: 200 });
      }

      const senderPhone = message.from;
      const incomingText = message.text?.body || '';

      const botReply = processInboundMessage({
        senderId: senderPhone,
        text: incomingText,
      });

      // If live Meta API token is configured, send the reply back
      const apiToken = process.env.WHATSAPP_API_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (apiToken && phoneId) {
        await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: senderPhone,
            type: 'text',
            text: { body: botReply.message },
          }),
        }).catch(() => {});
      }

      return NextResponse.json({ status: 'delivered', reply: botReply.message });
    }

    // 2. Generic / Twilio / Direct simulation format
    if (body.from && body.text) {
      const botReply = processInboundMessage({
        senderId: body.from,
        text: body.text,
        language: body.language,
      });

      return NextResponse.json({
        status: 'success',
        recipient: botReply.recipientId,
        language: botReply.language,
        verdict: botReply.assessment?.verdict,
        message: botReply.message,
      });
    }

    return NextResponse.json({ error: 'Unrecognized webhook payload structure' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
