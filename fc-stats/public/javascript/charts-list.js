import $ from 'jquery'

export function chartsList(element) {
    element.addEventListener('change', function(ev){    
        const val = $("option:selected").val();
        console.log(val)
        switch (val) {
            case 'ActionsFiRangeByWeek':
                $('#fi-dropdown').removeClass('displayed-filter');
                $('#granularity').removeClass('displayed-filter');
                break;
            case 'nbrUsagersFS':
                $('#fs-dropdown').removeClass('displayed-filter');
                break;
            default:
                break;
        }
        $('#granularity-dropdown').removeClass('displayed-filter');
        $('#reset-action').removeClass('displayed-filter');
        $('#bouton-filtrer').removeClass('displayed-filter');
    },true)
}