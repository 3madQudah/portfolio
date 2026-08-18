/* section-nav.js — shared collapsible section navigator.
   Used on projects.html, experience.html, and certifications.html: a small
   left-edge pill that expands (hover/focus) into a jump-list of that page's
   items, with the current item tracked via IntersectionObserver as the user
   scrolls.

   One mount point per page drives it entirely from data attributes, so the
   markup/config lives in the page and this file stays generic:

     <div id="sectionNav"
          data-page-label="Projects"
          data-item-selector=".proj-card.proj-feature"
          data-title-selector=".proj-feature-title"></div>

   Each element matched by data-item-selector MUST already have a stable id
   in the page markup — this script links to and observes those ids, it does
   not invent them. It's a no-op (returns early) on any page without a
   #sectionNav mount, or where the selectors don't resolve to any items.

   Pairing is id-keyed throughout (Map<id, ...>), never by array index — a
   link's href, the section it observes, and the "active" state it can
   receive are all looked up by the same id string. There is no point in
   this file where "item N" is assumed to correspond to "section N"; the
   only place a numeric index appears is the position badge's display text,
   which is derived by looking an id up in the map's key order, not the
   other way around. */
(function(){
  "use strict";

  var mount = document.getElementById('sectionNav');
  if(!mount) return;

  var pageLabel = mount.getAttribute('data-page-label') || '';
  var itemSelector = mount.getAttribute('data-item-selector');
  var titleSelector = mount.getAttribute('data-title-selector');
  if(!itemSelector || !titleSelector) return;

  /* id -> { el, title } — the single source of truth every other map is
     built from, so a link and its observed section can never drift apart. */
  var sectionMap = new Map();
  Array.prototype.forEach.call(document.querySelectorAll(itemSelector), function(sec){
    if(!sec.id) return; // an item without an id can't be linked or observed
    var titleEl = sec.querySelector(titleSelector);
    sectionMap.set(sec.id, {
      el: sec,
      title: titleEl ? titleEl.textContent.trim() : ''
    });
  });
  if(sectionMap.size === 0) return;

  /* Anchor-jump target clearance: read the navbar's real rendered height
     (it's position:sticky, so its on-screen box is the same whether the
     page is scrolled or not) rather than hardcoding a pixel figure that
     would silently go stale if the navbar's height ever changes. */
  var navbar = document.querySelector('.navbar');
  var scrollGap = 16;
  var headerClearance = navbar ? Math.ceil(navbar.getBoundingClientRect().bottom) + scrollGap : scrollGap;
  sectionMap.forEach(function(info){
    info.el.style.scrollMarginTop = headerClearance + 'px';
  });

  /* ---------- build markup ---------- */
  var nav = document.createElement('nav');
  nav.className = 'sec-nav';
  nav.setAttribute('aria-label', pageLabel + ' section navigator');

  var collapsed = document.createElement('div');
  collapsed.className = 'sec-nav-collapsed';
  collapsed.setAttribute('aria-hidden', 'true'); /* decorative summary only — the real, keyboard-reachable nav is the expanded list below */

  var glyph = document.createElement('span');
  glyph.className = 'sec-nav-glyph';
  glyph.innerHTML = '<span></span><span></span><span></span>';
  collapsed.appendChild(glyph);

  var indexBadge = document.createElement('span');
  indexBadge.className = 'sec-nav-index';
  var indexNum = document.createElement('span');
  indexNum.className = 'sec-nav-index-num';
  indexNum.textContent = '1';
  indexBadge.appendChild(indexNum);
  collapsed.appendChild(indexBadge);

  var expanded = document.createElement('div');
  expanded.className = 'sec-nav-expanded';

  var label = document.createElement('span');
  label.className = 'sec-nav-label';
  label.textContent = pageLabel;
  expanded.appendChild(label);

  var divider = document.createElement('div');
  divider.className = 'sec-nav-divider';
  expanded.appendChild(divider);

  var list = document.createElement('ul');
  list.className = 'sec-nav-list';

  var linkMap = new Map(); // id -> <a>
  sectionMap.forEach(function(info, id){
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.className = 'sec-nav-item';
    a.href = '#' + id;
    var dot = document.createElement('span');
    dot.className = 'sec-nav-dot';
    dot.setAttribute('aria-hidden', 'true');
    var titleSpan = document.createElement('span');
    titleSpan.className = 'sec-nav-item-title';
    titleSpan.textContent = info.title;
    a.appendChild(dot);
    a.appendChild(titleSpan);
    li.appendChild(a);
    list.appendChild(li);
    linkMap.set(id, a);
  });

  expanded.appendChild(list);
  nav.appendChild(collapsed);
  nav.appendChild(expanded);
  mount.replaceWith(nav);

  /* ---------- active-item state ---------- */
  var orderedIds = Array.from(sectionMap.keys()); // display-order only, used solely for the position badge's number
  var activeId = null;

  function setActive(id){
    if(id === activeId || !linkMap.has(id)) return;
    activeId = id;
    linkMap.forEach(function(a, linkId){
      var active = linkId === id;
      a.classList.toggle('is-active', active);
      if(active){ a.setAttribute('aria-current', 'true'); }
      else { a.removeAttribute('aria-current'); }
    });
    indexNum.textContent = String(orderedIds.indexOf(id) + 1);
  }

  function centerDistance(rect){
    var viewportMid = window.innerHeight / 2;
    var elMid = rect.top + rect.height / 2;
    return Math.abs(elMid - viewportMid);
  }

  /* Initial active item, computed synchronously from current layout —
     IntersectionObserver's first callback is async, so without this the
     pill would show nothing (or a stale default) until the user scrolls. */
  function computeClosestToMiddle(){
    var bestId = null, bestDist = Infinity;
    sectionMap.forEach(function(info, id){
      var d = centerDistance(info.el.getBoundingClientRect());
      if(d < bestDist){ bestDist = d; bestId = id; }
    });
    return bestId;
  }
  setActive(computeClosestToMiddle());

  /* ---------- scroll tracking via IntersectionObserver ---------- */
  var idByEl = new Map();
  sectionMap.forEach(function(info, id){ idByEl.set(info.el, id); });

  var visible = new Map(); // id -> IntersectionObserverEntry

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var id = idByEl.get(entry.target);
      if(!id) return;
      if(entry.isIntersecting){
        visible.set(id, entry);
      } else {
        visible.delete(id);
      }
    });
    if(visible.size === 0) return;
    var bestId = null, bestDist = Infinity;
    visible.forEach(function(entry, id){
      var d = centerDistance(entry.boundingClientRect);
      if(d < bestDist){ bestDist = d; bestId = id; }
    });
    if(bestId !== null) setActive(bestId);
  }, {
    root: null,
    /* Shrinks the effective viewport to a thin band around its vertical
       middle, so a section only counts as "intersecting" — and eligible to
       become active — once it reaches roughly the middle of the screen. */
    rootMargin: '-45% 0px -45% 0px',
    threshold: 0
  });

  sectionMap.forEach(function(info){ observer.observe(info.el); });
})();
