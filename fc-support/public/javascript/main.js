import 'babel-polyfill';
import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap';
import { lazyInit } from '@fc/shared/public/javascript/lazy-init';
import { itemPerPage } from '@fc/shared/public/javascript/item-par-page';
import { copyText } from '@fc/shared/public/javascript/clipboard';
import { validateEnrollment } from './validate-enrollment';
import { comparePassword } from '../../../shared/public/javascript/compare-password';
import { removeItem } from '@fc/shared/public/javascript/modals/confirm-form';
import { rnippForm } from '@fc/shared/public/javascript/rnipp-form';
import 'lightpick/css/lightpick.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/fonts/fontawesome-webfont.ttf';
import 'font-awesome/css/font-awesome.css';
import '../styles/main.less';
import { validateAccountUpdate } from '@fc/shared/public/javascript/validateAccountUpdate';
import { validateAccountCreate } from '@fc/shared/public/javascript/validateAccountCreate';

const initMap = {
  validateRnippForm: rnippForm,
  copyText,
  validateEnrollment,
  comparePassword,
  removeItem,
  validateAccountUpdate,
  validateAccountCreate,
  itemPerPage,
};

$(document).ready(function() {
  $('.nav-link[data-prefix]').each(function(index, link) {
    const prefix = $(link).attr('data-prefix');
    if (window.location.pathname.startsWith(prefix)) {
      $(link).addClass('active');
    }
  });

  lazyInit(initMap, 'body');
});
