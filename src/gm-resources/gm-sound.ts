/// <reference path="../../typings/all.d.ts" />
"use strict";

import GmResource = require('../gm-resource');

class GmSound implements GmResource {

  constructor(name: string, groupPath: Array<string>) {
    this.name = name;
    this.groupPath = groupPath.slice();
  }

  public name: string;
  public groupPath: Array<string>;

}

export = GmSound;
