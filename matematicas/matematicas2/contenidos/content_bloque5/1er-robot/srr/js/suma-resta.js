// JavaScript Document

    if (typeof(AN) === 'undefined') {
       var AN = {}; 
    }
    AN.Controller = function() {
        return {
            scenes: {},
            scenesArray: [],
            currentSceneID: -1,
            olElement: null,
            events: {},
            useOrmma: false,
            prefix: "",
            basePath: "",

            setConfig: function(configData) {

                this.events = configData.events;
                this.prefix = configData.cssPrefix;
                this.projectActions = configData.projectActions;
                this.userData = {};
                if (configData.basePath) {
                    this.basePath = configData.basePath;
                }

                this.olElement = document.querySelector('#' + configData.parentId + ' ol');
                var liElements = this.olElement.children;

                if (configData.ormma) {
                    this.useOrmma = true;
                }

                this.sceneIdByName = {};
                var scene;
                for (var i=0; i < configData.scenes.length; i++) {
                    scene = configData.scenes[i];
                    scene.element = liElements[i];
                    this.scenes[scene.id] = scene;
                    this.scenesArray.push(scene);
                    if (scene.name) {
                        this.sceneIdByName[scene.name] = scene.id;
                    }
                    
                }

                this.setupListeners();
                
                this.startSceneByID = this.startSceneById; /*compat*/
                
                if (this.projectActions.init) {
                    this.projectActions.init.call(this.userData, this);
                }

                this.startSceneById(this.scenesArray[0].id);

            },

            runningAnimationCount: 0,
            browser: 'webkit',

            setupListeners: function() {
                var me = this;

                var eventName = "webkitAnimationEnd";

                if (document.body.style.MozAnimationName !== undefined) {
                    eventName = "animationend";
                    this.browser = "moz";
                }

                this.olElement.addEventListener(eventName, function(event) {
                    var parent;
                    if (me.browser === "moz") {
                        parent = event.target;
                        while (parent = parent.parentNode) {
                            if (parent === me.scenes[me.currentSceneID].element) {
                                me.onAnimationEnd();
                                return;
                            }
                        }
                    } else {
                        me.onAnimationEnd();
                    }
                },false);

                function addMousemoveListenerTo(scene) {
                    scene.element.addEventListener('mousemove', function(event){
                        scene.mousemoveAction.call(me.userData,me, event);
                    }, false);
                }

                var scene;
                for (var i=0; i < this.scenesArray.length; i++) {
                    scene = this.scenesArray[i];
                    if (scene.mousemoveAction) {

                        addMousemoveListenerTo(scene);
                    }
                }

                function addListenerTo(element, eventType, aFunction) {
                    element.addEventListener(eventType, function(event){
                        aFunction.call(me.userData,me,event);
                    }, false);
                }

                var element, event, type;
                for (var i=0; i < this.events.length; i++) {
                    event = this.events[i];
                    var type = event.type;
                    if (this.browser === 'moz' && event.mozType) {
                        type = event.mozType;
                    }
                    element = document.getElementById(event.id);
                    addListenerTo(element, type, event.handler);
                }

            },

            onAnimationEnd: function() {

                this.runningAnimationCount--;

                if (this.runningAnimationCount === 0) {
                    var waitTime = this.scenes[this.currentSceneID].endWaitTime;
                    if (waitTime) {
                        var me = this;
                        this.sceneEndTimeout = setTimeout(function(){
                            me.onSceneFinish();
                        },waitTime * 1000);
                    } else {
                        this.onSceneFinish();
                    }
                }
            },
            
            forceRefresh: function(sceneID) {
                this.forceRefreshValue = this.scenes[sceneID].element.offsetHeight;
            },
            
            startSceneByName: function(name) {
                var id = this.sceneIdByName[name];
                if (id !== undefined) {
                    this.startSceneById(id);
                }
            },

            startSceneById: function(sceneID) {

                var restart = false;
                if (sceneID === this.currentSceneID) {
                    restart = true;
                } else if (this.currentSceneID !== -1) {
                    this.scenes[this.currentSceneID].element.setAttribute('class','');
                }

                clearTimeout(this.sceneEndTimeout);

                this.runningAnimationCount = this.scenes[sceneID].animationCount;

                this.currentSceneID = sceneID;
                var nextScene = this.scenes[sceneID];

                if (restart || this.browser === 'moz') {
                    nextScene.element.setAttribute('class','run restart');
                    this.forceRefresh(sceneID);
                }
                
                nextScene.element.setAttribute('class','run');
                
                if (!restart && this.useOrmma) {
                   this.ormmaNextScene(nextScene);
                }

                if (nextScene.startAction) {
                    nextScene.startAction.call(this.userData, this);
                }
            
                if (nextScene.animationCount === 0 ) {
                    this.onSceneFinish();
                }

            },

            replayScene: function() {
                this.startSceneById(this.currentSceneID);
            },

            onSceneFinish: function() {
                if (this.scenes[this.currentSceneID].endAction) {
                    this.scenes[this.currentSceneID].endAction.call(this.userData,this);
                }
            },

            goToNextScene: function() {
                var nextIndex = this.scenesArray.indexOf(this.scenes[this.currentSceneID]) + 1;
                var nextScene;
                if (nextScene = this.scenesArray[nextIndex]) {
                    this.startSceneById(nextScene.id);
                }
            },
            goToPreviousScene: function() {
                var previousIndex = this.scenesArray.indexOf(this.scenes[this.currentSceneID]) - 1;
                var nextScene;
                if (previousIndex >= 0) {
                    this.startSceneById(this.scenesArray[previousIndex].id);
                }
            },
            goToURL: function(aURL) {
                document.location.href = aURL;
            },
            
            getElementById: function(animatorId) {
                var cssId = this.prefix + animatorId;
                return document.getElementById(cssId);
            },
            getUrlForLocalAsset: function(assetName) {
                var url = 'assets/' + assetName;
                if (this.basePath) {
                    url = this.basePath + '/' + url;
                }
                return url;
            },
            ormmaNextScene: function(nextScene) {
                var currentState = ormma.getState();

                if (nextScene.dimensions.expanded) {
                    //expanded state
                    //check if we're expanded
                    var maxSize = ormma.getMaxSize();
                    if (currentState !== 'expanded') {
                        ormma.expand({
                            x:0,
                            y:0,
                            width: maxSize.width,
                            height: maxSize.height
                        });
                    }

                    var transform = "";
                    var elementHeight = nextScene.element.offsetHeight;
                    var elementWidth = nextScene.element.offsetWidth;
                    var y = (maxSize.height - elementHeight) / 2;
                    var x = (maxSize.width - elementWidth) / 2;
                    transform += " translate3d("+Math.round(x)+"px,"+Math.round(y)+"px,0)";   

                    if (nextScene.dimensions.fit) {
                        var scaleFactor = Math.min(maxSize.width/elementWidth, maxSize.height/elementHeight);                    
                        transform += " scale3d("+scaleFactor+","+scaleFactor+",1)";
                    }
                    nextScene.element.style.webkitTransform = transform;

                } else {
                
                    if (currentState === 'expanded') {
                        ormma.close();
                    }
                    ormma.resize(nextScene.dimensions.width,nextScene.dimensions.height);
                }
            }
        };
    };

