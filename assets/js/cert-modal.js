/* cert-modal.js — shared modal logic for this site.

   1) Certificate image lightbox — certifications.html only. Opens a single
      reusable full-viewport lightbox showing a certificate's PNG preview,
      populated from the clicked .cert-entry-preview button's data-* attributes.

   2) Certification PDF preview modal — experience.html (and anywhere else
      that adds [data-pdf-trigger] buttons). Opens a single reusable modal
      that renders a PDF inline, with a header bar (label + download + close)
      and a mobile-safe fallback for browsers that can't render PDFs in an
      iframe/embed.

   Both share the same focus-trap / Escape / backdrop-click / scroll-lock
   pattern via the helpers below, so the interaction logic lives in one place
   instead of being duplicated per modal. */
(function(){
  "use strict";

  /* ---------- shared modal helpers ---------- */
  function focusableIn(container){
    return Array.prototype.filter.call(
      container.querySelectorAll('button, a[href]'),
      function(el){ return el.offsetParent !== null; }
    );
  }

  function makeTrapHandler(container, closeFn){
    return function(e){
      if(e.key === 'Escape'){
        closeFn();
        return;
      }
      if(e.key === 'Tab'){
        var focusable = focusableIn(container);
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
    };
  }

  /* ---------- 1) certificate image lightbox (certifications.html) ---------- */
  (function(){
    var previews = document.querySelectorAll('.cert-entry-preview');
    var lightbox = document.getElementById('certLightbox');
    if(!lightbox || !previews.length) return;

    var imgEl = document.getElementById('certLightboxImg');
    var closeBtn = document.getElementById('certLightboxClose');
    var lastTrigger = null;
    var onKeydown = makeTrapHandler(lightbox, closeLightbox);

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
    onBackdropClick(lightbox, closeLightbox);
  })();

  /* ---------- 2) certification PDF preview modal (experience.html) ---------- */
  (function(){
    var triggers = document.querySelectorAll('[data-pdf-trigger]');
    var modal = document.getElementById('pdfModal');
    if(!modal || !triggers.length) return;

    var frame = document.getElementById('pdfModalFrame');
    var fallback = document.getElementById('pdfModalFallback');
    var fallbackLink = document.getElementById('pdfModalFallbackLink');
    var downloadLink = document.getElementById('pdfModalDownload');
    var closeBtn = document.getElementById('pdfModalClose');
    var lastTrigger = null;
    var onKeydown = makeTrapHandler(modal, closeModal);

    /* iOS Safari (and most mobile browsers) silently render an inline PDF
       iframe as a blank white box instead of erroring, so there's no load
       failure to catch — the only reliable signal is platform + viewport.
       iPadOS reports as "MacIntel" but exposes multi-touch, which desktop
       Macs don't, so that combination is treated as iOS too. Narrow
       viewports are included per spec even off iOS, since small-screen inline
       PDF viewers are broadly unusable. */
    function needsFallback(){
      var ua = navigator.userAgent || '';
      var isIOS = /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      var narrow = window.innerWidth <= 640;
      return isIOS || narrow;
    }

    function openModal(btn){
      lastTrigger = btn;

      var pdf = btn.getAttribute('data-pdf') || '';
      var label = btn.getAttribute('data-label') || 'Certificate';

      downloadLink.href = pdf;
      fallbackLink.href = pdf;

      if(needsFallback()){
        frame.removeAttribute('src');
        frame.hidden = true;
        fallback.hidden = false;
      } else {
        frame.hidden = false;
        fallback.hidden = true;
        frame.title = label;
        frame.src = pdf;
      }

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();

      document.addEventListener('keydown', onKeydown);
    }

    function closeModal(){
      modal.classList.remove('open');
      document.body.style.overflow = '';
      frame.removeAttribute('src');
      document.removeEventListener('keydown', onKeydown);

      if(lastTrigger){
        lastTrigger.focus();
        lastTrigger = null;
      }
    }

    triggers.forEach(function(btn){
      btn.addEventListener('click', function(){
        openModal(btn);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    onBackdropClick(modal, closeModal);
  })();

  /* Shared backdrop-click wiring: closes only on a genuine click on the
     outer overlay element itself, not on anything inside the panel.
     e.target stays the originally clicked element through bubbling, so this
     only matches genuine backdrop clicks. */
  function onBackdropClick(overlay, closeFn){
    overlay.addEventListener('click', function(e){
      if(e.target === overlay){
        closeFn();
      }
    });
  }
})();
