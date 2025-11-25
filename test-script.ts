// test-resend.ts
import { Resend } from 'resend';

const resend = new Resend('re_ANMcSJwv_P2eEyPC18eUCE79M9xDrwjxD');

async function test() {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'faresmohmed6872@gmail.com', 
    subject: 'Test Email',
    html: '<h1>Test</h1>',
  });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

test();