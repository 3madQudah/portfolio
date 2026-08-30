/* nav.js — navbar dropdown behavior, shared by every page:
     - MORE: hover-open with a short close delay, plus a click toggle
       (touch fallback), used for the Skills / Resume panel.
     - CONTACT: click-open only, used for the phone / email / location panel.
     - Closes any open dropdown on outside click or Escape.
   Also generates the hero waveform bars, wires up the projects filter
   chips, and drives the mobile hamburger + full-screen nav panel below
   900px — all three guarded so they're a no-op on any page without the
   relevant element (#waveform on index.html, .proj-filters on
   projects.html, #mobileMenuToggle on every page once added). It lives
   here rather than in a third/fourth file since the project's assets/js/
   only defines theme.js and nav.js. */
(function(){
  "use strict";

  /* ---------- Waveform bars (index.html only) ---------- */
  var waveform = document.getElementById('waveform');
  if(waveform){
    var BAR_COUNT = 34;
    for(var i = 0; i < BAR_COUNT; i++){
      var bar = document.createElement('div');
      bar.className = 'bar';
      var h = Math.round(40 + Math.random() * 116); // 40px - 156px
      bar.style.setProperty('--h', h + 'px');
      bar.style.animationDelay = (i * 0.055) + 's';
      waveform.appendChild(bar);
    }
  }

  /* ---------- Project filter chips (projects.html only) ---------- */
  var projFilters = document.querySelector('.proj-filters');
  if(projFilters){
    var chips = projFilters.querySelectorAll('.chip');
    var cards = document.querySelectorAll('.proj-card');
    projFilters.addEventListener('click', function(e){
      var chip = e.target.closest('.chip');
      if(!chip) return;
      var filter = chip.getAttribute('data-filter');

      chips.forEach(function(c){
        var active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      cards.forEach(function(card){
        card.hidden = filter !== 'all' && card.getAttribute('data-category') !== filter;
      });
    });
  }

  /* ---------- Dropdown management ---------- */
  var moreWrapper = document.getElementById('moreWrapper');
  var moreTrigger = document.getElementById('moreTrigger');
  var morePanel = document.getElementById('morePanel');

  var contactWrapper = document.getElementById('contactWrapper');
  var contactTrigger = document.getElementById('contactTrigger');
  var contactPanel = document.getElementById('contactPanel');

  var heroContactBtn = document.getElementById('heroContactBtn');

  function closeAllDropdowns(){
    [morePanel, contactPanel].forEach(function(panel){
      panel.classList.remove('open');
    });
    [moreWrapper, contactWrapper].forEach(function(wrapper){
      wrapper.classList.remove('open');
    });
    [moreTrigger, contactTrigger].forEach(function(trigger){
      trigger.setAttribute('aria-expanded','false');
    });
  }

  function openDropdown(panel, wrapper, trigger){
    closeAllDropdowns();
    panel.classList.add('open');
    wrapper.classList.add('open');
    trigger.setAttribute('aria-expanded','true');
  }

  /* MORE: hover-open with close delay + click toggle (touch fallback) */
  var moreCloseTimer = null;
  moreWrapper.addEventListener('mouseenter', function(){
    clearTimeout(moreCloseTimer);
    openDropdown(morePanel, moreWrapper, moreTrigger);
  });
  moreWrapper.addEventListener('mouseleave', function(){
    moreCloseTimer = setTimeout(function(){
      morePanel.classList.remove('open');
      moreWrapper.classList.remove('open');
      moreTrigger.setAttribute('aria-expanded','false');
    }, 120);
  });
  moreTrigger.addEventListener('click', function(e){
    e.stopPropagation();
    if(morePanel.classList.contains('open')){
      closeAllDropdowns();
    } else {
      openDropdown(morePanel, moreWrapper, moreTrigger);
    }
  });

  /* CONTACT: click only */
  contactTrigger.addEventListener('click', function(e){
    e.stopPropagation();
    if(contactPanel.classList.contains('open')){
      closeAllDropdowns();
    } else {
      openDropdown(contactPanel, contactWrapper, contactTrigger);
    }
  });

  /* Hero "Get in Touch" opens the same nav contact dropdown (index.html only) */
  if(heroContactBtn){
    heroContactBtn.addEventListener('click', function(e){
      e.stopPropagation();
      openDropdown(contactPanel, contactWrapper, contactTrigger);
    });
  }

  /* Close everything on outside click */
  document.addEventListener('click', function(e){
    if(!e.target.closest('.dropdown-wrapper')){
      closeAllDropdowns();
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ closeAllDropdowns(); }
  });

  /* ---------- Mobile navigation panel (hamburger, below 900px) ----------
     Deliberately independent of the MORE/CONTACT dropdown code above: it
     never calls openDropdown()/closeAllDropdowns() and never touches
     moreWrapper/contactWrapper/contactPanel, so the two systems can't
     interfere with each other. Guarded as a unit (unlike the dropdown
     elements above, which every page is assumed to already have). */
  var mobileMenuToggle = document.getElementById('mobileMenuToggle');
  var mobileNavPanel = document.getElementById('mobileNavPanel');

  if(mobileMenuToggle && mobileNavPanel){
    var mobileContactToggle = document.getElementById('mobileContactToggle');
    var mobileContactDetails = document.getElementById('mobileContactDetails');
    var lastFocusedBeforeMenu = null;

    function focusableInMobilePanel(){
      return Array.prototype.filter.call(
        mobileNavPanel.querySelectorAll('a[href], button'),
        function(el){ return el.offsetParent !== null; }
      );
    }

    function onMobileMenuKeydown(e){
      if(e.key === 'Escape'){
        closeMobileMenu();
        return;
      }
      if(e.key === 'Tab'){
        var focusable = focusableInMobilePanel();
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

    function openMobileMenu(){
      lastFocusedBeforeMenu = document.activeElement;
      mobileNavPanel.hidden = false;
      mobileNavPanel.classList.add('is-open');
      mobileMenuToggle.classList.add('is-open');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      var focusable = focusableInMobilePanel();
      (focusable[0] || mobileNavPanel).focus();

      document.addEventListener('keydown', onMobileMenuKeydown);
    }

    function closeMobileMenu(){
      mobileNavPanel.hidden = true;
      mobileNavPanel.classList.remove('is-open');
      mobileMenuToggle.classList.remove('is-open');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onMobileMenuKeydown);

      /* Collapse the in-panel Contact accordion too, so the panel doesn't
         reopen mid-scroll next time. */
      if(mobileContactDetails){
        mobileContactDetails.hidden = true;
        if(mobileContactToggle){ mobileContactToggle.setAttribute('aria-expanded', 'false'); }
      }

      if(lastFocusedBeforeMenu){
        lastFocusedBeforeMenu.focus();
        lastFocusedBeforeMenu = null;
      }
    }

    mobileMenuToggle.addEventListener('click', function(){
      if(mobileNavPanel.hidden){
        openMobileMenu();
      } else {
        closeMobileMenu();
      }
    });

    /* Any real navigational link inside the panel closes it. The Contact
       accordion toggle is deliberately excluded below — it's a <button>,
       not a link, and reveals content in place rather than navigating. */
    mobileNavPanel.querySelectorAll('a[href]').forEach(function(link){
      link.addEventListener('click', closeMobileMenu);
    });

    /* In-panel CONTACT accordion: a second, independent copy of the
       phone/email/location/social content already in #contactPanel above,
       laid out for a full-screen stack instead of an anchored popover.
       This intentionally does not reuse openDropdown() — see file header. */
    if(mobileContactToggle && mobileContactDetails){
      mobileContactToggle.addEventListener('click', function(){
        var opening = mobileContactDetails.hidden;
        mobileContactDetails.hidden = !opening;
        mobileContactToggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
      });
    }
  }
})();
