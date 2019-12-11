import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap';
import { lazyInit } from './lazyinit';
import { dateSinglePicker } from './dateSinglePicker';
import { validateForm } from './validateForm';
import { copyText } from './clipboard';
import { paginationStyle } from './pagination-style';
import { validateEnrollment } from './validate-enrollment';
import { comparePassword } from '../../../shared/public/javascript/compare-password';
import { removeItem }  from './modals/confirm-form';
import 'lightpick/css/lightpick.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/fonts/fontawesome-webfont.ttf';
import 'font-awesome/css/font-awesome.css';
import '../styles/main.less';
import { validateAccountUpdate } from '@fc/shared/public/javascript/validateAccountUpdate';

const initMap = {
  datePicker: dateSinglePicker,
  validateRnippForm: validateForm,
  copyText: copyText,
  paginationStyle: paginationStyle,
  validateEnrollment: validateEnrollment,
  comparePassword: comparePassword,
  removeItem: removeItem,
  validateAccountUpdate: validateAccountUpdate,
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
