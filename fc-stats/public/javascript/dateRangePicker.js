import Lightpick from 'lightpick';

export function dateRangePicker(element) {
  let picker;

  const secondField = document.getElementById(
    element.getAttribute('data-secondField'),
  );

  const form = document.getElementById(
    element.getAttribute('data-form'),
  );

  const config ={
    field: element,
    secondField,
    repick: false,
    singleDate: false,
    format: 'YYYY-MM-DD',
    onSelect: (_start, stop) => {
      // submit only when two dates selected
      if (picker.submit && stop) {
        form.submit();
      } else {
        picker.submit = true;
      }
    },
  };
  picker = new Lightpick(config);
  picker.submit = false;
}
