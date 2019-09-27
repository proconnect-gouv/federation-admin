import Lightpick from 'lightpick';

export function dateSinglePicker(element) {
  let picker;

  const config ={
    field: element,
    format: 'YYYY-MM-DD',
  };

  picker = new Lightpick(config);
  picker.submit = false;
}
