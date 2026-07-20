import { Request, Response } from "express";
import { FormResponseService } from "../services/form-response.services";
import { ERRORS } from "../utils/errors";
import { parsePaginationQuery } from "../utils/pagination";

const formResponseService = new FormResponseService();

export class UserController {
  async getMyResponses(req: Request, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json(ERRORS.UNAUTHORIZED);
      }

      const pagination = parsePaginationQuery(
        req.query,
        ["submittedAt"],
        "submittedAt",
      );

      const response = await formResponseService.getMyResponses(
        userId,
        pagination,
      );
      res.json(response);
    } catch (error) {
      res.status(500).json(ERRORS.INTERNAL_SERVER_ERROR);
    }
  }
}
