/// <reference path="../../../typings/all.d.ts" />
"use strict";

enum SpriteMaskShape {
  RECTANGLE, // a rectangle
  PRECISE, // pixel-perfect collision detection
  DIAMOND, // a diamond
  DISC // a circle or ellipse
}

export = SpriteMaskShape;
