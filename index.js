// main javascript file for the project

import {controller} from "./controller.js";

document.getElementById("undoButton").onpointerdown = controller.undoAction.bind(controller)
document.getElementById("redoButton").onpointerdown = controller.redoAction.bind(controller)

const topEdge = document.getElementById("topEdge")
const leftEdge = document.getElementById("leftEdge")
const bottomEdge = document.getElementById("bottomEdge")
const rightEdge = document.getElementById("rightEdge")
let rootWindow = document.getElementById("rootWindow")

makeWindowFullScreen(rootWindow)

const defaultCanvas = document.createElement("create-edit-canvas")
const defaultTimeline = document.createElement("time-line")
const defaultWindow = document.createElement("vertically-split-window")

rootWindow.switchWindowTo(defaultWindow)
defaultWindow.topWindow.switchWindowTo(defaultCanvas)
defaultWindow.bottomWindow.switchWindowTo(defaultTimeline)

function setNewRootWindow(newRootWindow){
        rootWindow.removeAttribute("id")
        newRootWindow.id = "rootWindow"
        newRootWindow.removeAttribute("style")

        newRootWindow.updateParentFunction = setNewRootWindow
        newRootWindow.setFullScreen(makeWindowFullScreen)

        rootWindow = newRootWindow

        document.body.appendChild(newRootWindow)
}

function makeWindowFullScreen(newRootWindow){
        rootWindow.remove()
        setNewRootWindow(newRootWindow)

        const firstTopSubEdge = topEdge.activate(leftEdge,rightEdge,rootWindow,"top",(subEdge) => {

                const windowToReplace = subEdge.associatedWindow
                const replaceWindowWith = document.createElement("vertically-split-window")

                windowToReplace.switchWindowTo(replaceWindowWith)
                replaceWindowWith.bottomWindow.switchWindowTo(windowToReplace)

                return replaceWindowWith
        })
        const firstLeftSubEdge = leftEdge.activate(topEdge,bottomEdge,rootWindow,"left",(subEdge) => {

                const windowToReplace = subEdge.associatedWindow
                const replaceWindowWith = document.createElement("horizontally-split-window")

                windowToReplace.switchWindowTo(replaceWindowWith)
                replaceWindowWith.rightWindow.switchWindowTo(windowToReplace)

                return replaceWindowWith
        })
        const firstBottomSubEdge = bottomEdge.activate(leftEdge,rightEdge,rootWindow,"bottom",(subEdge) => {

                const windowToReplace = subEdge.associatedWindow
                const replaceWindowWith = document.createElement("vertically-split-window")

                windowToReplace.switchWindowTo(replaceWindowWith)
                replaceWindowWith.topWindow.switchWindowTo(windowToReplace)

                return replaceWindowWith
        })
        const firstRightSubEdge = rightEdge.activate(topEdge,bottomEdge,rootWindow,"right",(subEdge) =>{

                const windowToReplace = subEdge.associatedWindow
                const replaceWindowWith = document.createElement("horizontally-split-window")

                windowToReplace.switchWindowTo(replaceWindowWith)
                replaceWindowWith.leftWindow.switchWindowTo(windowToReplace)

                return replaceWindowWith
        })

        rootWindow.addVerticalSubEdge(firstRightSubEdge)
        rootWindow.addVerticalSubEdge(firstLeftSubEdge)
        rootWindow.addHorizontalSubEdge(firstTopSubEdge)
        rootWindow.addHorizontalSubEdge(firstBottomSubEdge)
}