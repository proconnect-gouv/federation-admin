import $ from 'jquery'

export function dropdown(element) {
    element.addEventListener('click', function(ev){        
        $('.dropdown-menu').on('click', function(event) {
            event.stopPropagation();
          });
    },true)
}