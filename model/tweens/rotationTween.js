import {add2dVectors, subtract2dVectors,increment2dVectorBy} from "../../maths.js";
import {controller} from "../../controller.js";
import {tween} from "./tween.js";

export class rotationTween extends tween{
    constructor(angle,aboutCentre,shape) {

        super(shape)

        this.totalAngle = angle
        this.previousAngle = 0

        // we need to ensure we don't get confused by our own translations
        this.translationCausedByUs = [0,0]

        this.relativeCentre = subtract2dVectors(aboutCentre,this.shape.getPosition())
    }

    goToTime(time){
        const currentAngle = this.totalAngle*(time-this.startTime)/this.timeLength

        const angleToRotate = currentAngle-this.previousAngle

        const centre = add2dVectors(
            this.shape.getPosition(),
            subtract2dVectors(
                this.relativeCentre,
                this.translationCausedByUs
            )
        )

        const positionBeforeRotation = this.shape.getPosition()

        this.shape.rotate(angleToRotate,centre)

        increment2dVectorBy(this.translationCausedByUs,subtract2dVectors(this.shape.getPosition(),positionBeforeRotation))

        controller.updateShape(this.shape)

        this.previousAngle = currentAngle
    }

    finish(){
        this.goToTime(this.startTime+this.timeLength)
    }

    beforeStart(){
        this.goToTime(this.startTime)
    }
}