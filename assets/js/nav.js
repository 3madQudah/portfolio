/* nav.js — navbar dropdown behavior, shared by every page:
     - MORE: hover-open with a short close delay, plus a click toggle
       (touch fallback), used for the Skills / Resume panel.
     - CONTACT: click-open only, used for the phone / email / location panel.
     - Closes any open dropdown on outside click or Escape.
   Also generates the hero waveform bars, and wires up the projects filter
   chips — both guarded so they're a no-op on any page without the
   relevant element (#waveform on index.html, .proj-filters on
   projects.html). It lives here rather than in a third/fourth file since
   the project's assets/js/ only defines theme.js and nav.js. */
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
})();
