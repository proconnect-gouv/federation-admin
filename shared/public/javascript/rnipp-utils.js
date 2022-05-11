import $ from 'jquery';
import moment from 'moment';
import { confirmDialogWithTotp } from './modals/confirm-dialog';
import { lazyInit } from './lazy-init';

const API = {
  checkUser: `${window.APP_ROOT || ''}/citizen`,
  setPreferences: `${window.APP_ROOT || ''}/preferences/idpPreferences`,
  setFuturIdp: `${window.APP_ROOOT || ''}/preferences/futureIdp`,
};

const ajaxCalls = {
  citizenStatus: {
    target: '#citizen-status',
    done: updateUISuccess,
    fail: updateUIError.bind(null, '#citizen-status'),
    always: initUIActiveButton,
  },
  idpPreferences: {
    target: '#citizen-idp-preferences',
    done: updateUIPreferences,
    fail: updateUIError.bind(null, '#citizen-idp-preferences'),
    always: (...args) => {
      createUserIdpList(...args);
      createFuturesIdpPreferences(...args);
    },
  },
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
    function(event) {
      event.preventDefault();
      event.stopPropagation();

      confirmDialogWithTotp(`${elmAction}`, (confirm, totp) => {
        if (confirm) {
          $(`#delete-${elmId} input[name="_totp"]`).val(totp);
          postAjaxForm($(`#delete-${elmId}`), ajaxCalls.citizenStatus);
        }
      });
    },
    false,
  );
}

function toogleIdpPreferences(element) {
  const elmId = element.getAttribute('data-element-id');
  const elmAction = element.getAttribute('data-element-action');

  element.addEventListener(
    'submit',
    function(event) {
      event.preventDefault();
      event.stopPropagation();

      confirmDialogWithTotp(`${elmAction}`, (confirm, totp) => {
        if (confirm) {
          $(`#${elmId} input[name="_totp"]`).val(totp);
          postAjaxForm($(`#${elmId}`), ajaxCalls.idpPreferences);
        }
      });
    },
    false,
  );
}

function checkUser(httpOptions, callback = () => {}) {
  $.ajax(API.checkUser, httpOptions)
    .done((...args) => {
      updateUISuccess(...args);
      updateUIPreferences(...args);
    })
    .fail(updateUIError.bind(null, '#citizen-status'))
    .always(callback);
}

function updateUIError(target, data) {
  let content = 'Une erreur technique est survenue';

  if (data.status === 404) {
    content = 'Inconnu(e) de FranceConnect';
  }

  $(target).html(`<p>${content}</p>`);
}

function createUserIdpList(list) {
  let li = '';
  let myList;

  if (!Array.isArray(list)) {
    myList = list.userIdpSettings.idpList;
  } else {
    myList = list;
  }

  myList.forEach(idp => {
    const idpBadge = idp.isChecked
      ? 'label-idp-preferences-success'
      : 'label-idp-preferences-danger';
    const idpLabel = idp.isChecked ? 'Autorisé' : 'Bloqué';
    const btnColor = idp.isChecked ? 'danger' : 'success';
    const btnLabel = idp.isChecked ? 'Bloquer' : 'Autoriser';

    const {
      preferredUsername,
      familyName,
      givenName,
      birthdate,
      birthPlace,
      birthCountry,
      gender,
    } = __RNIPP_DATA__;

    const action = idp.isChecked === false ? 'Autoriser' : 'Bloquer';

    li += `
      <li class="pad-15 marg-15" data-testid="${idp.name}">
          <form name="idpPreferencesForm${idp.uid}"
          method="POST" id="idpPreferencesToogle-${idp.uid}"
            class="d-flex align-items-center"
            action="${API.setPreferences}?_method=PATCH"
            data-init="toogleIdpPreferences"
            data-element-type="l'accès à FranceConnect pour cet usager"
            data-element-title="${givenName} ${familyName}" data-element-id="idpPreferencesToogle-${
      idp.uid
    }"
            data-element-action="Voulez vous ${action.toLowerCase()} ${
      idp.title
    } ?"
            novalidate>
            <strong data-testid="idp-title-label">${
              idp.title
            } est <span data-testid="idp-status-label" class="${idpBadge}">${idpLabel}</span></strong>
            <input type="hidden" name="preferredUsername" value="${preferredUsername ||
              ''}" />
            <input type="hidden" name="familyName" value="${familyName}" />
            <input type="hidden" name="givenName" value="${givenName}" />
            <input type="hidden" name="birthdate" value="${birthdate}" />
            <input type="hidden" name="isFrench" value="${birthCountry ===
              '99100'}" />
            <input type="hidden" name="cog" value="${birthPlace ||
              birthCountry}" />
            <input type="hidden" name="gender" value="${gender}" />
            <input type="hidden" name="supportId" value="${__SUPPORT_ID__}" />
            <input type="hidden" name="_csrf" value="${getCSRFToken()}">
            <input type="hidden" name="_totp">
            <input type="hidden" name="uid" value="${idp.uid}" />
            <input type="hidden" name="isChecked" value="${idp.isChecked}" />
            ${
              __APP_NAME__ === 'FC_EXPLOITATION'
                ? `<button type="submit" data-testid="idp-action-button" class="btn-idp-preferences right btn-${btnColor}">${btnLabel}</button>`
                : ''
            }
          </form>
      </li>
    `;
  });
  return li;
}

