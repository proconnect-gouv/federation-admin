import $ from 'jquery';
import moment from 'moment';
import { lazyInit } from './lazy-init';
import { confirmDialogWithTotp } from './modals/confirm-dialog';

let INDEX = 0;
let CITIZEN_STATUS_TARGET = '#citizen-status';
let CITIZEN_IDP_PREFERENCE_TARGET = '#citizen-idp-preferences';

const API = {
  checkUser: `${window.APP_ROOT || ''}/citizen`,
  setPreferences: `${window.APP_ROOT || ''}/preferences/idpPreferences`,
  setFuturIdp: `${window.APP_ROOOT || ''}/preferences/futureIdp`,
};

const ajaxCalls = {
  citizenStatus: {
    target: CITIZEN_STATUS_TARGET,
    done: updateUISuccessPost,
    fail: updateUIError.bind(null, CITIZEN_STATUS_TARGET),
    always: initUIActiveButton,
  },
  idpPreferences: {
    target: CITIZEN_IDP_PREFERENCE_TARGET,
    done: updateUIPreferencesPost,
    fail: updateUIError.bind(null, CITIZEN_IDP_PREFERENCE_TARGET),
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
  const elmIndex = element.getAttribute('data-element-index');

  element.addEventListener(
    'submit',
    function(event) {
      event.preventDefault();
      event.stopPropagation();

      confirmDialogWithTotp(`${elmAction}`, (confirm, totp) => {
        if (confirm) {
          $(`#${elmId} input[name="_totp"]`).val(totp);
          postAjaxForm($(`#${elmId}`), elmIndex, ajaxCalls.citizenStatus);
        }
      });
    },
    false,
  );
}

function toggleIdpPreferences(element) {
  const elmId = element.getAttribute('data-element-id');
  const elmAction = element.getAttribute('data-element-action');
  const elmIndex = element.getAttribute('data-element-index');

  element.addEventListener(
    'submit',
    function(event) {
      event.preventDefault();
      event.stopPropagation();

      confirmDialogWithTotp(`${elmAction}`, (confirm, totp) => {
        if (confirm) {
          $(`#${elmId} input[name="_totp"]`).val(totp);
          postAjaxForm($(`#${elmId}`), elmIndex, ajaxCalls.idpPreferences);
        }
      });
    },
    false,
  );
}

function checkUser(httpOptions, index, callback = () => {}) {
  $.ajax(API.checkUser, httpOptions)
    .done((...args) => {
      updateUISuccess(index, ...args);
      updateUIPreferencesInit(index, ...args);
    })
    .fail(updateUIError.bind(null, `${CITIZEN_STATUS_TARGET}-${index}`))
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
    } = __RNIPP_DATA_RESULTS__[INDEX].person.rectifiedIdentity;

    const action = idp.isChecked === false ? 'Autoriser' : 'Bloquer';

    li += `
      <li class="pad-15 marg-15" data-testid="${idp.name}">
          <form name="idpPreferencesForm${idp.uid}"
          method="POST" id="idpPreferencesToogle-${idp.uid}-${INDEX}"
            class="d-flex align-items-center"
            action="${API.setPreferences}?_method=PATCH"
            data-element-index="${INDEX}"
            data-init="toggleIdpPreferences"
            data-element-type="l'accès à FranceConnect pour cet usager"
            data-element-title="${givenName} ${familyName}" data-element-id="idpPreferencesToogle-${
      idp.uid
    }-${INDEX}"
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
            <input type="hidden" name="birthLocation" value="${birthPlace ||
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
  } = __RNIPP_DATA_RESULTS__[INDEX].person.rectifiedIdentity;

  return `
    <form name="allowFutureIdpToogleForm" method="POST" id="allowFutureIdpToogle-${INDEX}"
      class="d-flex align-items-center"
      action="${API.setFuturIdp}?_method=PATCH"
      data-init="toggleIdpPreferences"
      data-element-index="${INDEX}"
      data-element-type="l'accès à FranceConnect pour cet usager"
      data-element-title="${givenName} ${familyName}" data-element-id="allowFutureIdpToogle-${INDEX}"
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
      <input type="hidden" name="birthLocation" value="${birthPlace ||
        birthCountry}" />
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

function updateUIPreferencesPost(data) {
  updateUIPreferences(INDEX, data);
}

function updateUIPreferencesInit(index, data) {
  updateUIPreferences(index, data);
}

function updateUIPreferences(index, data) {
  let userIdpList;
  let futuresIdpPreferences;
  if (data.havePreferencesSettings && data.userIdpSettings) {
    if (data.userIdpSettings.idpList) {
      userIdpList = createUserIdpList(data.userIdpSettings.idpList);
      futuresIdpPreferences = createFuturesIdpPreferences(
        data.userIdpSettings.allowFutureIdp,
      );
    }

    $(`${CITIZEN_IDP_PREFERENCE_TARGET}-${index}`).html(`

      ${
        userIdpList
          ? `<p>${futuresIdpPreferences}</p> <ul>${userIdpList}</ul>`
          : ''
      }
    `);
  }

  lazyInit(
    { toggleIdpPreferences },
    `${CITIZEN_IDP_PREFERENCE_TARGET}-${index}`,
  );
}

