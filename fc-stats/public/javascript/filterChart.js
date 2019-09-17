import $ from 'jquery'

export function filterChart(element) {
  new Chart(document.getElementById("bar-chart-grouped"), window.chartData);
}