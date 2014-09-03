/// <reference path="../../typings/all.d.ts" />
"use strict";

import misc = require('../misc');
import GmAction = require('../gm-action');
import appliesto = require('../applies-to');
var AppliesTo = appliesto.AppliesTo;

class GmActionTransformSprite extends GmAction {
  
  constructor(
    public argument0: number,
    public argument1: number,
    public argument2: number,
    public argument3: number,
    public appliesTo: appliesto.AppliesTo) {
    super();
  }
  
  toCode() {
    var code = '// TODO IMPLEMENT Transform_Sprite ACTION';
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

export = GmActionTransformSprite;
