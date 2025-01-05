import {shape} from "./shape.js";

export class ellipse extends shape{
    constructor(appearanceTime,disappearanceTime,centre,height,width,outlineColour,colour,rotation,thickness){
        super(appearanceTime,disappearanceTime)

        this.centre = centre
        this.height = height
        this.width = width
        this.outlineColour = outlineColour
        this.colour = colour
        this.rotation = rotation
        this.thickness = thickness

        this.updateGeometry()
    }

    updateGeometry(){
        const geometryGroup = document.createElementNS("http://www.w3.org/2000/svg","g")

        const ellipse = document.createElementNS("http://www.w3.org/2000/svg","ellipse")

        ellipse.style.fill = this.colour
        ellipse.style.stroke = this.outlineColour
        ellipse.style.strokeWidth = this.thickness

        let extraScale = 0

        /* check for edge case where there is not enough space in the user's ellipse for the outline */
        if ((this.thickness > this.height || this.thickness > this.width) && (this.outlineColour !== null)){

            ellipse.style.stroke = "transparent"
            ellipse.style.fill = this.outlineColour

            ellipse.setAttribute("rx",this.width/2 + this.thickness/2)
            ellipse.setAttribute("ry",this.height/2 + this.thickness/2)

            extraScale = this.thickness/2
        } else {

            /* otherwise proceed as usual */

            ellipse.style.stroke = this.outlineColour
            ellipse.style.fill = this.colour

            ellipse.setAttribute("rx",this.width/2)
            ellipse.setAttribute("ry",this.height/2)

            if (this.outlineColour !== null){
                extraScale = this.thickness/2
                }
        }

        ellipse.setAttribute("cx",this.centre[0])
        ellipse.setAttribute("cy",this.centre[1])

        geometryGroup.appendChild(ellipse)

        this.geometry = geometryGroup.innerHTML

        this.left = this.centre[0]-this.width/2-extraScale
        this.right = this.centre[0]+this.width/2+extraScale
        this.top = this.centre[1]-this.height/2-extraScale
        this.bottom = this.centre[1]+this.height/2+extraScale
    }
}