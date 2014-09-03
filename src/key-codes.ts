/// <reference path="../typings/all.d.ts" />
"use strict";

import _ = require('lodash');

export enum KeyCodes {
  NOKEY = 0,
  ANYKEY = 1,
  LEFT = 37,
  RIGHT = 39,
  UP = 38,
  DOWN = 40,
  ENTER = 13,
  ESCAPE = 27,
  SPACE = 32,
  SHIFT = 16,
  CONTROL = 17,
  ALT = 18,
  BACKSPACE = 8,
  TAB = 9,
  HOME = 36,
  END = 35,
  DELETE = 46,
  INSERT = 45,
  PAGEUP = 33,
  PAGEDOWN = 34,
  PAUSE = 19,
  PRINTSCREEN = 44,
  F1 = 112,
  F2 = 113,
  F3 = 114,
  F4 = 115,
  F5 = 116,
  F6 = 117,
  F7 = 118,
  F8 = 119,
  F9 = 120,
  F10 = 121,
  F11 = 122,
  F12 = 123,
  NUMPAD0 = 96,
  NUMPAD1 = 97,
  NUMPAD2 = 98,
  NUMPAD3 = 99,
  NUMPAD4 = 100,
  NUMPAD5 = 101,
  NUMPAD6 = 102,
  NUMPAD7 = 103,
  NUMPAD8 = 104,
  NUMPAD9 = 105,
  MULTIPLY = 106,
  DIVIDE = 111,
  ADD = 107,
  SUBTRACT = 109,
  DECIMAL = 110
};

// An object of key: value pairs of the form:
//   "vk_decimal": "DECIMAL"
export var GameMakerToEnumKeyCodeNames = <{[k: string]: string}>_(KeyCodes)
  .keys()
  .filter((v) => _.isNaN(parseInt(v[0])))
  .map((v) => ['vk_' + v.toLowerCase(), v])
  .zipObject()
  .value();

