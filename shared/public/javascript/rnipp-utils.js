import $ from 'jquery';
import moment from 'moment';
import { confirmDialogWithTotp } from './modals/confirm-dialog';
import { lazyInit } from './lazy-init';

const API = {
  checkUser: `${window.APP_ROOT || ''}/citizen`,
};

function getCSRFToken() {
  return $('input[name="_csrf"]').val();
}

function reloadSearch(element) {
  $(element).on('click', () => $('#rnipp-form').submit());
}

function toggleCitizenActive(element) {
  const elmId = element.getAttribute('data-element-id');
  const elmAction = element.getAttribute('data-element-action');

  element.addEventListener(
    'submit',
    function (event) {
      event.preventDefault();
      event.stopPropagation();

      confirmDialogWithTotp(`${elmAction}`, (confirm, totp) => {
        if (confirm) {
          $(`#delete-${elmId} input[name="_totp"]`).val(totp);
          postAjaxForm($(`#delete-${elmId}`));
        }
      });
    },
    false,
  );
}

function checkUser(httpOptions, callback = () => { }) {
  $.ajax(API.checkUser, httpOptions)
    .done(updateUISuccess)
    .fail(updateUIError)
    .always(callback);
}

function updateUIError(data) {
  let content = 'Une erreur technique est survenue';

  if (data.status === 404) {
    content = 'Inconnu(e) de France connect';
  }

  $('#citizen-status').html(`<p>${content}</p>`);
}

function updateUISuccess(data) {
  const lastConnection = data.lastConnection
    ? `le ${moment(data.lastConnection).format('DD/MM/YYYY à HH:mm:ss')}`
    : 'Jamais';

  $('#citizen-status').html(`
    <ul>
      <li><b>Actif :</b> ${data.active ? '<span class="badge badge-success">Oui</span>' : '<span class="badge badge-danger">Non</span>' }</li>
      <li><b>Dernière connexion :</b> ${lastConnection}</li>
    </ul>
  `);
}

function setLoadingUI() {
  $('#citizen-status').html('<div class="spinner"><i></i></div> Chargement...');
}

function postAjaxForm(form) {
  setLoadingUI();

  $.ajax({
    method: 'POST',
    url: form.attr('action'),
    data: form.serialize(),
  })
    .done(updateUISuccess)
    .fail(updateUIError)
    .always(initUIActiveButton);
}

function initUI() {
  $('#result').append(`
    <h3>Statut de l'usager</h3>
    <div id="citizen-status"></div>
  `);

  setLoadingUI();
}

export function checkUserStatus(callback) {
  if (typeof __RNIPP_DATA__ === 'undefined') {
    return;
  }

  initUI();

  const csrfToken = getCSRFToken();

  const httpOptions = {
    method: 'POST',
    data: __RNIPP_DATA__,
    headers: { 'CSRF-Token': csrfToken },
  };

  checkUser(httpOptions, callback)
}

export function initUIActiveButton(data) {
  // Errors handling
  if (data.status && data.status !== 404) {
    $('#citizen-status').html(`
      Une erreur est survenue : ${data.responseText}.
      <br />
      <button class="btn btn-primary" data-init="reloadSearch">Relancer la recherche</button>
    `);

    return lazyInit({ reloadSearch }, '#citizen-status');
  }

  const action = data.active === false ? 'Activer' : 'Désactiver';

  const {
    preferredUsername,
    familyName,
    givenName,
    birthdate,
    birthPlace,
    birthCountry,
    gender,
  } = __RNIPP_DATA__;

  const html = `
  <form name="deleteForm" method="POST" id="delete-activationToogle"
    action="${API.checkUser}?_method=PATCH"
    class="d-flex align-items-center"
    data-init="toggleCitizenActive"
    data-element-type="l'accès à FranceConnect pour cet usager"
    data-element-title="${givenName} ${familyName}" data-element-id="activationToogle"
    data-element-action="Voulez vous ${action.toLowerCase()} ${givenName} ${familyName} ?"
    novalidate
  >
    <input type="hidden" name="preferredUsername" value="${preferredUsername || ''}" />
    <input type="hidden" name="familyName" value="${familyName}" />
    <input type="hidden" name="givenName" value="${givenName}" />
    <input type="hidden" name="birthdate" value="${birthdate}" />
    <input type="hidden" name="isFrench" value="${birthCountry === '99100'}" />
    <input type="hidden" name="cog" value="${birthPlace || birthCountry}" />
    <input type="hidden" name="gender" value="${gender}" />
    <input type="hidden" name="supportId" value="${__SUPPORT_ID__}" />
    <input type="hidden" name="active" value="${
    data.active ? 'false' : 'true'
    }" />
    <input type="hidden" name="_csrf" value="${getCSRFToken()}">
    <input type="hidden" name="_totp">


    <div class="form-group" id="citizen-management">
    <button type="submit" class="btn btn-warning" ${action === 'Activer' &&
    'disabled'}>
      Désactiver
    </button>
    &nbsp;
    <button type="submit" class="btn btn-warning" ${action === 'Désactiver' &&
    'disabled'}>
      Activer
    </button>
    </div>
  </form>
  `;

  $('#citizen-status').append(html);

  lazyInit({ toggleCitizenActive }, '#citizen-status');
}
