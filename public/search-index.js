<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
    <link rel="shortcut icon" href="/assets/images/favicon.png" type="image/x-icon">
    <link rel="stylesheet" href="/assets/css/techinformal.css">
    <script src="/assets/js/mouse_cursor_gradient_tracking.js"></script>
  </head>
<body>
    <script>
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", (user) => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
</script>
    
  <div class="header_embedded_navigation frosted_background frosted_texture">
      <!-- Hamburger Icon -->
      <a id="hamburger" aria-label="Open Menu" class="hamburger buttons"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16" /><path d="M4 18h16" /><path d="M4 6h16" /></svg></a>
      <div class="buttons " style="margin-left: 5%;"><a href="/">Tech Informal</a></div>
      <div class="buttons "><a href="/blog">Blog</a></div>
  </div>
<!-- Sidebar -->
<aside id="sidebar" class="sidebar frosted_background frosted_texture">
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about/">About</a></li>
      <li><a href="/blog/">Blog</a></li>
      <li><a href="/contact/">Contact</a></li>
    </ul>
  </nav>
</aside>
<div id="overlay" class="overlay"></div>
    <main>
    <h1>Search</h1>
<input type="text" id="search" placeholder="Search blog...">
<ul id="results"></ul>

<script src="/assets/search-index.js"></script>
<script>
  const input = document.getElementById("search");
  const results = document.getElementById("results");

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    results.innerHTML = "";

    const filtered = searchIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.excerpt.toLowerCase().includes(query) ||
      item.tags.join(" ").toLowerCase().includes(query)
    );

    filtered.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${item.url}">${item.title}</a><p>${item.excerpt}</p>`;
      results.appendChild(li);
    });
  });
</script>


    </main>
  <script type="module" src="/assets/firebase.js"></script>
  <script src="/assets/js/hamburger_menu.js"></script>
</body>
</html>