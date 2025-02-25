import {addDragLogicTo} from "../../../dragLogic.js";
import {clamp} from "../../../maths.js";
import {controller} from "../../../controller.js";
import {
    animationEndTimeSeconds,
    bumperTranslation,
    timelineRightMenuSizePercentage,
    timelineSnapLength
} from "../../../globalValues.js";
import {timelineTween} from "./timelineTween.js";
import {timelineChange} from "./timelineChange.js";

export class shapeTimeline{
    constructor(parentTimeline,shape) {

        // timeline event object to event token geometry on timeline
        this.timelineEventToEventToken = new Map()

        // tween model to relevant tween presentation class
        this.tweenToTimelineTween = new Map()

        this.shapeSection = document.createElement("div")
        this.shapeSection.className = "timeline"

        const labelContainer = document.createElement("div")
        labelContainer.className = "labelContainer"

        this.label = document.createElement("h2")
        this.label.innerText = shape.name
        labelContainer.appendChild(this.label)

        this.parentTimeline = parentTimeline
        this.shape = shape

        this.timelineContainer = document.createElement("div")
        this.timelineContainer.style.width = timelineRightMenuSizePercentage+"%"
        this.timelineContainer.style.height = "100%"
        this.timelineContainer.style.position = "relative"

        // setting up a local stacking context, so the super high z indices in this window don't leak
        // (I need them to be high to ensure that thinner tweens are above thicker tweens)
        this.timelineContainer.style.zIndex = 0

        for (const timelineEvent of shape.timelineEvents){
            if (timelineEvent.type === "appearance"){
                this.appearanceEvent = timelineEvent
            } else if (timelineEvent.type === "disappearance"){
                this.disappearanceEvent = timelineEvent
            } else {
                this.addTimeLineEvent(timelineEvent)
            }
        }

        this.timeline = document.createElement("div")
        this.timeline.style.position = "relative"
        this.timeline.className = "timelineEvents"

        this.updatePosition()

        const topLeftBumper = document.createElement("div")
        topLeftBumper.className = "bumper"
        topLeftBumper.style.left = "0"
        topLeftBumper.style.top = bumperTranslation + "px"
        this.timeline.appendChild(topLeftBumper)

        const topRightBumper = document.createElement("div")
        topRightBumper.className = "bumper"
        topRightBumper.style.right = "0"
        topRightBumper.style.top = bumperTranslation + "px"
        this.timeline.appendChild(topRightBumper)

        const bottomRightBumper = document.createElement("div")
        bottomRightBumper.className = "bumper"
        bottomRightBumper.style.right = "0"
        bottomRightBumper.style.bottom = bumperTranslation + "px"
        this.timeline.appendChild(bottomRightBumper)

        const bottomLeftBumper = document.createElement("div")
        bottomLeftBumper.className = "bumper"
        bottomLeftBumper.style.left = "0"
        bottomLeftBumper.style.bottom = bumperTranslation + "px"
        this.timeline.appendChild(bottomLeftBumper)

        addDragLogicTo(topLeftBumper,
            this.dragLeftBumper.bind(this),
            this.finishDraggingLeftBumper.bind(this),
            this.setInitialPointerPosition.bind(this),
            "ew-resize",
            "ew-resize"
        )
        addDragLogicTo(bottomLeftBumper,
            this.dragLeftBumper.bind(this),
            this.finishDraggingLeftBumper.bind(this),
            this.setInitialPointerPosition.bind(this),
            "ew-resize",
            "ew-resize"
        )

        addDragLogicTo(topRightBumper,
            this.dragRightBumper.bind(this),
            this.finishDraggingRightBumper.bind(this),
            this.setInitialPointerPosition.bind(this),
            "ew-resize",
            "ew-resize"
        )
        addDragLogicTo(bottomRightBumper,
            this.dragRightBumper.bind(this),
            this.finishDraggingRightBumper.bind(this),
            this.setInitialPointerPosition.bind(this),
            "ew-resize",
            "ew-resize"
        )

        this.shapeSection.appendChild(labelContainer)

        this.timelineContainer.appendChild(this.timeline)
        this.shapeSection.appendChild(this.timelineContainer)

        parentTimeline.timelineList.appendChild(this.shapeSection)
        parentTimeline.shapeToTimeline.set(shape,this)
    }

    possibleNewTween(tween){
        if (!this.tweenToTimelineTween.has(tween)){
            this.tweenToTimelineTween.set(tween,new timelineTween(this.parentTimeline,this.timelineContainer,tween))
        }
    }

