if (window.DatArchive) {
  document.querySelectorAll('[data-dat]').forEach(function (a) {
    a.setAttribute('href', a.dataset.dat)
  })
}