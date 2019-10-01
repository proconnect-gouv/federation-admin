import Chart from 'chart.js';
import $ from 'jquery';

const colors = {};

function getUniqValues(array, key) {
  return array
    .map(item => item[key])
    .filter((item, index, self) => self.indexOf(item) === index);
}

function chartColorGenerator() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function buildChartData(params, input) {
  const labels = getUniqValues(input, params.x);
  const data = {
    labels,
    datasets: extractDataSets(params.type, input, labels, params.x, params.y),
  };

  return data;
}

function extractDataSet(type, data, labels, labelKey, key, value) {
  const set = labels.map(label => {
    return data.reduce((acc, item) => {
      if (item[key] === value && label === item[labelKey]) {
        acc += item.count;
      }
      return acc;
    }, 0);
  });

  if (typeof colors[key + value] === 'undefined') {
    colors[key + value] = chartColorGenerator();
  }

  switch (type) {
    case 'bar':
      return {
        label: value,
        stack: key,
        data: set,
        backgroundColor: colors[key + value],
      };

    case 'line':
      return {
        label: value,
        yAxisID: key,
        data: set,
        backgroundColor: colors[key + value],
        borderColor: colors[key + value],
        fill: false,
      };

    case 'pie':
      return {
        label: value,
        stack: key,
        data: set,
        backgroundColor: set.map(_item => chartColorGenerator()),
      };
  }
}

function extractDataSets(type, data, labels, labelKey, key) {
  const uniqValues = getUniqValues(data, key);

  const set = uniqValues.reduce((acc, item) => {
    acc.push(extractDataSet(type, data, labels, labelKey, key, item));

    return acc;
  }, []);

  return set;
}

function getScales(params) {
  switch (params.type) {
    case 'bar':
      return {
        xAxes: [
          {
            stacked: true,
          },
        ],
        yAxes: [
          {
            stacked: true,
          },
        ],
      };
    case 'line':
      return {
        yAxes: [
          {
            type: 'linear',
            display: true,
            position: 'left',
            id: params.y,
          },
        ],
      };
    case 'pie':
      return {
        xAxes: [
          {
            stacked: true,
          },
        ],
        yAxes: [
          {
            stacked: true,
          },
        ],
      };
  }
}

function buildChartConfig(params, data) {
  const datasets = buildChartData(params, data);

  const config = {
    type: params.type,
    data: datasets,
    options: {
      title: {
        display: true,
        text: 'Test stacked',
      },
      tooltips: {
        mode: 'x',
        intersect: false,
      },
      responsive: true,
      scales: getScales(params),
    },
  };

  return config;
}

export function initGraph(element) {
  const params = {
    type: $(element).attr('data-type'),
    x: $(element).attr('data-x'),
    y: $(element).attr('data-y'),
  };

  const config = buildChartConfig(params, window.data);
  new Chart(element, config);
}

export function initGraphSetting() {
  const inputs = $('[name="visualize"]');

  inputs.on('change', input => {
    if (input.target.value === 'list') {
      $('#graph-settings').addClass('d-none');
    } else {
      $('#graph-settings').removeClass('d-none');
    }
  });
}
