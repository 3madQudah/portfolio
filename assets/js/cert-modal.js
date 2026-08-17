/* cert-modal.js — certifications.html only.
   Opens a single reusable full-viewport lightbox showing a certificate's
   PNG preview, populated from the clicked preview button's data-* attributes.

   Note: the PNGs referenced by data-image are not yet present in
   assets/certificates/ — previews will show as broken images until those
   files are added there. */
(function(){
  "use strict";

  var previews = document.querySelectorAll('.cert-entry-preview');
  var lightbox = document.getElementById('certLightbox');
  if(!lightbox || !previews.length) return;

  var imgEl = document.getElementById('certLightboxImg');
  var closeBtn = document.getElementById('certLightboxClose');

  var lastTrigger = null;

  function focusableInLightbox(){
    return Array.prototype.filter.call(
      lightbox.querySelectorAll('button, a[href]'),
      function(el){ return el.offsetParent !== null; }
    );
  }

  function onKeydown(e){
    if(e.key === 'Escape'){
      closeLightbox();
      return;
    }
    if(e.key === 'Tab'){
      var focusable = focusableInLightbox();
      if(!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault();
        last.focus();
      } else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault();
        first.focus();
      }
    }
  }

  function openLightbox(btn){
    lastTrigger = btn;

    var image = btn.getAttribute('data-image') || '';
    var label = btn.getAttribute('data-label') || '';

    imgEl.src = image;
    imgEl.alt = label;
    lightbox.setAttribute('aria-label', label);

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();

    document.addEventListener('keydown', onKeydown);
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    imgEl.src = '';
    document.removeEventListener('keydown', onKeydown);

    if(lastTrigger){
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  previews.forEach(function(btn){
    btn.addEventListener('click', function(){
      openLightbox(btn);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);

  /* Click the backdrop (not the image or the close button) to close.
     e.target stays the originally clicked element through bubbling, so this
     only matches genuine backdrop clicks. */
  lightbox.addEventListener('click', function(e){
    if(e.target === lightbox){
      closeLightbox();
    }
  });
})();
