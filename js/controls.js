/*
 * special thanks and credits for the code to jeromeetienne
 * @see https://github.com/jeromeetienne/threejsboilerplate/blob/master/vendor/threex.dragpancontrols.js
 */

angular.module('controls', [])

    .factory('controls.DragPan', function() {
        var DragPan = function DragPan(object, domElement) {
            this._object    = object;
            this._domElement = domElement || document;

            // parameters that you can change after initialisation
            this.target = new THREE.Vector3(0, 0, 0);
            this.speedX = 1;
            this.speedY = 1;
            this.rangeX = -40;
            this.rangeY = +40;

            // private variables
            this._mouseX    = 0;
            this._mouseY    = 0;

            var _this   = this;
            this._$onMouseMove  = function(){ _this._onMouseMove.apply(_this, arguments); };
            this._$onTouchStart = function(){ _this._onTouchStart.apply(_this, arguments); };
            this._$onTouchMove  = function(){ _this._onTouchMove.apply(_this, arguments); };

            this._domElement.addEventListener( 'mousemove', this._$onMouseMove, false );
            this._domElement.addEventListener( 'touchstart', this._$onTouchStart, false );
            this._domElement.addEventListener( 'touchmove', this._$onTouchMove, false );

            return this;
        };

        DragPan.prototype.destroy = function() {
            this._domElement.removeEventListener( 'mousemove', this._$onMouseMove, false );
            this._domElement.removeEventListener( 'touchstart', this._$onTouchStart,false );
            this._domElement.removeEventListener( 'touchmove', this._$onTouchMove, false );
        };

        DragPan.prototype.update = function(event) {
            this._object.position.x += ( this._mouseX * this.rangeX - this._object.position.x ) * this.speedX;
            this._object.position.y += ( this._mouseY * this.rangeY - this._object.position.y ) * this.speedY;
            this._object.lookAt( this.target );
        };

        DragPan.prototype._onMouseMove = function(event) {
            this._mouseX    = ( event.clientX / window.innerWidth ) - 0.5;
            this._mouseY    = ( event.clientY / window.innerHeight) - 0.5;
        };

        DragPan.prototype._onTouchStart  = function(event) {
            if( event.touches.length != 1 ) return;

            // no preventDefault to get click event on ios

            this._mouseX    = ( event.touches[ 0 ].pageX / window.innerWidth ) - 0.5;
            this._mouseY    = ( event.touches[ 0 ].pageY / window.innerHeight) - 0.5;
        };

        DragPan.prototype._onTouchMove   = function(event) {
            if( event.touches.length != 1 ) return;

            event.preventDefault();

            this._mouseX    = ( event.touches[ 0 ].pageX / window.innerWidth ) - 0.5;
            this._mouseY    = ( event.touches[ 0 ].pageY / window.innerHeight) - 0.5;
        };

        return DragPan;
    })

    /**
     * special thanks to mr. doob for the majority of the following control code:
     *
     */
    .factory('controls.FreeFloat', function() {

        var FreeControls = function FreeControls( object, domElement ) {

            this.object = object;
            this.target = new THREE.Vector3( 0, 0, 0 );

            this.domElement = ( domElement !== undefined ) ? domElement : document;
            this.hasPointerLock = false;
            this.requirePointerLock = true;
            this.movementSpeed = 1.0;
            this.lookSpeed = 1;

            this.lookVertical = true;
            this.autoForward = false;
            // this.invertVertical = false;

            this.activeLook = true;

            this.heightSpeed = false;
            this.heightCoef = 1.0;
            this.heightMin = 0.0;
            this.heightMax = 1.0;

            // TODO: change this to true
            this.constrainVertical = false;
            this.verticalMin = 0;
            this.verticalMax = Math.PI;

            this.autoSpeedFactor = 0.0;

            this.mouseX = 0;
            this.mouseY = 0;
            this.anchorX = 0;
            this.anchorY = 0;

            this.lat = 0;
            this.lon = 0;
            this.phi = 0;
            this.theta = 0;

            this.moveForward = false;
            this.moveBackward = false;
            this.moveLeft = false;
            this.moveRight = false;
            this.freeze = false;

            this.mouseDragOn = false;

            this.viewHalfX = 0;
            this.viewHalfY = 0;

            if ( this.domElement !== document ) {

                this.domElement.setAttribute( 'tabindex', -1 );

            }

            //

            this.handleResize = function () {

                if ( this.domElement === document ) {

                    this.viewHalfX = window.innerWidth / 2;
                    this.viewHalfY = window.innerHeight / 2;

                } else {

                    this.viewHalfX = this.domElement.offsetWidth / 2;
                    this.viewHalfY = this.domElement.offsetHeight / 2;

                }

            };

            this.onMouseDown = function ( event ) {

                if ( this.domElement !== document ) {

                    this.domElement.focus();

                }

                event.preventDefault();
                event.stopPropagation();

                if ( this.activeLook ) {

                    switch ( event.button ) {

                        case 0: this.moveForward = true; break;
                        case 2: this.moveBackward = true; break;

                    }

                }

                this.mouseDragOn = true;

            };

            this.onMouseUp = function ( event ) {

                event.preventDefault();
                event.stopPropagation();

                if ( this.activeLook ) {

                    switch ( event.button ) {

                        case 0: this.moveForward = false; break;
                        case 2: this.moveBackward = false; break;

                    }

                }

                this.mouseDragOn = false;

            };

            this.onKeyDown = function ( event ) {

                //event.preventDefault();

                switch ( event.keyCode ) {

                    case 38: /*up*/
                    case 87: /*W*/ this.moveForward = true; break;

                    case 37: /*left*/
                    case 65: /*A*/ this.moveLeft = true; break;

                    case 40: /*down*/
                    case 83: /*S*/ this.moveBackward = true; break;

                    case 39: /*right*/
                    case 68: /*D*/ this.moveRight = true; break;

                    case 82: /*R*/ this.moveUp = true; break;
                    case 70: /*F*/ this.moveDown = true; break;

                    case 81: /*Q*/ this.freeze = !this.freeze; break;

                }

            };

            this.onKeyUp = function ( event ) {

                switch( event.keyCode ) {

                    case 38: /*up*/
                    case 87: /*W*/ this.moveForward = false; break;

                    case 37: /*left*/
                    case 65: /*A*/ this.moveLeft = false; break;

                    case 40: /*down*/
                    case 83: /*S*/ this.moveBackward = false; break;

                    case 39: /*right*/
                    case 68: /*D*/ this.moveRight = false; break;

                    case 82: /*R*/ this.moveUp = false; break;
                    case 70: /*F*/ this.moveDown = false; break;

                }

            };

            this.onMouseMove = function ( event ) {
                if ( this.hasPointerLock ) {
                    this.dx =
                        event.movementX ||
                        event.webkitMovementX ||
                        event.mozMovementX ||
                        event.msMovementX ||
                        event.oMovementX ||
                        0;

                    this.dy =
                        event.movementY ||
                        event.webkitMovementY ||
                        event.mozMovementY ||
                        event.msMovementY ||
                        event.oMovementY ||
                        0;

                } else if ( this.domElement === document ) {

                    this.mouseX = event.pageX - this.viewHalfX;
                    this.mouseY = event.pageY - this.viewHalfY;

                } else {

                    this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
                    this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

                }
            };

            this.onPointerLockChange = function() {
                // defaulted to false.
                this.hasPointerLock = !this.hasPointerLock;
                if ((this.hasPointerLock && this.requirePointerLock) ||
                    (!this.requirePointerLock)) {
                    this.attain();
                } else {
                    this.release();
                }
            };

            this.onPointerLockError = function() {
                this.hasPointerLock = false;
                this.release();
            };

            this.update = function( delta ) {

                if ( this.freeze ) {

                    return;

                }

                if ( this.heightSpeed ) {

                    var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
                    var heightDelta = y - this.heightMin;

                    this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

                } else {

                    this.autoSpeedFactor = 0.0;

                }

                var actualMoveSpeed = delta * this.movementSpeed;

                if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
                if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

                if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
                if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

                if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
                if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

                var actualLookSpeed = this.lookSpeed;

                if ( !this.activeLook ) {

                    actualLookSpeed = 0;

                }

                var verticalLookRatio = 1;

                if ( this.constrainVertical ) {

                    verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

                }

                if ( !this.hasPointerLock ) {
                    this.dx = this.mouseX - this.anchorX;
                    this.dy = this.mouseY - this.anchorY;
                }

                this.lon += this.dx * actualLookSpeed;
                if( this.lookVertical ) this.lat -= this.dy * actualLookSpeed * verticalLookRatio;
                this.anchorX = this.mouseX;
                this.anchorY = this.mouseY;

                this.dx = 0;
                this.dy = 0;

                this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
                this.phi = THREE.Math.degToRad( 90 - this.lat );

                this.theta = THREE.Math.degToRad( this.lon );

                if ( this.constrainVertical ) {

                    this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

                }

                var targetPosition = this.target,
                    position = this.object.position;

                //
                targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
                targetPosition.y = position.y + 100 * Math.cos( this.phi );
                targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

                this.object.lookAt( targetPosition );

            };

            this.attain = function() {
                if ((this.hasPointerLock && this.requirePointerLock) ||
                    (!this.requirePointerLock)) {

                    this.domElement.addEventListener( 'contextmenu', this.onContextMenu, false );
                    this.domElement.addEventListener( 'mousemove', this.onMouseMove, false );
                    this.domElement.addEventListener( 'mousedown', this.onMouseDown, false );
                    this.domElement.addEventListener( 'mouseup', this.onMouseUp, false );
                    this.domElement.addEventListener( 'keydown', this.onKeyDown, false );
                    this.domElement.addEventListener( 'keyup', this.onKeyUp, false );
                }
            };

            this.release = function() {
                // remove them for any call, better safe than sorry.
                this.domElement.removeEventListener( 'contextmenu', this.onContextMenu, false );
                this.domElement.removeEventListener( 'mousemove', this.onMouseMove, false );
                this.domElement.removeEventListener( 'mousedown', this.onMouseDown, false );
                this.domElement.removeEventListener( 'mouseup', this.onMouseUp, false );
                this.domElement.removeEventListener( 'keydown', this.onKeyDown, false );
                this.domElement.removeEventListener( 'keyup', this.onKeyUp, false );
            };

            this.destroy = function() {
                this.release();

                for(var i = 0, len = vendors.length; i < len; ++i) {
                    document.removeEventListener(vendors[i] + 'pointerlockchange', this.onPointerLockChange, false);
                    document.removeEventListener(vendors[i] + 'pointerlockerror', this.onPointerLockError, false);
                }
            };

            this.registerEvents = function() {
                this.attain();

                var vendors = ['', 'webkit', 'moz', 'ms', 'o'];

                for(var i = 0, len = vendors.length; i < len; ++i) {
                    document.addEventListener(vendors[i] + 'pointerlockchange', this.onPointerLockChange, false);
                    document.addEventListener(vendors[i] + 'pointerlockerror', this.onPointerLockError, false);
                }
            };

            this.onContextMenu = bind( this, function ( event ) { event.preventDefault(); });
            this.onMouseMove = bind( this, this.onMouseMove );
            this.onMouseDown = bind( this, this.onMouseDown );
            this.onMouseUp = bind( this, this.onMouseUp );
            this.onKeyDown = bind( this, this.onKeyDown );
            this.onKeyUp = bind( this, this.onKeyUp );
            this.onPointerLockChange = bind(this, this.onPointerLockChange);
            this.onPointerLockError = bind(this, this.onPointerLockError);

            this.registerEvents();

            function bind( scope, fn ) {
                return function () {
                    fn.apply( scope, arguments );
                };
            };

            this.handleResize();
        };

        return FreeControls;
    })
;