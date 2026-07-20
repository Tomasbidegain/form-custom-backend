import {
  CreateFieldDTO,
  CreateFormDTO,
  FieldResponse,
  FormResponse,
  UpdateFieldDTO,
  UpdateFormDTO,
} from "../types/form.types";
import { OptionsQuery, PaginatedResponse } from "../types/pagination.types";
import prisma from "../config/database";
import { ERRORS } from "../utils/errors";

export class FormService {
  async createForm(userId: string, data: CreateFormDTO): Promise<FormResponse> {
    const form = await prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        maxResponses: data.maxResponses,
        oneResponsePerEmail: data.oneResponsePerEmail,
        captchaEnabled: data.captchaEnabled,
        userId,
        fields: {
          create: data.fields.map((field) => ({
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options ?? undefined,
            gridX: field.gridX,
            gridY: field.gridY,
            gridW: field.gridW,
            gridH: field.gridH,
          })),
        },
      },
      include: {
        fields: true,
      },
    });

    return form as unknown as FormResponse;
  }

  async updateForm(
    userId: string,
    formId: string,
    data: UpdateFormDTO,
  ): Promise<FormResponse> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.expiresAt !== undefined)
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.maxResponses !== undefined)
      updateData.maxResponses = data.maxResponses;
    if (data.oneResponsePerEmail !== undefined)
      updateData.oneResponsePerEmail = data.oneResponsePerEmail;
    if (data.captchaEnabled !== undefined)
      updateData.captchaEnabled = data.captchaEnabled;

    if (Object.keys(updateData).length === 0) {
      throw new Error(ERRORS.NO_DATA_TO_UPDATE.code);
    }

    const form = await prisma.form.update({
      where: {
        id: formId,
        userId,
      },
      data: updateData,
      include: {
        fields: true,
      },
    });

    return form as unknown as FormResponse;
  }

  async deleteForm(userId: string, formId: string): Promise<void> {
    const form = await prisma.form.findUnique({
      where: { id: formId, userId },
    });
    if (!form) throw new Error(ERRORS.FORM_NOT_FOUND.code);

    await prisma.field.deleteMany({ where: { formId } });
    await prisma.formResponse.deleteMany({ where: { formId } });

    await prisma.form.delete({
      where: { id: formId },
    });
  }

  async getAllFormsByUser(
    userId: string,
    options: OptionsQuery,
  ): Promise<PaginatedResponse<FormResponse>> {
    const where: any = { userId };

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: "insensitive" } },
        { description: { not: null, contains: options.search, mode: "insensitive" } },
      ];
    }

    const [forms, total] = await prisma.$transaction([
      prisma.form.findMany({
        where,
        include: { fields: true },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { [options.sortBy]: options.sortOrder },
      }),
      prisma.form.count({ where }),
    ]);

    const totalPages = Math.ceil(total / options.limit);

    return {
      data: forms as unknown as FormResponse[],
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages,
      },
    };
  }

  async getFormById(userId: string, formId: string): Promise<FormResponse> {
    const form = await prisma.form.findUnique({
      where: { id: formId, userId },
      include: {
        fields: true,
      },
    });

    if (!form) throw new Error(ERRORS.FORM_NOT_FOUND.code);

    return form as unknown as FormResponse;
  }

  async addField(
    userId: string,
    formId: string,
    fieldData: CreateFieldDTO,
  ): Promise<FieldResponse> {
    const form = await prisma.form.findUnique({
      where: { id: formId, userId },
    });

    if (!form) {
      throw new Error(ERRORS.FORM_NOT_FOUND.code);
    }

    const field = await prisma.field.create({
      data: {
        label: fieldData.label,
        type: fieldData.type,
        required: fieldData.required,
        options: fieldData.options ?? undefined,
        gridX: fieldData.gridX,
        gridY: fieldData.gridY,
        gridW: fieldData.gridW,
        gridH: fieldData.gridH,
        formId: form.id,
      },
    });

    return field as unknown as FieldResponse;
  }

  async removeField(
    userId: string,
    formId: string,
    fieldId: string,
  ): Promise<void> {
    const form = await prisma.form.findUnique({
      where: { id: formId, userId },
    });

    if (!form) {
      throw new Error(ERRORS.FORM_NOT_FOUND.code);
    }

    const field = await prisma.field.findUnique({
      where: { id: fieldId, formId },
    });

    if (!field) throw new Error(ERRORS.FIELD_NOT_FOUND.code);

    await prisma.field.delete({
      where: { id: fieldId },
    });
  }

  async updateField(
    userId: string,
    formId: string,
    fieldId: string,
    fieldData: UpdateFieldDTO,
  ): Promise<FieldResponse> {
    const updateData: any = {};

    const form = await prisma.form.findUnique({
      where: { id: formId, userId },
    });

    if (!form) {
      throw new Error(ERRORS.FORM_NOT_FOUND.code);
    }

    const field = await prisma.field.findUnique({
      where: { id: fieldId, formId },
    });

    if (!field) {
      throw new Error(ERRORS.FIELD_NOT_FOUND.code);
    }

    if (fieldData.label !== undefined) updateData.label = fieldData.label;
    if (fieldData.type !== undefined) updateData.type = fieldData.type;
    if (fieldData.required !== undefined)
      updateData.required = fieldData.required;
    if (fieldData.options !== undefined) updateData.options = fieldData.options;
    if (fieldData.gridX !== undefined) updateData.gridX = fieldData.gridX;
    if (fieldData.gridY !== undefined) updateData.gridY = fieldData.gridY;
    if (fieldData.gridW !== undefined) updateData.gridW = fieldData.gridW;
    if (fieldData.gridH !== undefined) updateData.gridH = fieldData.gridH;

    if (Object.keys(updateData).length === 0) {
      throw new Error(ERRORS.NO_DATA_TO_UPDATE.code);
    }

    const updatedField = await prisma.field.update({
      where: { id: fieldId },
      data: updateData,
    });

    return updatedField as unknown as FieldResponse;
  }

  async togglePublish(
    userId: string,
    formId: string,
  ): Promise<FormResponse> {
    const form = await prisma.form.findUnique({
      where: { id: formId, userId },
      include: { fields: true },
    });

    if (!form) {
      throw new Error(ERRORS.FORM_NOT_FOUND.code);
    }

    // Si está publicando y tiene fecha de expiración, validar que no haya pasado
    if (!form.isPublished && form.expiresAt) {
      if (form.expiresAt < new Date()) {
        throw new Error(ERRORS.FORM_EXPIRED.code);
      }
    }

    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: { isPublished: !form.isPublished },
      include: { fields: true },
    });

    return updatedForm as unknown as FormResponse;
  }
}
