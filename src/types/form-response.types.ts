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
    gridX: number
    gridY: number
    gridW: number
    gridH: number
  }[]
}

export interface MyResponseDTO {
  id: string
  formId: string
  formTitle: string
  email: string | null
  ipAddress: string | null
  submittedAt: Date
  fields: {
    fieldId: string
    fieldLabel: string
    value: string
    gridX: number
    gridY: number
    gridW: number
    gridH: number
  }[]
}