"use strict";

import _ = require('lodash');

import GmResource = require('./gm-resource');
import misc = require('./misc');

class GmScript implements GmResource {
  
  constructor(name: string, groupPath: Array<string>) {
    this.name = name;
    this.groupPath = groupPath.slice();
  }
  
  public name: string;
  public groupPath: Array<string>;

  /**
   * Raw GML code from the .gml file
   */
  public code: string;

  /**
   * Outputs angl source code for this script, including function signature.
   */
  toAnglCode(): string {
    var ret = 'script ' + this.name + '() {\n' + misc.indentCode(this.code) + '\n}\n';
    return ret;
  }
}

export = GmScript;
