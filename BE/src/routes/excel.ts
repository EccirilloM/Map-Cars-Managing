import express from "express";
import * as controller from "../controllers/excel"
import { authMiddleware} from '../middleware/auth.middleware';
import {checkRoleMiddleware } from "../middleware/role.middleware"
import { Role } from "@prisma/client";

const router = express.Router();

router.use(express.json());

router.get("/excelCarGenerator",[authMiddleware, checkRoleMiddleware(Role.ADMIN)], controller.excelCarGenerator);
router.get("/excelPersonGenerator",[authMiddleware, checkRoleMiddleware(Role.ADMIN)], controller.excelPersonGenerator);
router.get("/excelPointGenerator",[authMiddleware, checkRoleMiddleware(Role.ADMIN)], controller.excelPointGenerator);

export {router};