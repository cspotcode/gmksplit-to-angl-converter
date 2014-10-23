"use strict";
/// <reference path="../typings/all.d.ts" />

import GmResource = require('./gm-resource');

class GmBackground implements GmResource {
  
  constructor(name: string, groupPath: Array<string>) {
    this.name = name;
    this.groupPath = groupPath.slice();
  }
  
  public name: string;
  public groupPath: Array<string>;

}

export = GmBackground;
