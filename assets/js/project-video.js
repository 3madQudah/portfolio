/* project-video.js — click-to-play demo video for project key art.
   Generic pattern: any ".proj-video[data-video-src]" wrapper on the projects
   page gets its poster content (a logo/wordmark/play-button panel for
   ContextIQ; any markup shape in general) replaced by a <video> once its
   ".proj-video-trigger" button is activated. Adding this to another project
   card later needs no JS change — only the same wrapper/button/
   data-video-src markup shape. For now only the ContextIQ card in
   projects.html opts in. */
(function(){
  "use strict";

  var wrappers = document.querySelectorAll('.proj-video[data-video-src]');
  if(!wrappers.length) return;

  wrappers.forEach(function(wrapper){
    var trigger = wrapper.querySelector('.proj-video-trigger');
    if(!trigger) return;

    trigger.addEventListener('click', function(){
      var src = wrapper.getAttribute('data-video-src');
      var label = trigger.getAttribute('aria-label') || 'Demo video';

      var video = document.createElement('video');
      video.className = 'proj-video-el';
      video.setAttribute('controls', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('preload', 'none');
      video.setAttribute('aria-label', label);
      video.muted = true; // required for the immediate autoplay below to be allowed
      video.src = src;

      /* Replaces the poster SVG and the trigger button in one go — once the
         video's own controls exist, the play affordance is no longer needed. */
      wrapper.innerHTML = '';
      wrapper.appendChild(video);

      /* play() can reject (e.g. if the element is removed before it resolves)
         — this is a user-gesture-initiated call so it should succeed, but the
         rejection is swallowed rather than left as an unhandled promise. */
      video.play().catch(function(){});
    }, { once: true });
  });
})();
