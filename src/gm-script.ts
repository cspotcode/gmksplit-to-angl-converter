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
    
    // Find all references to arguments in the code.
    // This is an ugly hack to figure out which arguments this script accepts.
    var highestArgumentFound = -1;
    var matchArgumentRegExp = /\bargument(1[0-5]|[0-9](?![0-9]))\b/g;
    var match;
    while(match = matchArgumentRegExp.exec(this.code)) {
      highestArgumentFound = Math.max(highestArgumentFound, parseInt(match[1]));
    }
    var argumentsString = _(new Array(highestArgumentFound + 1)).map((v, i) => 'argument' + i).join(', ');
    
    // Remove unnecessary indentation from code.
    var code = misc.removeUnnecessaryIndentation(misc.normalizeLineEndings(this.code));
    
    var ret = 'script ' + this.name + '(' + argumentsString + ') {\n' + misc.indentCode(code) + '\n}\nexport = ' + this.name + ';\n';
    return ret;
  }
}

export = GmScript;