function updateUISuccessPost(data) {
  createCitizenStatusUi(INDEX, data);
}

function updateUISuccess(index, data) {
  createCitizenStatusUi(index, data);

  INDEX = index;
}

function createCitizenStatusUi(index, data) {
  const lastConnection = data.lastConnection
    ? `le ${moment(data.lastConnection).format('DD/MM/YYYY à HH:mm:ss')}`
    : 'Jamais';

  let accountIdHTML = '';
  if (data.accountId) {
    accountIdHTML = `<li><b>AccountId : </b><span data-testid="citizen-account-id">${data.accountId}</span></li>`;
  }

  $(`${CITIZEN_STATUS_TARGET}-${index}`).html(`
    <ul>
      <li><b>Actif :</b> ${
        data.active
          ? '<span class="badge badge-success" data-testid="citizen-account-status">Oui</span>'
          : '<span class="badge badge-danger" data-testid="citizen-account-status">Non</span>'
      }</li>
      <li><b>Dernière connexion : </b><span data-testid="citizen-account-last-connection">${lastConnection}</span></li>
      ${accountIdHTML}
    </ul>
  `);
}

function setLoadingUI(selector) {
  $(selector).html('<div class="spinner"><i></i></div> Chargement...');
}

function postAjaxForm(form, index, options) {
  setLoadingUI(`${options.target}-${index}`);

  INDEX = index;

  $.ajax({
    method: 'POST',
    url: form.attr('action'),
    data: form.serialize(),
  })
    .done(options.done)
    .fail(options.fail)
    .always(options.always);
}

export function checkUserStatus(callback) {
  if (typeof __RNIPP_DATA_RESULTS__ === 'undefined') {
    return;
  }

  const csrfToken = getCSRFToken();

  __RNIPP_DATA_RESULTS__.forEach(
    ({ person: { rectifiedIdentity }, rnippResponse: { code } }, index) => {
      const httpOptions = {
        method: 'POST',
        data: rectifiedIdentity,
        headers: { 'CSRF-Token': csrfToken },
      };

      const identityFound = ~~code < __RECTIFY_RESPONSE_CODES__.error;
      if (identityFound) {
        checkUser(httpOptions, index, callback);
      }
    },
  );
}

export function initUIActiveButton(data) {
  // Errors handling
  if (data.status && data.status !== 404) {
    $(`${CITIZEN_STATUS_TARGET}-${INDEX}`).html(`
      Une erreur est survenue : ${data.responseText}.
      <br />
      <button class="btn btn-primary" data-init="reloadSearch">Relancer la recherche</button>
    `);

    return lazyInit({ reloadSearch }, `${CITIZEN_STATUS_TARGET}-${INDEX}`);
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
  } = __RNIPP_DATA_RESULTS__[INDEX].person.rectifiedIdentity;

  const html = `
  <form name="deleteForm" method="POST" id="delete-activationToogle-${INDEX}"
    action="${API.checkUser}?_method=PATCH"
    class="d-flex align-items-center"
    data-init="toggleCitizenActive"
    data-element-index="${INDEX}"
    data-element-type="l'accès à FranceConnect pour cet usager"
    data-element-title="${givenName} ${familyName}" data-element-id="delete-activationToogle-${INDEX}"
    data-element-action="Voulez vous ${action.toLowerCase()} ${givenName} ${familyName} ?"
    novalidate
  >
    <input type="hidden" name="preferredUsername" value="${preferredUsername ||
      ''}" />
    <input type="hidden" name="familyName" value="${familyName}" />
    <input type="hidden" name="givenName" value="${givenName}" />
    <input type="hidden" name="birthdate" value="${birthdate}" />
    <input type="hidden" name="isFrench" value="${birthCountry === '99100'}" />
    <input type="hidden" name="birthLocation" value="${birthPlace ||
      birthCountry}" />
    <input type="hidden" name="gender" value="${gender}" />
    <input type="hidden" name="supportId" value="${__SUPPORT_ID__}" />
    <input type="hidden" name="active" value="${
      data.active ? 'false' : 'true'
    }" />
    <input type="hidden" name="_csrf" value="${getCSRFToken()}">
    <input type="hidden" name="_totp">


    <div class="form-group" id="citizen-management">
    <button type="submit" class="btn btn-warning" data-testid="citizen-disable-account-button" ${action ===
      'Activer' && 'disabled'}>
      Désactiver
    </button>
    &nbsp;
    <button type="submit" class="btn btn-warning" data-testid="citizen-enable-account-button" ${action ===
      'Désactiver' && 'disabled'}>
      Activer
    </button>
    </div>
  </form>
  `;

  $(`${CITIZEN_STATUS_TARGET}-${INDEX}`).append(html);

  lazyInit({ toggleCitizenActive }, `${CITIZEN_STATUS_TARGET}-${INDEX}`);
}
