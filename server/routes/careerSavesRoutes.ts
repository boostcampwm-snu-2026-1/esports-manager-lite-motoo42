import { Router } from "express";
import {
  createCareerSaveController,
  deleteCareerSaveController,
  getCareerSaveController,
  listCareerSavesController,
  updateCareerSaveController,
} from "../controllers/careerSavesController.js";

export const careerSavesRoutes = Router();

careerSavesRoutes.get("/saves", listCareerSavesController);
careerSavesRoutes.post("/saves", createCareerSaveController);
careerSavesRoutes.get("/saves/:saveId", getCareerSaveController);
careerSavesRoutes.put("/saves/:saveId", updateCareerSaveController);
careerSavesRoutes.delete("/saves/:saveId", deleteCareerSaveController);
