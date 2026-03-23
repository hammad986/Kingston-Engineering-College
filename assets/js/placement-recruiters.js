(function () {
  'use strict';

  var allRecruiters = [];
  var activeFilter = 'All';

  function getInitials(name) {
    return name.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
  }

  function buildCard(r) {
    return '<div class="pr-card" data-category="' + r.category + '" data-aos="fade-up">' +
      '<div class="pr-logo-wrap">' +
        '<img src="' + r.logo_url + '" alt="' + r.name + '" class="pr-logo" ' +
          'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<div class="pr-initials" style="display:none">' + getInitials(r.name) + '</div>' +
      '</div>' +
      '<div class="pr-info">' +
        '<div class="pr-company-name">' + r.name + '</div>' +
        '<div class="pr-badge pr-badge-' + r.category.toLowerCase() + '">' + r.category + '</div>' +
        '<div class="pr-roles">' + r.roles.slice(0, 2).join(', ') + '</div>' +
        '<div class="pr-pkg">' + r.package_range + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderGrid(list) {
    var grid = document.getElementById('recruiters-grid');
    var empty = document.getElementById('recruiters-empty');
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';
    grid.innerHTML = list.map(buildCard).join('');
    if (window.AOS) AOS.refresh();
  }

  function filterRecruiters(cat) {
    activeFilter = cat;
    var filtered = cat === 'All'
      ? allRecruiters
      : allRecruiters.filter(function (r) { return r.category === cat; });
    renderGrid(filtered);

    document.querySelectorAll('.pr-filter-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.cat === cat);
    });
  }

  function initFilters() {
    document.querySelectorAll('.pr-filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterRecruiters(btn.dataset.cat);
      });
    });
  }

  function init() {
    var section = document.getElementById('recruiters-section');
    if (!section) return;

    fetch('data/recruiters.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        allRecruiters = data;
        initFilters();
        renderGrid(allRecruiters);
      })
      .catch(function (e) { console.warn('placement-recruiters.js: fetch error', e); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
