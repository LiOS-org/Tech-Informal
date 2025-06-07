  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  });
