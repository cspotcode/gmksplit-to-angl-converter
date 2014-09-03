/// <reference path="../../typings/all.d.ts" />
"use strict";

import GmAction = require('../gm-action');

class GmActionInherited extends GmAction {
  toCode() {
    return 'super();';
  }
}

export = GmActionInherited;
