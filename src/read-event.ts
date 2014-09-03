"use strict";
/// <reference path="../typings/all.d.ts" />

import misc = require('./misc');
import mouseeventcodes = require('./mouse-event-codes');
var MouseEventCodes = mouseeventcodes.MouseEventCodes;
import keycodes = require('./key-codes');
var KeyCodes = keycodes.KeyCodes;
import GmEvent = require('./gm-event');

export enum StepEventTypes {
    NORMAL = 0,
    BEGIN = 1,
    END = 2
}

var StepEventNames = <{[i: number]: string}>{};
StepEventNames[StepEventTypes.NORMAL] = 'Step';
StepEventNames[StepEventTypes.BEGIN] = 'BeginStep';
StepEventNames[StepEventTypes.END] = 'EndStep';

export class EventReader {

  /**
   * Deals with the messy details of pulling the relevant event information out of the XML.
   * Ideally, the methods it dispatches to won't need to think about XML at all, or any weird
   * encoding quirks of the XML format.
   * @param eventNode
   * @returns {any}
   */
  readEvent(eventNode: Node): GmEvent {
    
    var attributes = misc.attrs(eventNode);
    var eventCategory = attributes['category'];
    
    switch(eventCategory) {
      case 'COLLISION':
        return this.processCollisionEvent(attributes['with']);
        break;
      
      case 'STEP':
        return this.processStepEvent(parseInt(attributes['id']));
        break;
      
      case 'CREATE':
        return this.processCreateEvent();
        break;

      case 'DESTROY':
        return this.processDestroyEvent();
        break;
      
      case 'ALARM':
        return this.processAlarmEvent(parseInt(attributes['id']));
        break;
      
      case 'DRAW':
        return this.processDrawEvent();
        break;
      
      case 'KEYPRESS':
        // Event that fires when a keyboard key is initially pressed,
        // and not again until it is released and re-pressed.
        // Not to be confused with KEYRELEASE and KEYBOARD events.
        return this.processKeyPressEvent(parseInt(attributes['id']));
        break;
      
      case 'MOUSE':
        return this.processMouseEvent(parseInt(attributes['id']));
        break;
      
      case 'OTHER':
        var eventId = parseInt(attributes['id']);
        switch(eventId) {
          case 3:
            return this.processGameEndEvent();
            break;
          
          case 4:
            return this.processRoomStartEvent();
            break;
          
          case 5:
            return this.processRoomEndEvent();
            break;
          
          case 7:
            return this.processAnimationEndEvent();
            break;
          
          case 30:
            return this.processCloseButtonEvent();
            break;
          
          default:
            // Is this a user-defined event?
            var userDefinedEventNumber = eventId - 10;
            if(userDefinedEventNumber >= 0 && userDefinedEventNumber <= 15) {
              // This is, indeed, a user-defined event
              return this.processUserDefinedEvent(userDefinedEventNumber);
              break;
            }
        }
      
      default:
        // We don't know what kind of event we're dealing with
        throw new Error('Unrecognized event type: ' + eventCategory + ':' + eventId);
        
    }
  }

  // TODO make all these process* methods private
  
  /**
   * 
   * @param withName name of the other object (class) to collide with.
   */
  processCollisionEvent(withName: string) {
    return new GmEvent('onCollisionWith' + withName);
  }
  
  processRoomStartEvent() {
    return new GmEvent('onRoomStart');
  }
  
  processRoomEndEvent() {
    return new GmEvent('onRoomEnd');
  }
  
  processCloseButtonEvent() {
    return new GmEvent('onCloseButton');
  }
  
  processStepEvent(stepEventType: StepEventTypes) {
    return new GmEvent('on' + StepEventNames[stepEventType]);
  }
  
  processCreateEvent() {
    return new GmEvent('onCreate');
  }
  
  processDestroyEvent() {
    return new GmEvent('onDestroy');
  }
  
  processAlarmEvent(alarmNumber: number) {
    return new GmEvent('onAlarm' + alarmNumber);
  }
  
  processDrawEvent() {
    return new GmEvent('onDraw');
  }
  
  processUserDefinedEvent(userDefinedEventNumber: number) {
    return new GmEvent('onUserDefinedEvent' + userDefinedEventNumber);
  }
  
  processGameEndEvent() {
    return new GmEvent('onGameEnd');
  }
  
  processAnimationEndEvent() {
    return new GmEvent('onAnimationEnd');
  }
  
  processKeyPressEvent(keyCode: number) {
    // TODO what arguments?

    /**
     * 0: no key
     * 1: any key
     * 13: enter
     * 27: escape
     */
    
    var keyCodeName = KeyCodes[keyCode];
    if(!keyCodeName) {
      keyCodeName = 'Char' + String.fromCharCode(keyCode);
    } else {
      keyCodeName = misc.capsWithUnderscoresToCamelCase(KeyCodes[keyCode], true);
    }
    return new GmEvent('onKeyPress' + keyCodeName);
  }
  
  processMouseEvent(mouseEventCode: number) {
    return new GmEvent('onMouse' + misc.capsWithUnderscoresToCamelCase(MouseEventCodes[mouseEventCode], true));
  }
  
}

