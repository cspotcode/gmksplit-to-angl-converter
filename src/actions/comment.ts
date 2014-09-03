/// <reference path="../../typings/all.d.ts" />
"use strict";

import GmAction = require('../gm-action');

class GmActionComment extends GmAction {
  constructor(
    public comment: string) {
    super();
  }
  
  toCode() {
    return '//\n// ' + this.comment + '\n//';
  }
}

export = GmActionComment;
