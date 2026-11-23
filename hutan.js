/* Halaman hutan memang tidak menampilkan angka yang diklaim real-time.
   Pengguna diarahkan ke dataset asli karena periode dan definisinya berbeda. */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".forest-source-list a");
    links.forEach(function (link) {
      link.addEventListener("keydown", function (event) {
        if (event.key === "Enter") link.click();
      });
    });
  });
})();
