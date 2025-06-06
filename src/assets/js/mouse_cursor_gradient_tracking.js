const a = document.querySelector('.mouse_cursor_gradient_tracking');
a.addEventListener('mousemove', e => {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  a.style.setProperty('--x', x + 'px');
  a.style.setProperty('--y', y + 'px');
});