    addTimeLineEvent(event){

        switch (event.type){
            // we use the shapes to tell us about these types of events
            // since they have appearance and disappearance times
            case "appearance":
            case "disappearance":
                return

            case "change":
                this.timelineEventToEventToken.set(event,new timelineChange(this.parentTimeline,this.timelineContainer,event))

                break

            case "tweenStart":

                this.possibleNewTween(event.tween)

                this.tweenToTimelineTween.get(event.tween).receiveStart(event)

                break

            case "tweenEnd":

                this.possibleNewTween(event.tween)

                this.tweenToTimelineTween.get(event.tween).receiveEnd(event)

                break

            default:
                console.error("unexpected shape type",event.type)
        }
    }

    removeTimeLineEvent(event){

        if (event.type === "change"){
            this.timelineEventToEventToken.get(event).remove()
            this.timelineEventToEventToken.delete(event)
        } else if (event.type === "tweenStart"){
            this.tweenToTimelineTween.get(event.tween).removeStart()
        } else if (event.type === "tweenEnd"){
            this.tweenToTimelineTween.get(event.tween).removeEnd()
        }
    }

    updateTimeLineEvent(event){
        if (event.type === "change"){
            this.timelineEventToEventToken.get(event).update()
        } else if (event.type === "tweenStart"){
            this.tweenToTimelineTween.get(event.tween).removeStart()
            this.tweenToTimelineTween.get(event.tween).receiveStart(event)
        } else if (event.type === "tweenEnd"){
            this.tweenToTimelineTween.get(event.tween).removeEnd()
            this.tweenToTimelineTween.get(event.tween).receiveEnd(event)
        }
    }

    updatePosition(){

        this.startTime = this.shape.appearanceTime
        this.endTime = this.shape.disappearanceTime

        this.startProportion = this.parentTimeline.timeToTimelinePosition(this.startTime)
        this.endProportion = this.parentTimeline.timeToTimelinePosition(this.endTime)

        const startPosition = 100*this.startProportion + "%"

        const width = 100*(this.endProportion-this.startProportion) + "%"

        this.timeline.style.left = startPosition
        this.timeline.style.width = width
    }

    setInitialPointerPosition(pointerEvent) {
        this.initialPosition = pointerEvent.clientX
        pointerEvent.stopPropagation()
    }

    dragRightBumper(pointerEvent){
        const currentPosition = pointerEvent.clientX

        const newEndProportion = clamp(
            this.endProportion + this.parentTimeline.globalWidthToTimelineWidth(currentPosition-this.initialPosition),
            this.startProportion+timelineSnapLength/animationEndTimeSeconds,
            1
        )

        this.timeline.style.width = 100*(newEndProportion-this.startProportion) + "%"

        return newEndProportion
    }

    finishDraggingRightBumper(pointerEvent){
        const newEnd = this.dragRightBumper(pointerEvent)

        const previousTime = this.endTime
        const newTime = this.parentTimeline.snapValueToCellBorder(this.parentTimeline.timeLinePositionToTime(newEnd))

        controller.newAction(
            () => {
                this.shape.disappearanceTime = newTime
                controller.changeTimeOfEvent(this.disappearanceEvent,newTime)
            },
            () => {
                this.shape.disappearanceTime = previousTime
                controller.changeTimeOfEvent(this.disappearanceEvent,previousTime)
            },
            []
        )
    }

    dragLeftBumper(pointerEvent){
        const currentPosition = pointerEvent.clientX

        const newStartProportion = clamp(
            this.startProportion + this.parentTimeline.globalWidthToTimelineWidth(currentPosition-this.initialPosition),
            0,
            this.endProportion-timelineSnapLength/animationEndTimeSeconds
        )

        this.timeline.style.left = 100*newStartProportion + "%"
        this.timeline.style.width = 100*(this.endProportion-newStartProportion) + "%"

        return newStartProportion
    }

    finishDraggingLeftBumper(pointerEvent){
        const newStart = this.dragLeftBumper(pointerEvent)

        const previousTime = this.startTime
        const newTime = this.parentTimeline.snapValueToCellBorder(this.parentTimeline.timeLinePositionToTime(newStart))

        controller.newAction(
            () => {
                this.shape.appearanceTime = newTime
                controller.changeTimeOfEvent(this.appearanceEvent,newTime)
            },
            () => {
                this.shape.appearanceTime = previousTime
                controller.changeTimeOfEvent(this.appearanceEvent,previousTime)
            },
            []
        )
    }

    deselectAll(){
        for (const [event,token] of this.timelineEventToEventToken){
            token.deselect()
        }

        for (const [tween,token] of this.tweenToTimelineTween){
            token.deselect()
        }
    }
}