const fetch = global.fetch || require('node-fetch');
const testEmail = 'copilot-test@example.com';
const testPassword = 'Test1234!';
(async () => {
  try {
    const signup = await fetch('http://localhost:8000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Copilot Test', email: testEmail, phone: '1234567890', password: testPassword }),
    });
    console.log('signup status', signup.status);
    console.log('signup body', await signup.text());

    const login = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    console.log('login status', login.status);
    console.log('login body', await login.text());
  } catch (err) {
    console.error('fetch error', err);
  }
})();

