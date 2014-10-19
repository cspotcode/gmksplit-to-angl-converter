"use strict";

import _ = require('lodash');
import fs = require('fs');

import GmResource = require('./gm-resource');
import misc = require('./misc');

var template;
var init = function() {
  template = _.template(fs.readFileSync('./templates/room-template.tmpl.angl', 'utf-8').replace(/\r?\n/g, ''));
};
init = _.once(init);

class GmRoom implements GmResource {
  
  constructor(name: string, groupPath: Array<string>) {
    this.name = name;
    this.groupPath = groupPath.slice();
  }
  
  name: string;
  groupPath: Array<string>;

  caption: string = '';
  width: number = 0;
  height: number = 0;
  speed: number = 0;
  persistent: boolean = false;
  creationCode: string = '';
  instances: Array<{
    name: string;
    x: number;
    y: number;
    creationCode: string;
    locked: boolean;
  }> = [];
  
  

  toAnglCode(): string {
    init();
    return template({
      room: this,
      misc: misc,
      nl: '\n',
      _: _
    });
  }

}

export = GmRoom;
