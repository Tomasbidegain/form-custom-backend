export interface FormStatsDTO {
  totalResponses: number;
  responsesByDay: {
    date: string;
    count: number;
  }[];
  fieldDistributions: {
    fieldId: string;
    fieldLabel: string;
    fieldType: string;
    distribution: {
      value: string;
      count: number;
      percentage: number;
    }[];
  }[];
}
