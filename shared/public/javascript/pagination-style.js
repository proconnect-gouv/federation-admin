import $ from 'jquery';
import { pagination } from './pagination-script';
export function paginationStyle(element) {
  const totalPagesFromView = element.dataset.pages;
  const limitParam = element.dataset.limit;
  const sortParam = element.dataset.sort;
  const actionParam = element.dataset.action;
  let activePage = parseInt(element.dataset.currentpge, 10);
  const previous = element.dataset.previous;
  const next = element.dataset.next;
  const appRoot = element.dataset.rooturl;
  let paginator = pagination(activePage, totalPagesFromView);

  if((sortParam ===  undefined || sortParam ===  "")  && (actionParam ===  undefined || actionParam ===  "")) {
  $("#pagination-container").append(`
      <li class="page-item `+ (previous === ''? 'disabled' : '') +`">
        <a id="previous-link" class="page-link" href="${appRoot}${previous}">Précédente</a>
      </li>
  `) 
  } else {
    $("#pagination-container").append(`
      <li class="page-item `+ (previous === ''? 'disabled' : '') +`">
        <a id="previous-link" class="page-link" href="${appRoot}${previous}&sort=${sortParam}&action=${actionParam}">Précédente</a>
      </li>
  `)
  }

  for (let i = 1, length = paginator.length; i <= length; i++) {
    if (paginator[i - 1] === '...') {
      $("#pagination-container").append('<li class="page-item"><a class="page-link" href="#">...</a></li>');
    } else {
      if((sortParam ===  undefined || sortParam ===  "")  && (actionParam ===  undefined || actionParam ===  "") ) {
        $("#pagination-container").append(`
        <li class="page-item ` +
        (activePage === paginator[i - 1] ? 'active' : '') + `"> `+
         `<a class="page-link" href="?page=${paginator[i - 1]}&limit=${limitParam}">${paginator[i - 1]}</a></li>`);
      } else {
        $("#pagination-container").append(`
        <li class="page-item ` +
        (activePage === paginator[i - 1] ? 'active' : '') + `"> `+
         `<a class="page-link" href="?sort=${sortParam}&action=${actionParam}&page=${paginator[i - 1]}&limit=${limitParam}">${paginator[i - 1]}</a></li>`);
      }
    }
  }

  if((sortParam ===  undefined || sortParam ===  "")  && (actionParam ===  undefined || actionParam ===  "")) {
  $("#pagination-container").append(`
      <li class="page-item `+ (next === ''? 'disabled' : '') +`">
        <a id="next-link" class="page-link" href="${appRoot}${next}">Suivante</a>
      </li>
  `)
  } else {
    $("#pagination-container").append(`
    <li class="page-item `+ (next === ''? 'disabled' : '') +`">
      <a id="next-link" class="page-link" href="${appRoot}${next}&sort=${sortParam}&action=${actionParam}">Suivante</a>
    </li>
`)
  }

  if(paginator.length > 1 && !$("#pagination-container").children().hasClass('active')) {
    $("#pagination-container li:nth-child(2)").addClass('active');
  }
}