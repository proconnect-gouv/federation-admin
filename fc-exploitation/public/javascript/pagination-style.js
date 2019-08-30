import $ from 'jquery';
import './twbs-pagination'

export function paginationStyle(element) {
    const totalPagesFromView = element.dataset.pages
    
    /** Get pagination element */
    let _pagination = $('#pagination-demo');

    /**
     * Setting options
     * @see http://josecebe.github.io/twbs-pagination/#options-and-events
     */
    const options = {
        pageVariable: 'page',          
        totalPages: totalPagesFromView,
        hideOnlyOnePage: true,
        href:true,
        first: 'Début',
        prev: 'Précedente',
        next: 'Suivante',
        last: 'Fin'
    }

    // Using pagination
    _pagination.twbsPagination(options);
}
