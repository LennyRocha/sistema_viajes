"use client";

import { motion } from "motion/react";
import { Paper } from "@mui/material";
import type { ComponentType } from "react";

const MotionPaper: ComponentType<any> =
  motion.create(Paper);

export default MotionPaper;