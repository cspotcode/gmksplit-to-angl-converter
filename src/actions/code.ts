/// <reference path="../../typings/all.d.ts" />
"use strict";

import misc = require('../misc');
import GmAction = require('../gm-action');
import appliesto = require('../applies-to');
var AppliesTo = appliesto.AppliesTo;

class GmActionCode extends GmAction {
  constructor(
    public code: string,
    public appliesTo: appliesto.AppliesTo) {
    super();
  }
  
  toCode() {
    switch (this.appliesTo.target) {
      case AppliesTo.Targets.SELF:
        return this.code;

      case AppliesTo.Targets.OTHER:
        return 'with(other) {\n' + misc.indentCode(this.code) + '\n}';

      case AppliesTo.Targets.OBJECT:
        return 'with(' + this.appliesTo.objectName + ') {\n' + misc.indentCode(this.code) + '\n}';
    }
  }
}

export = GmActionCode;
