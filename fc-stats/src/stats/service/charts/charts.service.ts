import { Injectable } from '@nestjs/common';
import * as Moment from 'moment';
import { MAPPINGS } from '../../../meta/mappings-data';

@Injectable()
export class ChartsService {
  transformEsData(data, granularity) {
    const dateWithEvent = [];
    data.forEach(value => {
      if (value.events.length !== 0) {
        dateWithEvent.push(value.startDate);
        return value.startDate;
      }
    });
    const chartValues = data.map(value => {
      return value.events;
    });

    const labelsArray = this.transformTimestampToSelectedTime(
      dateWithEvent,
      granularity,
    );
    const dataArray = this.transformEsValuesToChartValues(chartValues);
    return {
      labelsArray: JSON.stringify(labelsArray),
      dataArray: JSON.stringify(dataArray),
    };
  }

  transformTimestampToSelectedTime(timestamps, granularity) {
    const labelValues = [];
    switch (granularity) {
      case 'day':
        break;
      case 'week':
        // tslint:disable-next-line: forin
        for (const key in timestamps) {
          labelValues.push(Moment(timestamps[key]).format('DD-MMM-YY'));
        }
        break;
      case 'month':
        break;
      case 'year':
        break;
      default:
        break;
    }
    return labelValues;
  }

  transformEsValuesToChartValues(chartValues) {
    const datasets = [];

    chartValues.forEach(events => {
      events.forEach(event => {
        let entry = datasets.find(item => item.label === event.label);
        if (typeof entry === 'undefined') {
          entry = {
            label: event.label,
            backgroundColor: this.chartColorGenerator(),
            data: [],
          };
          datasets.push(entry);
        }
        entry.data.push(event.count);
      });
    });
    return datasets.map(data => {
      data.label = this.getMapped(data.label);
      return data;
    });
  }

  chartColorGenerator() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  setChartTitle(key) {
    const chartTitle = {
      ActionsFiRangeByWeek: 'Total hebdomadaire des actions pour :',
      compteActif: 'Nombre de comptes actifs',
      compteDesactive: 'Nombre de comptes désactivés',
      repartionConnexionFiPourUnFS: 'Repartition des connexions par fi',
      nombreFsEnProductio: 'Nombre de FS en production',
      nombreUtilisateurs: 'Nombre d’utilisateurs depuis l’origine',
      nombreUtilisateursUnique: 'Nombre d’utilisateurs unique chaque mois',
      nombreConnexionMensuelle: 'Nombre de connexions mensuelle',
      nouveauUtilisateursMensuelle: 'Nombre de nouveaux utilisateurs mensuelle',
      RepartionConnexionParFs: 'La répartition des connexions par FS',
      Top15FsVolumeConnexion:
        '15 FS générant les plus gros volumes de connexions',
      partConnexionParFiPourTop15Fs:
        'Part de connexion par FI de chacun de ces 15 FS',
    };

    if (chartTitle[key] !== undefined) {
      // tslint:disable-next-line: no-string-literal
      return chartTitle[key];
    }
    return key;
  }

  getMapped = function getMapped(key) {
    if (MAPPINGS.action[key] !== undefined) {
      // tslint:disable-next-line: no-string-literal
      return MAPPINGS['action'][key];
    } else if (MAPPINGS.typeAction[key] !== undefined) {
      return MAPPINGS.typeAction[key];
    }
    return key;
  };
}
