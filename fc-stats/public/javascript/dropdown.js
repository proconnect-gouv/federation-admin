import $ from 'jquery';

let name;
let items;
let search;
let filters;
let container;
let limitItems = 10;

export function dropdown(element) {
  element.addEventListener('click', () => {
    $('.dropdown-menu').on('click', event => {
      event.stopPropagation();
    });

    const dropdownElem = $(element);
    if (dropdownElem.hasClass('search')) {

      ({ name, items = [], filters = [] } = dropdownElem.data());
      container = dropdownElem.next('.dropdown-menu.search').find('.dropdown-container');

      // get filters already selected, checked it in thedropdown and sort items
      items
        .filter(({ key }) => filters.includes(key))
        .forEach(item => { 
          item.checked = true;
        });
      items.sort(sortItems);

      generateItems();
      $('.dropdown-menu.search').on('keyup', 'input[type=text]', event => {
        search = event.target.value.toLowerCase();

        generateItems();
      });

      container.on('click', '.dropdown-item input[type=checkbox]', event => {
        items
          .filter(({ value }) => value === event.target.value)
          .forEach(item => {
            item.checked = !item.checked;
          });
        items.sort(sortItems);

        generateItems();
      });
    }
  }, true);
}

function generateItems() {
  let itemsDisplayed = 0;

  container.empty();
  items.forEach(item => {
    if (!search || item.key.toLowerCase().includes(search)) {
      if(itemsDisplayed < limitItems || item.checked) {
        container.append(generateHTML(item));
        itemsDisplayed++;
      }
    } else if (item.checked) {
      container.append(generateHTML(item, true))
    }
  });

  if (itemsDisplayed >= limitItems && itemsDisplayed < items.length) {
    container.append(`
      <div id="display-more">
        <p style="text-align: center; margin: 0; font-size: 1.5rem">
          ...
        </p>
      </div>
    `);
  }
}

function generateHTML(item, hidden = false) {
  return `
    <div class="dropdown-item custom-control custom-checkbox my-1 mr-sm-2 text-nowrap" ${hidden ? 'style="display: none"' : ''}">
      <input
        class="custom-control-input"
        type="checkbox"
        id="${name}${item.value}"
        data-init="filters"
        value="${item.value}"
        name="${name}"
        data-form="search"
        ${item.checked ? 'checked' : ''}>
      <label class="custom-control-label justify-content-start" for="${name}${item.value}">
        ${item.key}
      </label>
    </div>
  `;
}

function sortItems(a, b) {
  if(a.checked && b.checked) {
    return sortByKey(a, b);
  } else if(!a.checked && !b.checked) {
    return sortByKey(a, b);
  }

  return a.checked ? -1 : 1;
}

function sortByKey(a, b) {
  const keyA = a.key.toUpperCase();
  const keyB = b.key.toUpperCase();

  if(keyA > keyB) return 1;
  if (keyA < keyB) return -1;

  return 0;
}
