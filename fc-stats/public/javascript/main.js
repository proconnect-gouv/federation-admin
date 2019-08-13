import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap';
import { lazyInit } from './lazyinit';
import { dateRangePicker } from './dateRangePicker'
import { filterForm } from './filterForm'
import { dropdown } from './dropdown'
import 'lightpick/css/lightpick.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/fonts/fontawesome-webfont.ttf';
import 'font-awesome/css/font-awesome.css';
import '../style/main.less';


const initMap = {
  datePicker: dateRangePicker,
  filters: filterForm,
  dropdown: dropdown,
};

$(document).ready(function() {
  $('.nav-link[data-prefix]').each(function(index, link) {
    var prefix = $(link).attr('data-prefix');
    if (window.location.pathname.startsWith(prefix)) {
      $(link).addClass('active');
    }
  });

  lazyInit(initMap, 'body');
});