function createFuturesIdpPreferences(allowFutureIdp) {
  const futurIdpBadge = allowFutureIdp
    ? 'label-idp-preferences-success'
    : 'label-idp-preferences-danger';
  const futurIdpLabel = allowFutureIdp ? 'Autorisés' : 'Bloqués';
  const futurIdpBtn = allowFutureIdp ? 'danger' : 'success';
  const futurIdpBtnLabel = allowFutureIdp ? 'Bloquer' : 'Autoriser';

  const action = allowFutureIdp ? 'Bloquer' : 'Autoriser';

  const {
    preferredUsername,
    familyName,
    givenName,
    birthdate,
    birthPlace,
    birthCountry,
    gender,
  } = __RNIPP_DATA__;

  return `
    <form name="allowFutureIdpToogleForm" method="POST" id="allowFutureIdpToogle"
      class="d-flex align-items-center"
      action="${API.setFuturIdp}?_method=PATCH"
      data-init="toogleIdpPreferences"
      data-element-type="l'accès à FranceConnect pour cet usager"
      data-element-title="${givenName} ${familyName}" data-element-id="allowFutureIdpToogle"
      data-element-action="Voulez vous ${action.toLowerCase()} les Futurs fournisseurs d'identités ?"
      novalidate>
      <b>Les futurs fournisseurs d'identité sont : </b><span data-testid="future-idp-status-label" class="${futurIdpBadge}">${futurIdpLabel}</span>
      <input type="hidden" name="preferredUsername" value="${preferredUsername ||
        ''}" />
      <input type="hidden" name="familyName" value="${familyName}" />
      <input type="hidden" name="givenName" value="${givenName}" />
      <input type="hidden" name="birthdate" value="${birthdate}" />
      <input type="hidden" name="isFrench" value="${birthCountry ===
        '99100'}" />
      <input type="hidden" name="cog" value="${birthPlace || birthCountry}" />
      <input type="hidden" name="gender" value="${gender}" />
      <input type="hidden" name="supportId" value="${__SUPPORT_ID__}" />
      <input type="hidden" name="_csrf" value="${getCSRFToken()}">
      <input type="hidden" name="_totp">
      <input type="hidden" name="allowFutureIdp" value="${allowFutureIdp}" />
      ${
        __APP_NAME__ === 'FC_EXPLOITATION'
          ? `<button type="submit" data-testid="future-idp-action-button" class="btn-idp-preferences right btn-${futurIdpBtn}">${futurIdpBtnLabel}</button>`
          : ''
      }
    </form>
  `;
}

function updateUIPreferences(data) {
  let userIdpList;
  let futuresIdpPreferences;
  if (data.havePreferencesSettings && data.userIdpSettings) {
    if (data.userIdpSettings.idpList) {
      userIdpList = createUserIdpList(data.userIdpSettings.idpList);
      futuresIdpPreferences = createFuturesIdpPreferences(
        data.userIdpSettings.allowFutureIdp,
      );
    }

    $('#citizen-idp-preferences').html(`
      
      ${
        userIdpList
          ? `<p>${futuresIdpPreferences}</p> <ul>${userIdpList}</ul>`
          : ''
      }
    `);
  }

  lazyInit({ toogleIdpPreferences }, '#citizen-idp-preferences');
}

function updateUISuccess(data) {
  const lastConnection = data.lastConnection
    ? `le ${moment(data.lastConnection).format('DD/MM/YYYY à HH:mm:ss')}`
    : 'Jamais';

  let accountIdHTML = '';
  if (data.accountId) {
    accountIdHTML = `<li><b>AccountId : </b>${data.accountId}</li>`;
  }

  $('#citizen-status').html(`
    <ul>
      <li><b>Actif :</b> ${
        data.active
          ? '<span class="badge badge-success">Oui</span>'
          : '<span class="badge badge-danger">Non</span>'
      }</li>
      <li><b>Dernière connexion :</b> ${lastConnection}</li>
      ${accountIdHTML}
    </ul>
  `);
}

function setLoadingUI(selector) {
  $(selector).html('<div class="spinner"><i></i></div> Chargement...');
}

function postAjaxForm(form, options) {
  setLoadingUI(options.target);

  $.ajax({
    method: 'POST',
    url: form.attr('action'),
    data: form.serialize(),
  })
    .done(options.done)
    .fail(options.fail)
    .always(options.always);
}

function initUI() {
  $('#result').append(`
    <h3>Statut de l'usager</h3>
    <div id="citizen-status"></div>
    ${
      __IDP_CORE_INSTANCE__ === 'CL'
        ? `<h3>Préférences FI</h3>
    <div id="citizen-idp-preferences"></div>`
        : ''
    }
  `);
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

  checkUser(httpOptions, callback);
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
    <input type="hidden" name="preferredUsername" value="${preferredUsername ||
      ''}" />
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
