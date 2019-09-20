import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap';
import Chart from 'chart.js';
import { lazyInit } from './lazyinit';
import { dateRangePicker } from './dateRangePicker';
import { filterForm } from './filterForm';
import { filterChart } from './filterChart';
import { dropdown } from './dropdown';
import { chartsList } from './charts-list';
import { paginationStyle } from './pagination-style';
import { validateEnrollment } from './validate-enrollment';
import { comparePassword } from './compare-password';
import { removeItem }  from './confirm-form';
import 'lightpick/css/lightpick.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/fonts/fontawesome-webfont.ttf';
import 'font-awesome/css/font-awesome.css';
import '../style/main.less';


const initMap = {
  datePicker: dateRangePicker,
  filters: filterForm,
  filterChart: filterChart,
  dropdown: dropdown,
  chartsList: chartsList,
  paginationStyle: paginationStyle,
  validateEnrollment: validateEnrollment,
  comparePassword: comparePassword,
  removeItem: removeItem,
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
