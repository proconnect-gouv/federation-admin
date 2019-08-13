import $ from 'jquery'

export function filterForm(element) {
    element.addEventListener('change', function(ev){
        console.log(ev)
        const form = document.getElementById(
            element.getAttribute('data-form'),
          );
    }, false)
}