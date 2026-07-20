import { TypeField } from "../generated/prisma/enums";
import { JsonValue } from "../generated/prisma/internal/prismaNamespace";

export interface CreateFormDTO {
  title: string;
  description: string | null;
  expiresAt: string | null;
  maxResponses: number | null;
  oneResponsePerEmail: boolean;
  captchaEnabled: boolean;
  fields: CreateFieldDTO[];
}

export interface UpdateFormDTO {
  title?: string;
  description?: string | null;
  expiresAt?: string | null;
  maxResponses?: number | null;
  oneResponsePerEmail?: boolean;
  captchaEnabled?: boolean;
}

export interface FormResponse {
  id: string;
  title: string;
  description: string | null;
  expiresAt: Date | null;
  maxResponses: number | null;
  currentResponseCount: number;
  oneResponsePerEmail: boolean;
  captchaEnabled: boolean;
  userId: string;
  fields: FieldResponse[];
}

export interface CreateFieldDTO {
  label: string;
  type: TypeField;
  required: boolean;
  options: string[] | null;
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
}

export interface UpdateFieldDTO {
  label?: string;
  type?: TypeField;
  required?: boolean;
  options?: string[] | null;
  gridX?: number;
  gridY?: number;
  gridW?: number;
  gridH?: number;
}

export interface FieldResponse {
  id: string;
  label: string;
  type: TypeField;
  required: boolean;
  options: string[] | null;
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
}
