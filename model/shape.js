import {midPoint2d} from "../maths.js";
import {controller} from "../controller.js";

export class shape{
    constructor(appearanceTime,disappearanceTime) {
        this.appearanceTime = appearanceTime
        this.disappearanceTime = disappearanceTime

        // all the things that occur to the shape throughout the animation
        this.timelineEvents = new Set()

        this.modelConstructed = false
    }

    // The model needs to also construct shapes to ensure shapes have attributes which
    // are necessary for their proper functionality, such as setting a unique name or
    // initializing the z-index. This function assigns these attributes to the shapes.

    // the function should only be called once
    // the modelConstructed boolean is used to ensure the controller doesn't do this twice
    modelConstruct(newZIndex,name){
        this.ZIndex = newZIndex
        this.name = name

        // once the controller knows about us we create our appearance and disappearance events
        this.appearanceEvent = {
            "type": "appearance",
            "shape": this,
            "time": this.appearanceTime,
            "forward": () => {controller.showShape(this)},
            "backward": () => {controller.hideShape(this)}
        }
        this.disappearanceEvent = {
            "type": "disappearance",
            "shape": this,
            "time": this.disappearanceTime,
            "forward": () => {controller.hideShape(this)},
            "backward": () => {controller.showShape(this)}
        }

        controller.addTimeLineEvent(this.appearanceEvent)
        controller.addTimeLineEvent(this.disappearanceEvent)

        this.modelConstructed = true
    }

    newAppearanceTime(newTime){
        this.appearanceTime = newTime
        controller.changeTimeOfEvent(this.appearanceEvent,newTime)
    }

    newDisappearanceTime(newTime){
        this.disappearanceTime = newTime
        controller.changeTimeOfEvent(this.disappearanceEvent,newTime)
    }

    getPosition(){
        return midPoint2d([this.left,this.top],[this.right,this.bottom])
    }

    geometryAttributeUpdate(attribute, newValue){
        this[attribute] = newValue

        this.updateGeometry()

        controller.updateShape(this)
    }

    addTimelineEvent(event){
        this.timelineEvents.add(event)
    }

    removeTimelineEvent(event){
        this.timelineEvents.delete(event)
    }
}