document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  const feedback = document.createElement('div');
  feedback.id = 'contact-feedback';
  form.appendChild(feedback);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    feedback.style.display = 'none';
    feedback.textContent = '';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (response.ok) {
        feedback.style.cssText = 'margin-top:1rem;border:2px solid #27ae60;padding:1rem;background:rgba(39,174,96,0.05);';
        feedback.innerHTML = '<strong style="font-family:Impact,sans-serif;text-transform:uppercase;letter-spacing:0.05em;">Message Sent</strong><p style="margin:0.5rem 0 0 0;">Thank you for your message. We will get back to you as soon as possible.</p>';
        feedback.style.display = 'block';
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        form.querySelectorAll('input, textarea').forEach(el => el.value = '');
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      feedback.style.cssText = 'margin-top:1rem;border:2px solid #c0392b;padding:1rem;background:rgba(192,57,43,0.05);';
      feedback.innerHTML = '<strong style="font-family:Impact,sans-serif;text-transform:uppercase;letter-spacing:0.05em;">Error</strong><p style="margin:0.5rem 0 0 0;">Something went wrong. Please try again or email us directly.</p>';
      feedback.style.display = 'block';
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  });
});
