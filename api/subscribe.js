export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email_address, fields } = req.body;
  if (!email_address) return res.status(400).json({ error: 'Email required' });

  const apiKey = process.env.KIT_API_KEY;
  const headers = { 'Content-Type': 'application/json', 'X-Kit-Api-Key': apiKey };

  try {
    // Step 1: Create subscriber with custom fields
    const subRes = await fetch('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email_address, fields: fields || {} })
    });
    const subData = await subRes.json();
    if (!subRes.ok) return res.status(subRes.status).json(subData);

    // Step 2: Add subscriber to form (makes them visible in form subscriber list)
    const formRes = await fetch('https://api.kit.com/v4/forms/9086747/subscribers', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email_address })
    });
    const formData = await formRes.json();

    return res.status(200).json({
      status: 'success',
      subscriber_id: subData.subscriber?.id,
      form_added: formRes.ok
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