window.addEventListener('load', function(){
    var configData = {
        parentId: 'an-anim',
        cssPrefix: '',
        ormma: false,
        mraid: false,
        scenes: [{id: 0,animationCount: 9,duration: 13.535,lastKeyframeTime: 13.535,dimensions: {height: 675,width: 980,expanded: false,fit: false}},{id: 1,animationCount: 14,duration: 20.888,lastKeyframeTime: 20.888,dimensions: {height: 675,width: 980,expanded: false,fit: false}},{id: 2,animationCount: 13,duration: 10.689,lastKeyframeTime: 10.689,dimensions: {height: 675,width: 980,expanded: false,fit: false}},{id: 3,animationCount: 6,duration: 3.424,lastKeyframeTime: 3.424,dimensions: {height: 675,width: 980,expanded: false,fit: false}},{id: 4,animationCount: 4,duration: 7.158,lastKeyframeTime: 7.158,dimensions: {height: 675,width: 980,expanded: false,fit: false},endAction: function(controller) {
controller.startSceneByID(5);
}},{id: 5,animationCount: 6,duration: 26.85,lastKeyframeTime: 26.85,dimensions: {height: 675,width: 980,expanded: false,fit: false}},{id: 6,animationCount: 14,duration: 13.505,lastKeyframeTime: 13.505,dimensions: {height: 675,width: 980,expanded: false,fit: false}}],
        projectActions: {},
        events: [{id: "an-obj-1",type: 'click',handler: function(controller) {
controller.goToNextScene();
}},{id: "an-obj-9",type: 'click',handler: function(controller) {
controller.goToNextScene();
}},{id: "an-obj-24",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "an-obj-25",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "an-obj-26",type: 'click',handler: function(controller) {
controller.startSceneByID(3);
}},{id: "an-obj-27",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "an-obj-28",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "an-obj-39",type: 'click',handler: function(controller) {
controller.startSceneByID(6);
}},{id: "an-obj-63",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "an-obj-64",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "an-obj-65",type: 'click',handler: function(controller) {
controller.startSceneByID(3);
}},{id: "an-obj-66",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "an-obj-67",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "btncerrar",type: 'click',handler: function(controller,event) {

}}],
        externalResources: [{"url":"","type":"css"}]
    };
    setTimeout(function(){
       var controller = new AN.Controller;
       controller.setConfig(configData);
    },0);
}, false);