const topEdge = document.getElementById("topEdge")
const leftEdge = document.getElementById("leftEdge")
const bottomEdge = document.getElementById("bottomEdge")
const rightEdge = document.getElementById("rightEdge")
let rootWindow = document.getElementById("rootWindow")

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

rootWindow.updateParentFunction = (newRootWindow) => {

        // if the root window is changed the old root window shouldn't still have the id "rootWindow"
        rootWindow.removeAttribute("id")
        newRootWindow.id = "rootWindow"

        rootWindow = newRootWindow

        document.body.appendChild(newRootWindow)
}

rootWindow.addVerticalSubEdge(firstRightSubEdge)
rootWindow.addVerticalSubEdge(firstLeftSubEdge)
rootWindow.addHorizontalSubEdge(firstTopSubEdge)
rootWindow.addHorizontalSubEdge(firstBottomSubEdge)