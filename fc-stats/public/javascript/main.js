import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap';
import { lazyInit } from './lazyinit';
import { itemPerPage } from '@fc/shared/public/javascript/item-par-page';
import { dateRangePicker } from './dateRangePicker';
import { dropdown } from './dropdown';
import { paginationStyle } from '@fc/shared/public/javascript/pagination-style';
import { validateEnrollment } from './validate-enrollment';
import { comparePassword } from '../../../shared/public/javascript/compare-password';
import { removeItem } from '@fc/shared/public/javascript/modals/confirm-form';
import { initGraph, initGraphSetting } from './graph';
import 'lightpick/css/lightpick.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/fonts/fontawesome-webfont.ttf';
import 'font-awesome/css/font-awesome.css';
import '../style/main.less';
import { validateAccountUpdate } from '@fc/shared/public/javascript/validateAccountUpdate';
import { validateAccountCreate } from '@fc/shared/public/javascript/validateAccountCreate';


const initMap = {
  datePicker: dateRangePicker,
  graph: initGraph,
  graphSetting: initGraphSetting,
  dropdown,
  paginationStyle,
  validateEnrollment,
  comparePassword,
  removeItem,
  validateAccountUpdate,
  validateAccountCreate,
  itemPerPage,
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
