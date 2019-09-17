import $ from 'jquery'

export function chartsList(element) {
    $('.dropdown').addClass('displayed-filter');
    element.addEventListener('change', function (ev) {
        const val = $("option:selected").val();
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
    }, true)
}