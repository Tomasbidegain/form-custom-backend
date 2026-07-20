import prisma from "../config/database";
import {
  CreateFormResponseDTO,
  FormResponseDTO,
} from "../types/form-response.types";
import { OptionsQuery, PaginatedResponse } from "../types/pagination.types";
import { ERRORS } from "../utils/errors";
import { AppBusinessError } from "../utils/custom-error";

export class FormResponseService {
  async submitResponse(
    formId: string,
    data: CreateFormResponseDTO,
    ipAddress: string | null,
  ): Promise<FormResponseDTO> {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { fields: true },
    });

    if (!form) {
      throw new Error(ERRORS.FORM_NOT_FOUND.code);
    }

    if (!form.isPublished) {
      throw new Error(ERRORS.FORM_NOT_PUBLISHED.code);
    }

    if (form.expiresAt && form.expiresAt < new Date()) {
      throw new Error(ERRORS.FORM_EXPIRED.code);
    }

    if (form.maxResponses && form.currentResponseCount >= form.maxResponses) {
      throw new Error(ERRORS.FORM_MAX_RESPONSES_REACHED.code);
    }

    if (form.oneResponsePerEmail && data.email) {
      const existingResponse = await prisma.formResponse.findFirst({
        where: { formId, email: data.email },
      });
      if (existingResponse) {
        throw new Error(ERRORS.EMAIL_ALREADY_RESPONDED.code);
      }
    }

    // Validar que los fieldIds pertenezcan al form (ANTES de required)
    const fieldIds = form.fields.map((field) => field.id);
    const invalidFieldIds = data.fields
      .filter((f) => !fieldIds.includes(f.fieldId))
      .map((f) => f.fieldId);

    if (invalidFieldIds.length > 0) {
      throw new AppBusinessError(ERRORS.INVALID_FIELD_ID.code, {
        invalidFieldIds,
      });
    }

    // Validar campos requeridos
    const requiredFields = form.fields.filter((field) => field.required);
    const submittedFieldIds = data.fields.map((f) => f.fieldId);
    const missingRequiredFields = requiredFields.filter(
      (field) => !submittedFieldIds.includes(field.id),
    );

    if (missingRequiredFields.length > 0) {
      throw new AppBusinessError(ERRORS.REQUIRED_FIELD_MISSING.code, {
        missingFields: missingRequiredFields.map((field) => ({
          fieldId: field.id,
          label: field.label,
        })),
      });
    }

    const formResponse = await prisma.$transaction(async (tx) => {
      const response = await tx.formResponse.create({
        data: {
          formId,
          email: data.email ?? null,
          ipAddress,
          fieldResponses: {
            create: data.fields.map((field) => ({
              fieldId: field.fieldId,
              value: field.value,
            })),
          },
        },
        include: {
          fieldResponses: {
            include: {
              field: true,
            },
          },
        },
      });

      await tx.form.update({
        where: { id: formId },
        data: {
          currentResponseCount: { increment: 1 },
        },
      });

      return response;
    });

    return {
      id: formResponse.id,
      email: formResponse.email,
      ipAddress: formResponse.ipAddress,
      submittedAt: formResponse.submittedAt,
      fields: formResponse.fieldResponses.map((fr) => ({
        fieldId: fr.fieldId,
        fieldLabel: fr.field.label,
        value: fr.value,
      })),
    };
  }

  async getResponsesByForm(
    userId: string,
    formId: string,
    options: OptionsQuery,
  ): Promise<PaginatedResponse<FormResponseDTO>> {
    const form = await prisma.form.findUnique({
      where: { id: formId, userId },
    });

    if (!form) {
      throw new Error(ERRORS.FORM_NOT_FOUND.code);
    }

    const where: any = { formId };

    if (options.search) {
      where.email = { contains: options.search, mode: "insensitive" };
    }

    const [responses, total] = await prisma.$transaction([
      prisma.formResponse.findMany({
        where,
        include: {
          fieldResponses: {
            include: {
              field: true,
            },
          },
        },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { [options.sortBy]: options.sortOrder },
      }),
      prisma.formResponse.count({ where }),
    ]);

    const totalPages = Math.ceil(total / options.limit);

    return {
      data: responses.map((r) => ({
        id: r.id,
        email: r.email,
        ipAddress: r.ipAddress,
        submittedAt: r.submittedAt,
        fields: r.fieldResponses.map((fr) => ({
          fieldId: fr.fieldId,
          fieldLabel: fr.field.label,
          value: fr.value,
        })),
      })),
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages,
      },
    };
  }

  async getResponseById(
    userId: string,
    formId: string,
    responseId: string,
  ): Promise<FormResponseDTO> {
    const form = await prisma.form.findUnique({
      where: { id: formId, userId },
    });

    if (!form) {
      throw new Error(ERRORS.FORM_NOT_FOUND.code);
    }

    const response = await prisma.formResponse.findUnique({
      where: { id: responseId, formId },
      include: {
        fieldResponses: {
          include: {
            field: true,
          },
        },
      },
    });

    if (!response) {
      throw new Error(ERRORS.RESPONSE_NOT_FOUND.code);
    }

    return {
      id: response.id,
      email: response.email,
      ipAddress: response.ipAddress,
      submittedAt: response.submittedAt,
      fields: response.fieldResponses.map((fr) => ({
        fieldId: fr.fieldId,
        fieldLabel: fr.field.label,
        value: fr.value,
      })),
    };
  }

  async deleteResponse(
    userId: string,
    formId: string,
    responseId: string,
  ): Promise<void> {
    const form = await prisma.form.findUnique({
      where: { id: formId, userId },
    });

    if (!form) {
      throw new Error(ERRORS.FORM_NOT_FOUND.code);
    }

    const response = await prisma.formResponse.findUnique({
      where: { id: responseId, formId },
    });

    if (!response) {
      throw new Error(ERRORS.RESPONSE_NOT_FOUND.code);
    }

    await prisma.$transaction(async (tx) => {
      await tx.fieldResponse.deleteMany({
        where: { formResponseId: responseId },
      });

      await tx.formResponse.delete({
        where: { id: responseId },
      });

      await tx.form.update({
        where: { id: formId },
        data: {
          currentResponseCount: { decrement: 1 },
        },
      });
    });
  }
}
