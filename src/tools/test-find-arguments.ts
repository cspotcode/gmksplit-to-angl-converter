/// <reference path="../../typings/all.d.ts" />
"use strict";

import GmScript = require('../gm-resources/gm-script');

var script = new GmScript('foo', []);
script.code = '  argument0argument1argument14argument3argument0argument';
script.toAnglCode();
