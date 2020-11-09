import $ from 'jquery';

export function initFirstResult(element) {
  // if there is no results displayed table #events is not generated in rendering template
  if (document.getElementById('autoload-results')) {
    // checked "Connexion" action in filters only for the first visit
    const actionContainer = $('#action-dropdown').find('.dropdown-container');
    actionContainer.append(`
      <div class="dropdown-item custom-control custom-checkbox my-1 mr-sm-2 text-nowrap">
        <input
          class="custom-control-input"
          type="checkbox"
          id="filters[]action:authentication"
          data-init="filters"
          value="action:authentication"
          name="filters[]"
          data-form="search"
          checked>
        <label class="custom-control-label justify-content-start" for="filters[]action:authentication">
          Connexion
        </label>
      </div>
    `);


    // then force loading
    document.forms['events'].submit();
  }
}