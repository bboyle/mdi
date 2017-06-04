/*
 * date:	2003-07-08
 * info:	http://inspire.server101.com/js/mdi/
 */

// <body>
var htmlBody;
// MDI objects
var mdiObject = [];
// positioning (for bring to front)
var mdiStack = [], mdiStackZ = 100;
// default size
var mdiWidth = 320, mdiHeight = 240;
// position of windows as they open (cascade)
var mdiOpenX = 0, mdiOpenY = 0;
var mdiOpenDeltaX = 20, mdiOpenDeltaY = 20;
// events
var mdiDRAG = 1, mdiRESIZE = 2;
var mdiFunction = [];
// focus and origin co-ordinates
var mdiFocus, mdiFocusEvent, mdiOriginX, mdiOriginY;


// set the title of a window
function mdiSetTitle(MDI, title) {
	MDI.firstChild.replaceChild(document.createTextNode(title), MDI.firstChild.firstChild);
}
function mdiSetTitleById(id, title) {
	mdiSetTitle(mdiObject[id], title);
}

// move MDI to position
function mdiMoveTo(MDI, x, y) {
	MDI = MDI.style;
	MDI.left = x + 'px';
	MDI.top = y + 'px';
}
// move MDI, by id
function mdiMoveToById(id, x, y) {
	mdiMoveTo(mdiObject[id], x, y);
}
// move (delta) MDI
function mdiMoveBy(MDI, x, y) {
	mdiMoveTo(MDI, parseInt(MDI.style.left) + x, parseInt(MDI.style.top) + y);
}

// resize MDI to size
function mdiResizeTo(MDI, w, h) {
	MDI = MDI.children[1].style;
	// resize contents element
	MDI.width = w + 'px';
	MDI.height = h + 'px';
}
// resize MDI, by id
function mdiResizeToById(id, w, h) {
	mdiResizeTo(mdiObject[id], w, h);
}
// resize (delta) MDI
function mdiResizeBy(MDI, w, h) {
	var r = MDI.children[1].style;
	mdiResizeTo(MDI, parseInt(r.width) + w, parseInt(r.height) + h);
}


// bring window to front
function mdiBringToFront(MDI) {
	// if not already at front
	if (mdiStack[-1] != MDI) {
		var foundMDI = false;
		for (i = 0; i < mdiStack.length; i++) {
			if (foundMDI) {
				// move backward
				mdiStack[i].style.zIndex = i + mdiStackZ;
				mdiStack[i-1] = mdiStack[i];
			} else if (mdiStack[i] == MDI) {
				foundMDI = true;
			}
		}
		mdiStack[i] = MDI;
		MDI.style.zIndex = mdiStack.length + mdiStackZ;
	}
}

// minimise / restore a window (toggle)
function mdiMinimise(MDI) {
	MDI = MDI.firstChild;
	// hide all except first child
	while (MDI.nextSibling) {
		MDI = MDI.nextSibling;
		MDI.style.display = MDI.style.display == 'none' ? 'block' : 'none';
	}
}
function mdiMinimiseById(id) {
	mdiMinimise(mdiObject[id]);
}


// double click on title bar
function mdiMinimiseTitle(titleBar) {
	mdiMinimise(titleBar.parentNode);
}


// mouse down on title bar
function mdiDragSelect(titleBar) {
	// select for dragging (MDI is parent of title bar)
	mdiFocus = titleBar.parentNode;
	mdiFocusEvent = mdiDRAG;
	return mdiFocusOrigin();
}

// mouse down on resize handle
function mdiResizeSelect(resizeHandle) {
	// select for dragging (MDI is parent of title bar)
	mdiFocus = resizeHandle.parentNode;
	mdiFocusEvent = mdiRESIZE;
	return mdiFocusOrigin();
}

// set origin point
function mdiFocusOrigin() {
	// store current position
	mdiOriginX = event.screenX;
	mdiOriginY = event.screenY;
	return false;
}


// mouse move
function mdiMouseMove() {
	if (mdiFocus) {
		// drag
		if (mdiFocusEvent == mdiDRAG) {
			mdiMoveBy(mdiFocus, event.screenX - mdiOriginX, event.screenY - mdiOriginY);
		} else if (mdiFocusEvent == mdiRESIZE) {
			mdiResizeBy(mdiFocus, event.screenX - mdiOriginX, event.screenY - mdiOriginY);
		}
		return mdiFocusOrigin();
	}
	return true;
}

// mouse up
function mdiMouseUp() {
	// release focus
	mdiFocus = mdiFocusEvent = null;
	return true;
}


// setup MDI windows
function mdiSet() {
	// grab the <body> element
	if (!htmlBody) {
		htmlBody = document.getElementsByTagName('body')[0];
		htmlBody.onmouseup = mdiEvent('MouseUp');
		htmlBody.onmousemove = mdiEvent('MouseMove');
	}

	var MDI, title, resize, contents;
	// setup each MDI object
	for (var i = 0; i < arguments.length; i++) {
		if (mdiObject[arguments[i]]) {
			break;
		}
		MDI = document.createElement('div');
		MDI.style.zIndex = mdiStack.length + mdiStackZ;
		mdiObject[arguments[i]] = mdiStack[mdiStack.length] = MDI;
		// set class
		MDI.className = 'MDI';
		// set initial position
		mdiMoveTo(MDI, mdiOpenX, mdiOpenY);
		mdiOpenX += mdiOpenDeltaX;
		mdiOpenY += mdiOpenDeltaY;
		// bring to front event
		MDI.onmousedown = mdiEvent('BringToFront');

		// get contents		
		contents = document.getElementById(arguments[i]);
		contents.className = 'content';
		// set initial size
		contents.style.width = mdiWidth + 'px';
		contents.style.height = mdiHeight + 'px';

		// create a title bar
		title = document.createElement('h2');
		title.appendChild(document.createTextNode(contents.getAttribute('title') || 'Untitled-'+mdiStack.length));
		contents.removeAttribute('title');
		title.className = 'titlebar';
		title.onmousedown = mdiEvent('DragSelect');
		title.ondblclick = mdiEvent('MinimiseTitle');
		
		// create a resize handle
		resize = document.createElement('a');
		resize.className = 'resize';
		resize.onmousedown = mdiEvent('ResizeSelect')
		
		// add MDI bits
		contents.parentNode.replaceChild(MDI, contents);
		MDI.appendChild(title);
		MDI.appendChild(contents);
		MDI.appendChild(resize);
	}
}


// set events
function mdiEvent(event) {
	return mdiFunction[event] || (mdiFunction[event] = new Function('return mdi'+event+'(this);'));
}