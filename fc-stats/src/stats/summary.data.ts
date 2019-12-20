import * as queryString from 'querystring';
import { ISummary } from './interfaces/summary.interface';

export function formatDate(date: Date): string {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
}

export function getData(baseQuery): ISummary[] {
  const index: ISummary[] = [
    {
      label: 'Métriques usagers',
      list: [
        {
          label: "Courbe du nombre d'utilisateurs depuis l’origine",
          href: `/metrics?${queryString.stringify({
            ...baseQuery,
            'filters[]': ['key:account', 'range:month'],
          })}`,
        },

        {
          label: 'Nombre d’utilisateurs unique chaque mois',
          href: `/metrics?${queryString.stringify({
            ...baseQuery,
            'filters[]': ['key:activeAccount', 'range:month'],
          })}`,
        },

        {
          label: 'Nombre de connexions chaque mois',
          href: `/events?${queryString.stringify({
            ...baseQuery,
            'columns[]': ['typeAction'],
            'filters[]': ['typeAction:initial', 'action:authentication'],
            y: 'typeAction',
          })}`,
        },

        {
          label: 'Nombre de nouveaux utilisateurs chaque mois',
          href: `/metrics?${queryString.stringify({
            ...baseQuery,
            'filters[]': 'key:registration',
          })}`,
        },
      ],
    },
    {
      label: 'Métriques partenaires',
      list: [
        {
          label: 'Répartition des connexions par FI chaque mois',
          href: `/events?${queryString.stringify({
            ...baseQuery,
            'columns[]': ['typeAction', 'fi'],
            'filters[]': 'typeAction:initial',
            visualize: 'bar',
            y: 'fi',
          })}`,
        },

        {
          label: 'Répartition des connexions par FS',
          href: `/events?${queryString.stringify({
            ...baseQuery,
            'columns[]': ['typeAction', 'fs'],
            'filters[]': 'typeAction:initial',
            visualize: 'pie',
            granularity: 'all',
            y: 'fs',
          })}`,
        },
      ],
    },
  ];

  return index;
}
