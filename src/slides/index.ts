import type { SlideDef } from "../deck/steps";
import { agendaSlide, introSlides } from "./intro";
import { p1Slides } from "./p1-streams";
import { p2Slides } from "./p2-models";
import { p3Slides } from "./p3-haskell";
import { p4Slides } from "./p4-folds";
import { p4bSlides } from "./p4b-folds";
import { p5Slides, summarySlide } from "./p5-pipelines";
import { outroSlide } from "./outro";

export const SLIDES: SlideDef[] = [
  ...introSlides,
  ...p1Slides,
  agendaSlide(1),
  ...p2Slides,
  agendaSlide(2),
  ...p3Slides,
  agendaSlide(3),
  ...p4Slides,
  ...p4bSlides,
  agendaSlide(4),
  ...p5Slides,
  summarySlide,
  outroSlide,
];
