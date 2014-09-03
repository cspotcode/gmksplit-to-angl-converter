"use strict";
/// <reference path="../typings/all.d.ts" />

import xpath = require('xpath');

import misc = require('./misc');
import appliesto = require('./applies-to');
var AppliesTo = appliesto.AppliesTo;
import GmAction = require('./gm-action');
import GmActionCode = require('./actions/code');
import GmActionInherited = require('./actions/inherited');
import GmActionComment = require('./actions/comment');
import GmActionExecuteScript = require('./actions/execute-script');
import GmActionKillObject = require('./actions/kill-object');
import GmActionOpenWebpage = require('./actions/open-webpage');
import GmActionSetAlarm = require('./actions/set-alarm');
import GmActionTransformSprite = require('./actions/transform-sprite');

export class ActionReader {

  /**
   * Deals with the messy details of pulling the relevant action information out of the XML.
   * Ideally, the methods it dispatches to won't need to think about XML at all, or any weird
   * encoding quirks of the XML format.
   * @param actionNode
   * @returns GmAction
   */
  readAction(actionNode: Node): GmAction {

    var attributes = misc.attrs(actionNode);
    var actionLibrary:number = parseInt(attributes['library']);
    var actionId:number = parseInt(attributes['id']);
    var appliesTo: appliesto.AppliesTo;
    
    switch (actionLibrary) {
      case 1:
        switch (actionId) {
          case 203:
            // kill object
            appliesTo = this.createAppliesTo(actionNode);
            return new GmActionKillObject(appliesTo);
            break;

          case 301:
            // set alarm
            appliesTo = this.createAppliesTo(actionNode);
            var isRelative: boolean = xpath.select1('relative/text()', actionNode).data === 'true';
            var alarmNumber: number = parseInt(xpath.select1('arguments/argument[@kind="MENU"]/text()', actionNode).data);
            var alarmValue: number = parseInt(xpath.select1('arguments/argument[@kind="EXPRESSION"]/text()', actionNode).data);
            return new GmActionSetAlarm(alarmNumber, alarmValue, isRelative, appliesTo);
            break;

          case 542:
            // transform sprite
            appliesTo = this.createAppliesTo(actionNode);
            // TODO finish implementing
            return new GmActionTransformSprite(0, 0, 0, 0, appliesTo);
            break;

          case 601:
            // execute script
            appliesTo = this.createAppliesTo(actionNode);
            var scriptName: string = xpath.select1('arguments/argument[@kind="SCRIPT"]/text()', actionNode).data;
            // TODO will this potentially select nodes out-of-order?
            // If so, we must tell XPath to return the argument elements in order
            var argExprs: Array<string> = xpath.select('arguments/argument[@kind="EXPRESSION"]/text()', actionNode).map((v) => v.data);
            return new GmActionExecuteScript(scriptName, argExprs, appliesTo);
            break;

          case 603:
            // code
            appliesTo = this.createAppliesTo(actionNode);
            var codeNode = xpath.select1('arguments/argument/text()', actionNode);
            return new GmActionCode(codeNode ? codeNode.data : '', appliesTo);
            break;

          case 604:
            // inherited
            return new GmActionInherited();
            break;

          case 605:
            // comment
            return new GmActionComment(xpath.select1('arguments/argument/text()', actionNode).data);
            break;

          case 807:
            // open webpage
            var url: string = xpath.select1('arguments/argument/text()', actionNode).data;
            return new GmActionOpenWebpage(url);
            break;
        }

      default:
        // We don't know what kind of event we're dealing with
        throw new Error('Unrecognized action type: ' + actionLibrary + ':' + actionId);

    }
  }
  
  createAppliesTo(actionNode: Node): appliesto.AppliesTo {
    var appliesToName: string = xpath.select1('appliesTo/text()', actionNode).data;
    if(appliesToName == '.self') {
      return new AppliesTo(AppliesTo.Targets.SELF);
    } else if(appliesToName == '.other') {
      return new AppliesTo(AppliesTo.Targets.OTHER);
    } else {
      return new AppliesTo(AppliesTo.Targets.OBJECT, appliesToName);
    }
  }
}

