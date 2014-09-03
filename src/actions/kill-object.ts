/// <reference path="../../typings/all.d.ts" />
"use strict";

import misc = require('../misc');
import GmAction = require('../gm-action');
import appliesto = require('../applies-to');
var AppliesTo = appliesto.AppliesTo;

class GmActionKillObject extends GmAction {
  
  constructor(
    public appliesTo: appliesto.AppliesTo) {
    super();
  }
  
  toCode() {
    var code = 'instance_destroy();';
    switch(this.appliesTo.target) {
      case AppliesTo.Targets.SELF:
        return code;
      
      case AppliesTo.Targets.OTHER:
        return 'with(other) {\n' + misc.indentCode(code) + '\n}';
      
      case AppliesTo.Targets.OBJECT:
        return 'with(' + this.appliesTo.objectName + ') {\n' + misc.indentCode(code) + '\n}';
    }
  }
}

export = GmActionKillObject;
