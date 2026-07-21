export interface FormStatsDTO {
  totalResponses: number;
  responsesByDay: {
    date: string;
    count: number;
  }[];
}
