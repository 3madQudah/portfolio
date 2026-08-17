/* theme.js — dark/light mode toggle.
   State lives only in a JS variable + the data-theme attribute on <body>.
   No localStorage / sessionStorage is used. */
(function(){
  "use strict";

  var theme = 'dark';
  var body = document.body;
  var themeToggle = document.getElementById('themeToggle');

  function applyTheme(next){
    theme = next;
    if(theme === 'light'){
      body.setAttribute('data-theme','light');
    } else {
      body.setAttribute('data-theme','dark');
    }
    themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }

  if(themeToggle){
    themeToggle.addEventListener('click', function(){
      applyTheme(theme === 'dark' ? 'light' : 'dark');
    });
  }
})();
