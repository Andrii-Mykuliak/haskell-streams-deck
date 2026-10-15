import React from "react";
import { SLIDES } from "../slides";
import { startsOf, StepProvider } from "./steps";

export const SlideRoot: React.FC<{ index: number; stops?: number[] }> = ({ index }) => {
  const def = SLIDES[index];
  const Comp = def.C;
  return (
    <StepProvider value={startsOf(def.steps)}>
      <Comp />
    </StepProvider>
  );
};
