import $ from 'jquery';
import Lightpick from 'lightpick';

export function dateRangePicker(element) {
  let picker;

  const secondField = document.getElementById(
    element.getAttribute('data-secondField'),
  );

  const form = document.getElementById(element.getAttribute('data-form'));

  const config = {
    field: element,
    secondField,
    repick: false,
    singleDate: false,
    format: 'YYYY-MM-DD',
    onSelect: updateGranularity,
  };
  picker = new Lightpick(config);
  picker.submit = false;
}

function getGranularity(start, stop) {
  const diff = stop.diff(start, 'day');

  if (diff < 14) {
    return 'day';
  }

  if (diff < 60) {
    return 'week';
  }

  if (diff < 365) {
    return 'month';
  }

  return 'year';
}

function updateGranularity(start, stop) {
  const granularity = getGranularity(start, stop);
  const input = $(`[name="granularity"][value="${granularity}"]`);

  if (input) {
    input.attr('checked', true);
  }
}
