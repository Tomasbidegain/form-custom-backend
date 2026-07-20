export interface CreateFormResponseDTO {
  email?: string;
  turnstileToken?: string;
  fields: {
    fieldId: string;
    value: string;
  }[];
}

export interface FormResponseDTO {
  id: string
  email: string | null
  ipAddress: string | null
  submittedAt: Date
  fields: {
    fieldId: string
    fieldLabel: string
    value: string
  }[]
}