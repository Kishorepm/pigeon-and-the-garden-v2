// POST { choice: "sealed", picks: {...} } | { choice: "left" } -> notify me.
// Nothing is stored, nothing is tracked.
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
    const rows = ['place', 'day', 'hour', 'duration', 'food', 'drink', 'banned', 'escort', 'throne', 'weather', 'cut', 'colour', 'build']
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

  const hook = process.env.WEBHOOK_URL;

  try {
    if (hook && /ntfy\./.test(hook)) {
      // ntfy takes the message as the raw body. Posting JSON to a topic URL does
      // not unwrap it, it just shows the JSON itself as the message, so the
      // phone would light up with {"text":"Sealed...","content":...}.
      await fetch(hook, {
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
      await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // `text` is what Slack reads; `content` is what Discord reads.
        // Sending both means the same URL works whichever you paste in.
        body: JSON.stringify({ text, content: text, choice })
      });
    } else if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
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
    // Swallowed on purpose. A failed notification must never become her problem.
    console.error('[respond] notify failed:', e && e.message);
  }

  // Respond LAST, not first. A serverless function can be frozen the moment it
  // ends the response, which would kill the notification mid-flight — and the
  // notification is the one thing here that has to work. She never waits on this:
  // the browser sends it fire-and-forget with keepalive and moves on immediately.
  res.status(200).end();
};
