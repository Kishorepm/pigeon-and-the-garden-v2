// POST { choice: "sealed", picks: {...} } | { choice: "left" } -> notify me.
// No database; notification attempts are recorded in function logs.
// ponytail: no queue, no retry, no dedupe. It fires once a decade.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const choice = req.body && req.body.choice;
  if (choice !== 'sealed' && choice !== 'left') return res.status(400).end();

  const updated = !!(req.body && req.body.updated);

  let text;
  if (choice === 'sealed') {
    const p = (req.body && req.body.picks) || {};
    // Her choices, one line each, straight into the notification.
    const rows = ['travel', 'range', 'date', 'place', 'day', 'hour', 'duration', 'food', 'drink', 'note', 'banned', 'escort', 'tortoise', 'crown', 'throne', 'build']
      .filter((k) => p[k])
      .map((k) => `${k}: ${p[k]}`);
    // She can seal, go back, change something and seal again. Say which this is,
    // or the second message reads as a duplicate of the first.
    text = [updated ? 'She changed something. The decree now:' : 'Sealed. The decree:',
            ...rows].join('\n');
  } else {
    text = 'She left the garden. No follow-up.';
  }

  // Always log it. If the env vars are ever unset or wrong, the answer is still
  // sitting in the Vercel function logs instead of being lost entirely.
  console.log('[respond]', text);

  // WEBHOOK_URL is meant to be a full URL, but the easy mistake is to paste just
  // the ntfy topic name. That failed twice over: /ntfy\./ did not match a bare
  // topic, so it fell through to the generic-webhook branch, and fetch() then
  // threw "Failed to parse URL" — caught below, logged, and invisible to
  // everyone including me. For the one message that has to work, a sensible
  // guess beats a silent failure: anything without a scheme is an ntfy topic.
  const raw = (process.env.WEBHOOK_URL || '').trim();
  const hook = raw && !/^https?:\/\//i.test(raw)
    ? 'https://ntfy.sh/' + raw.replace(/^\/+/, '')
    : raw;
  if (!hook && !process.env.RESEND_API_KEY) return res.status(503).end();
  // Report delivery failures so the invitation can offer retry or copying by text.
  const deliver = async (url, options) => {
    const result = await fetch(url, { ...options, signal: AbortSignal.timeout(8000) });
    if (!result.ok) throw new Error('Notification service returned ' + result.status);
  };

  try {
    if (hook && /ntfy\./.test(hook)) {
      // ntfy takes the message as the raw body. Posting JSON to a topic URL does
      // not unwrap it, it just shows the JSON itself as the message, so the
      // phone would light up with {"text":"Sealed...","content":...}.
      await deliver(hook, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          // Header values must stay ASCII; ntfy rejects anything else.
          Title: choice !== 'sealed' ? 'She left the garden.'
                 : updated ? 'Updated.' : 'Sealed.',
          Priority: choice === 'sealed' ? 'high' : 'default',
          Tags: choice === 'sealed' ? 'tada' : 'wave'
        },
        body: text
      });
    } else if (hook) {
      await deliver(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // `text` is what Slack reads; `content` is what Discord reads.
        // Sending both means the same URL works whichever you paste in.
        body: JSON.stringify({ text, content: text, choice })
      });
    } else if (process.env.RESEND_API_KEY) {
      await deliver('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.NOTIFY_FROM,
          to: process.env.NOTIFY_TO,
          subject: choice !== 'sealed' ? 'Left.' : updated ? 'Updated.' : 'Sealed.',
          text
        })
      });
    }
  } catch (e) {
    console.error('[respond] notify failed:', e && e.message);
    return res.status(502).end();
  }

  // Respond LAST, not first. A serverless function can be frozen the moment it
  // ends the response, which would kill the notification mid-flight — and the
  // invitation waits for acceptance before showing its sent state.
  res.status(200).end();
};
