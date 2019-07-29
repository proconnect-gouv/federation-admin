export interface TotalByFIevent {
  label: string;
  count: number;
}

export interface TotalByFIWeek {
  events: TotalByFIevent[];
  startDate: Date;
}
