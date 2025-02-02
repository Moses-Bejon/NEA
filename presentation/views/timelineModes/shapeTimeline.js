import {addDragLogicTo} from "../../../dragLogic.js";
import {clamp} from "../../../maths.js";
import {controller} from "../../../controller.js";
import {bumperTranslation,timelineRightMenuSizePercentage} from "../../../constants.js";

export class shapeTimeline{
    constructor(parentTimeline,shape) {

        this.shapeSection = document.createElement("div")
        this.shapeSection.className = "timeline"

        const labelDropdownContainer = document.createElement("div")
        labelDropdownContainer.className = "labelDropdownContainer"

        const dropDown = document.createElement("img")
        dropDown.src = "assets/dropdown.svg"
        dropDown.className = "dropdown"
        labelDropdownContainer.appendChild(dropDown)

        this.label = document.createElement("h2")
        this.label.innerText = shape.name
        labelDropdownContainer.appendChild(this.label)

        this.parentTimeline = parentTimeline
        this.shape = shape

        for (const timelineEvent of shape.timelineEvents){
            if (timelineEvent.type === "appearance"){
                this.appearanceEvent = timelineEvent
            } else if (timelineEvent.type === "disappearance"){
                this.disappearanceEvent = timelineEvent
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

        this.shapeSection.appendChild(labelDropdownContainer)

        this.shapeSection.appendChild(this.timeline)

        parentTimeline.timelineList.appendChild(this.shapeSection)
        parentTimeline.shapeToTimeline.set(shape,this)
    }

    updatePosition(){

        this.startTime = this.shape.appearanceTime
        this.endTime = this.shape.disappearanceTime

        this.startProportion = this.parentTimeline.timeToTimelinePosition(this.startTime)
        this.endProportion = this.parentTimeline.timeToTimelinePosition(this.endTime)

        const startPosition = timelineRightMenuSizePercentage*this.startProportion + "%"

        // width of entire timeline is 100% but that includes 15% of left menu, so 85 used
        const width = timelineRightMenuSizePercentage*(this.endProportion-this.startProportion) + "%"

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
            this.startProportion,
            1
        )

        this.timeline.style.width = timelineRightMenuSizePercentage*(newEndProportion-this.startProportion) + "%"

        return newEndProportion
    }

    finishDraggingRightBumper(pointerEvent){
        const newEnd = this.dragRightBumper(pointerEvent)

        const previousTime = this.endTime
        const newTime = this.parentTimeline.timeLinePositionToTime(newEnd)

        controller.newAction(
            () => {
                this.shape.disappearanceTime = newTime
                controller.changeTimeOfEvent(this.disappearanceEvent,newTime)
            },
            () => {
                this.shape.disappearanceTime = previousTime
                controller.changeTimeOfEvent(this.disappearanceEvent,previousTime)
            }
        )
    }

    dragLeftBumper(pointerEvent){
        const currentPosition = pointerEvent.clientX

        const newStartProportion = clamp(
            this.startProportion + this.parentTimeline.globalWidthToTimelineWidth(currentPosition-this.initialPosition),
            0,
            this.endProportion
        )

        this.timeline.style.left = timelineRightMenuSizePercentage*newStartProportion + "%"
        this.timeline.style.width = timelineRightMenuSizePercentage*(this.endProportion-newStartProportion) + "%"

        return newStartProportion
    }

    finishDraggingLeftBumper(pointerEvent){
        const newStart = this.dragLeftBumper(pointerEvent)

        const previousTime = this.startTime
        const newTime = this.parentTimeline.timeLinePositionToTime(newStart)

        controller.newAction(
            () => {
                this.shape.appearanceTime = newTime
                controller.changeTimeOfEvent(this.appearanceEvent,newTime)
            },
            () => {
                this.shape.appearanceTime = previousTime
                controller.changeTimeOfEvent(this.appearanceEvent,previousTime)
            }
        )
    }
}