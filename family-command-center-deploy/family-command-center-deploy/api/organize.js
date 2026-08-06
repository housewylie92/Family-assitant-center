// This runs on Vercel's servers, never in the visitor's browser.
// The API key lives in an environment variable set in the Vercel dashboard —
// it is never present in any file here, and never sent to the browser.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { raw, family } = req.body || {};

  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return res.status(400).json({ error: 'Missing text to organize.' });
  }

  const systemPrompt = `You are a family logistics assistant. The user will paste messy, unstructured family logistics info (texts, forms, notes, appointments). Convert it into a clean, organized weekly schedule.

Respond with ONLY valid JSON, no markdown code fences, no preamble, no explanation — matching exactly this schema:
{"week_label": string, "days": [{"day": string, "items": [{"time": string, "title": string, "person": string, "category": string}]}], "todos": [string]}

Rules:
- Order days array Monday through Sunday, only include days that have at least one item.
- category must be one of: activity, appointment, school, event, other
- Keep item titles short and clear, under 8 words, action-oriented.
- If no clock time is given for an item, use a reasonable label like "Morning" or "All day" instead of a time.
- If a person isn't specified for an item, use "Family".
- Anything that's a task/reminder rather than a scheduled event (forms to sign, things to bring, chores) goes in the top-level "todos" array as short strings, not in days.
- week_label should be a short friendly label like "This Week" or similar.`;

  const userMessage = family
    ? `Family members: ${family}\n\nHere's the week's chaos:\n${raw}`
    : `Here's the week's chaos:\n${raw}`;

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      console.error('Anthropic API error:', data);
      return res.status(anthropicResponse.status).json({
        error: data.error?.message || 'Claude API request failed.'
      });
    }

    const textBlock = (data.content || []).find(b => b.type === 'text');
    if (!textBlock) {
      return res.status(500).json({ error: 'No text returned from Claude.' });
    }

    res.status(200).json({ text: textBlock.text });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error calling Claude API.' });
  }
};
