/// <reference path="../typings/all.d.ts" />
"use strict";

import GmAction = require('./gm-action');

class GmEvent {
  constructor(
    public methodName: string,
    public methodArgumentNames: Array<string> = []) {}

  public actions: Array<GmAction> = [];
}

export = GmEvent;
