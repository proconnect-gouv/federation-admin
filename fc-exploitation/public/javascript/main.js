import $ from "jquery";
import "bootstrap/dist/js/bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/fonts/fontawesome-webfont.ttf";
import "font-awesome/css/font-awesome.css";
import "../style/main.less";

$(document).ready(function() {
  $(".nav-link[data-prefix]").each(function(index, link) {
    var prefix = $(link).attr("data-prefix");
    if (window.location.pathname.startsWith(prefix)) {
      $(link).addClass("active");
    }
  });
});
