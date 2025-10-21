// functions/submit-form.js

// O handler para Cloudflare Functions tem um formato diferente.
// Ele recebe um objeto 'context' que contém a requisição, variáveis de ambiente, etc.
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { token, ...formData } = body;

    // --- DEBUGGING LOG ---
    console.log("Received token length:", token ? token.length : 'undefined');
    console.log("Token prefix:", token ? token.substring(0, 20) : 'undefined');
    // --- END DEBUGGING LOG ---

    // 1. Validação do reCAPTCHA
    const recaptchaSecret = env.RECAPTCHA_SECRET_KEY;
    const ip = request.headers.get('CF-Connecting-IP'); // Pega o IP real do visitante via Cloudflare
    
    let params = new URLSearchParams();
    params.append('secret', recaptchaSecret);
    params.append('response', token);
    if (ip) {
      params.append('remoteip', ip);
    }

    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const recaptchaRes = await fetch(recaptchaUrl, { 
        method: 'POST',
        body: params
    });
    
    const recaptchaJson = await recaptchaRes.json();

    if (!recaptchaJson.success) {
      console.error('reCAPTCHA verification failed:', recaptchaJson['error-codes']);
      return new Response(JSON.stringify({ message: 'reCAPTCHA inválido. Tente novamente.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Se o reCAPTCHA for válido, envia os dados para o Supabase
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_KEY;

    const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Supabase error:', errorBody);
      throw new Error('Falha ao salvar os dados no Supabase.');
    }

    // 3. Retorna uma resposta de sucesso
    return new Response(JSON.stringify({ message: 'Formulário enviado com sucesso!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(JSON.stringify({ message: 'Ocorreu um erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}