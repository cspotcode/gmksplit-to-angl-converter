/// <reference path="../../typings/all.d.ts" />
"use strict";

import GmAction = require('../gm-action');
import AppliesTo = require('../applies-to');

class GmActionOpenWebpage extends GmAction {
  
  constructor(
    public url: string) {
    super();
  }
  
  toCode() {
    return '// TODO VERIFY THAT THIS CODE DOES THE SAME AS THE Open_Webpage ACTION\n// splash_show_web("' + this.url.replace(/"/g, '" + \'"\' + "') + '");';
  }
}

export = GmActionOpenWebpage;
