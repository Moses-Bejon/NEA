import {add2dVectors, subtract2dVectors,increment2dVectorBy} from "../../maths.js";
import {controller} from "../../controller.js";
import {tween} from "./tween.js";

export class scaleTween extends tween{
    constructor(scaleFactor,aboutCentre,shape) {

        super(shape)

        this.totalScale = scaleFactor
        this.previousScale = 1

        // we need to ensure we don't get confused by our own translations
        this.translationCausedByUs = [0,0]

        this.relativeCentre = subtract2dVectors(aboutCentre,this.shape.getPosition())
    }

    save(){
        const tweenSave = super.save()

        tweenSave.totalScale = this.totalScale
        tweenSave.relativeCentre = this.relativeCentre
        tweenSave.tweenType = "scaleTween"

        return tweenSave
    }

    load(save){
        this.totalScale = save.totalScale
        this.relativeCentre = save.relativeCentre

        super.load(save)
    }

    scaleBy(scaleFactor){
        const centre = add2dVectors(
            this.shape.getPosition(),
            subtract2dVectors(
                this.relativeCentre,
                this.translationCausedByUs
            )
        )

        const positionBeforeScale = this.shape.getPosition()

        this.shape.scale(scaleFactor,centre)

        increment2dVectorBy(this.translationCausedByUs,subtract2dVectors(this.shape.getPosition(),positionBeforeScale))

        controller.updateShape(this.shape)
    }

    goToTime(time){
        const currentScale = 1+(this.totalScale-1)*(time-this.startTime)/this.timeLength

        const amountToScale = currentScale/this.previousScale

        this.scaleBy(amountToScale)

        this.previousScale = currentScale
    }

    finish(){
        this.scaleBy(this.totalScale/this.previousScale)

        this.previousScale = this.totalScale
    }

    beforeStart(){
        this.scaleBy(1/this.previousScale)

        this.previousScale = 1
    }
}