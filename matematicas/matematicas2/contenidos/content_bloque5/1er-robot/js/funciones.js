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
        scenes: [{id: 0,animationCount: 3,duration: 6.291,lastKeyframeTime: 6.291,dimensions: {height: 675,width: 980,expanded: false,fit: false},startAction: function(controller,event) {
//Enter your custom js code here; 
//E.g. controller.goToNextScene()
//See docs or use autocompletion for other calls
//For mouse/touch events, the event object is also available


}},{id: 1,animationCount: 9,duration: 25.833,lastKeyframeTime: 25.833,dimensions: {height: 675,width: 980,expanded: false,fit: false},startAction: function(controller,event) {
//Enter your custom js code here; 
//E.g. controller.goToNextScene()
//See docs or use autocompletion for other calls
//For mouse/touch events, the event object is also available


}},{id: 2,animationCount: 10,duration: 8.938,lastKeyframeTime: 8.938,dimensions: {height: 675,width: 980,expanded: false,fit: false}},{id: 3,animationCount: 16,duration: 18.208,lastKeyframeTime: 18.208,dimensions: {height: 675,width: 980,expanded: false,fit: false}},{id: 4,animationCount: 10,duration: 6.598,lastKeyframeTime: 6.598,dimensions: {height: 675,width: 980,expanded: false,fit: false},endAction: function(controller) {
controller.startSceneByID(10);
}},{id: 10,animationCount: 4,duration: 20.259,lastKeyframeTime: 20.259,dimensions: {height: 675,width: 980,expanded: false,fit: false}},{id: 5,animationCount: 9,duration: 14.543,lastKeyframeTime: 14.543,dimensions: {height: 675,width: 980,expanded: false,fit: false}},{id: 6,animationCount: 15,duration: 35.823,lastKeyframeTime: 35.823,dimensions: {height: 675,width: 980,expanded: false,fit: false}},{id: 7,animationCount: 5,duration: 12.022,lastKeyframeTime: 12.022,dimensions: {height: 675,width: 980,expanded: false,fit: false},endAction: function(controller) {
controller.goToNextScene();
}},{id: 9,animationCount: 4,duration: 36.534,lastKeyframeTime: 36.534,dimensions: {height: 675,width: 980,expanded: false,fit: false}},{id: 8,animationCount: 13,duration: 21.443,lastKeyframeTime: 21.443,dimensions: {height: 675,width: 980,expanded: false,fit: false}}],
        projectActions: {},
        events: [{id: "an-obj-1",type: 'click',handler: function(controller) {
controller.goToNextScene();
}},{id: "an-obj-5",type: 'click',handler: function(controller) {
controller.goToNextScene();
}},{id: "an-obj-15",type: 'click',handler: function(controller) {
controller.goToNextScene();
}},{id: "an-obj-16",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "an-obj-17",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "an-obj-42",type: 'click',handler: function(controller) {
controller.goToNextScene();
}},{id: "an-obj-43",type: 'click',handler: function(controller) {
controller.startSceneByID(5);
}},{id: "an-obj-96",type: 'click',handler: function(controller) {
controller.startSceneByID(3);
}},{id: "an-obj-97",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "an-obj-98",type: 'click',handler: function(controller) {
controller.startSceneByID(4);
}},{id: "an-obj-125",type: 'click',handler: function(controller) {
controller.goToNextScene();
}},{id: "an-obj-136",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-137",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-138",type: 'click',handler: function(controller) {
controller.startSceneByID(8);
}},{id: "an-obj-139",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-140",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-141",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-142",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-143",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-168",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-169",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-170",type: 'click',handler: function(controller) {
controller.startSceneByID(8);
}},{id: "an-obj-171",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-172",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-173",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-174",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "an-obj-175",type: 'click',handler: function(controller) {
controller.startSceneByID(7);
}},{id: "cerrar",type: 'click',handler: function(controller,event) {
	/*window.close();*/

}}],
        externalResources: [{"url":"js/ani_maq.js","type":"js"}]
    };
    setTimeout(function(){
       var controller = new AN.Controller;
       controller.setConfig(configData);
    },0);
}, false);