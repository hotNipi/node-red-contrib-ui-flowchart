var path = require('path');
module.exports = function (RED) {
	function HTML(config) {

		var fec = JSON.stringify({
			config
		});

		var styles = String.raw`
		<style>
            .flowchart-{{unique}}{
                width: 100%;
                height: 100%;
                display: grid;
                grid-template-areas: "g-0-0 g-0-1 g-0-2";
                align-content: space-around;
                justify-items: center;
                justify-content: space-around;
                align-items: center;
				user-select:none;               
            }
            .flowchart-item-wrapper{
                text-align:center;
            }
			
            .flowchart-item {
                display: flex;
				position: relative;
                flex-direction:column;       
                border: 4px solid;        
                justify-content: center;
                align-items: center;
				padding: 1em;
                background: var(--nr-dashboard-widgetBgndColor);
            }
			.flowchart-item.text-shadow > span{
				position: relative;
				z-index:2;
			}
			.flowchart-item.text-shadow > span::after {
				content: '';
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				background: black;
				opacity: 0.4;
				z-index: -1;
				filter: blur(5px);
				transform: scale(1.5);
            }
			.flowchart-item.background {
				background-repeat: no-repeat;
				background-position: center;
				background-size: contain;
            }			
            .flowchart-item.pill {
                border-radius: 10vh;
            }
			.flowchart-item.round {
                border-radius: 50%;
				width:calc(var(--size) * 1px);
				height:calc(var(--size) * 1px);
            }			
			.flowchart-item.square {
                border-radius: 0%;
				
            }
            .flowchart-item-value {
                font-size: .75em;
            }
        </style>`
        var layout = String.raw`<div ng-init='init(${fec})' id='flowchart_{{unique}}' class='flowchart-{{unique}}'>`;

        return String.raw`${styles}${layout}`;
    }


    function checkConfig(node, conf) {
		if (!conf || !conf.hasOwnProperty("group")) {
			node.error(RED._("ui_flowchart.error.no-group"));
			return false;
		}
		return true;
	}

	var ui = undefined;

	function FlowChartNode(config) {
		try {
			var node = this;
			if (ui === undefined) {
				ui = RED.require("node-red-dashboard")(RED);
			}
			RED.nodes.createNode(this, config);
            if (checkConfig(node, config)) {
                config.matrix = {width:3,height:3}

                config.items = [
					{id:'item_0',position:'g-0-1',shape:'pill',color:'red',label:'MAJA',value:'Something',icon:'fa-home fa-2x',order:['label','value','icon']},
					{id:'item_1',position:'g-2-2',shape:'square',color:'orange',label:'KODU',value:'Here I am',icon:'wi-wu-cloudy fa-2x',order:['icon','label','value']},
					{id:'item_2',position:'g-2-0',shape:'round',size: 100,color:'blue',label:'TÄNAV',value:'anything',icon:'home',background:'/images/home.png',order:['label','icon','value']},
					{id:'item_3',position:'g-1-0',shape:'round',size:35,color:'darkgray',label:'',value:'',icon:'',background:'/images/gridpower.png',order:['label','icon','value']},
					{id:'item_4',position:'g-1-1',shape:'round',size: 65,color:'yellow',label:'SOLAR',value:'250kW',icon:'',background:'/images/solarpanel.png',order:['label','icon','value']},
					{id:'item_5',position:'g-1-2',shape:'round',size:35,color:'gray',label:'',value:'',icon:'fa-gear fa-2x',order:['label','icon','value']},
				]
				config.lines = [
					{
						id:'line_0',
						definition:{
							from:'g-2-2',
							to:'g-1-0'
						},
						options:{ 
							color:'red',
							gradient: { 
								startColor: 'red',
								endColor: 'red'
							},
							size: 3,
							dash:{
								len: 16,
								gap: 2,
								animation: true
							},
							startSocketGravity:50,
							endSocketGravity:50,
							startSocket:'left',
							endSocket:'bottom'
						}
					},
					{
						id:'line_1',
						definition:{
							from:'g-0-1',
							to:'g-1-1'
						},
						options:{ 
							color:'yellow',
							gradient: { 
								startColor: 'yellow',
								endColor: 'yellow'
							},
							size: 3,
							dash:{
								len: 16,
								gap: 2,
								animation: true
							},
							startSocketGravity:50,
							endSocketGravity:50,
							startSocket:'right',
							endSocket:'right'
						}
					}
				]
                
                done = ui.addWidget({
					node: node,
					order: config.order,
					group: config.group,
					width: config.width,
					height: config.height,
					format: HTML(config),
					templateScope: "local",
					emitOnlyNewValues: false,
					forwardInputMessages: true,
					storeFrontEndInputAsState: true,
					

					beforeEmit: function (msg) {
						var fem = {}
						/* if (msg.control) {
							fem.config = modifyConfig(msg.control)
						}
						var val = RED.util.getMessageProperty(msg, config.property);
						var sec = RED.util.getMessageProperty(msg, config.secondary);

						if (val === undefined || val === null) {
							val = config.min
						}

						val = ensureNumber(val, config.decimals.fixed)
						fem.payload = {
							value: val.toFixed(config.decimals.fixed),
							pos: calculatePercPos(val),
							col: calculateColor(val)
						}
						if(sec){
							fem.payload.sec = sec
						} */
						return { msg: fem };
					},

					initController: function ($scope) {
                        $scope.unique = $scope.$eval('$id')
						$scope.timeout = null
						$scope.inited = false

                        $scope.init = function (p) {
                            //console.log(p)							
							if(p.config){
								if (!document.getElementById('leader-line-1-0-5')) {	
                                    const cb = function(){
                                        update(p)
                                    }							
									loadScript('leader-line-1-0-5', 'ui-flowchart/js/leader-line.min.js',cb)
								}
                                else{
                                    update(p)
                                }
							}							
						}

						

                        $scope.$watch('msg', function (msg) {
							if (!msg) {
								return;
							}
							console.log(msg)
							if ($scope.inited == false) {
								$scope.waitingmessage = msg
								return
							}
							update(msg)
						});
						$scope.$on('$destroy', function () {
							if ($scope.timeout != null) {
								clearTimeout($scope.timeout)
								$scope.timeout = null								
							}
							destroyLines()									
						});


						

                        const update = function (data) {
							let main = document.getElementById("flowchart_" + $scope.unique);
							if (!main && $scope.inited == false && data.config) {
								$scope.timeout = setTimeout(() => { update(data) }, 40);
								return
							}
							$scope.inited = true
							$scope.timeout = null
                            if (data.config) {								
                                $scope.matrix = data.config.matrix
                                $scope.items = data.config.items
								$scope.lineDefinitions = data.config.lines
                                updateContainers()
                                createItems()
								createLines()

                            }
                            if ($scope.waitingmessage != null) {
								var d = {}
								Object.assign(d, $scope.waitingmessage)
								$scope.waitingmessage = null
								if (d.config) {
									$scope.timeout = setTimeout(() => { update(d) }, 40);
									return
								}
								else {
									if (!data.payload) {
										data.payload = d.payload										
									}
								}
							}
							if (data.payload) {
								//update what ever the payload carry
							}
                        }

						const destroyLines = function(){
							$scope.lines.forEach(line => {
								try{
									if(line && line.line){
										line.line.remove()
									}
									
								}
								catch(e){
									console.log(e)
								}
							})
							$scope.lines = []
						}
						const hideLines = function(){
							$scope.lines.forEach(line => {
								try{
									if(line && line.line){
										line.line.hide()
									}
								}
								catch(e){
									console.log(e)
								}
							})
						}

						const createLines = function(){
							$scope.lines = []
							$scope.lineDefinitions.forEach(el => {
								let line = {
									id:el.id,
									startId:"fi_" + $scope.unique+"_"+el.definition.from,
									endId:"fi_" + $scope.unique+"_"+el.definition.to,
									options:el.options,
									line:null
								}
								$scope.lines.push(line)
								
							})
							setTimeout(drawLines,1)
						}

						const drawLines = function(){
							if(underCover()){
								setTimeout(drawLines,40)
								return
							}
							if($scope.lines[0].line != null){
								return
							}
							$scope.lines.forEach(el => {
								console.log('drawLine ',el)
								try{
									el.line = new LeaderLine(document.getElementById(el.startId),document.getElementById(el.endId),el.options)
								}
								catch(e){
									console.log(e)
									el.line = null
								}
							})
							fixPosition()
							setTimeout(watchDestroy,100)
						}
						const watchDestroy = function(){							
							var destroyer = ".node-red-ui--notabs"
							if(angular.element(destroyer).is(':visible') == true){
								setTimeout(watchDestroy,100)
								return
							}
							console.log("watcher started")
							var unWatch = $scope.$watch(function() { return angular.element(destroyer).is(':visible') }, function() {
								hideLines()
								unWatch()
							});
						}

						const underCover = function(){
							var el = ".node-red-ui--notabs"
							return (angular.element(el).is(':visible') == true)							
						}

						const fixPosition = function() {							
							$scope.lines.forEach(e => {
								try{
									e.line.position()
								} 
								catch(e){
									console.log(e)
								}								
							})        
						}



                        const createItems = function(){
                            $scope.items.forEach(item => {
                                let chartitem = $('<div>', {class: 'flowchart-item-wrapper',id:"fi_"+$scope.unique+'_'+ item.position})
                                .css('grid-area',item.position)
                                .appendTo("#flowchart_" + $scope.unique)

                                let itemContent = $('<div>', {class: 'flowchart-item '+item.shape+''})                                
                                .appendTo(chartitem)

								let style = {'border-color':item.color}
								if(item.shape =='round'){
									style['--size'] = item.size									
								}
								if(item.background && item.background !=''){
									style['background-image'] = 'url('+item.background+')'
									itemContent.addClass('background text-shadow')									
								}
								itemContent.css(style); 

                                item.order.map(el => {
                                    if(el == 'label'){
                                        if(item.label && item.label != ""){
                                            $('<span>').text(item.label).appendTo(itemContent)
                                        }
                                    }
                                    if(el == 'value'){
                                        if(item.value && item.value != ""){
                                            $('<span>', {class:'flowchart-item-value'}).text(item.value).appendTo(itemContent)
                                        }
                                    }
                                    if(el == 'icon'){
                                        if(item.icon && item.icon != ""){
											let icontype = getIconType(item.icon)											
											switch(icontype){
												case 'wi':{
													$('<i>', {class:icontype +' wi-fw '+item.icon}).appendTo($('<span>')).appendTo(itemContent)
													break
												}
												case 'fa':{
													$('<i>', {class:icontype +' fa-fw '+item.icon}).appendTo($('<span>')).appendTo(itemContent)
													break
												}
												default:{
													($('<span>', {class:'material-icons'})).text(item.icon).css('font-size','2em').appendTo(itemContent)
												}
											}
                                        }
                                    }
                                })                                
                            })
                        }

						const getIconType = function (icon) {
							var t = ""							
							var fa = /^fa-/gi;
							var wi = /^wi-/gi;
							var mi = /^mi-/gi;
							var icf = /^iconify-/gi;		
							if (fa.test(icon)) {
								t = 'fa';
							} else if (wi.test(icon)) {
								t = 'wi';
							} else if (mi.test(icon)) {
								t = 'mi';
							} else if (icf.test(icon)) {
								t = 'iconify';
							}		
							else {
								t = 'angular-material';
							}
							return t
						}

                        const updateContainers = function(){                            
                            const el = function(row,index){
                                return 'g-'+row+'-'+index
                            }
                            const createRow = function(idx){
                                let line = '"'
                                for (let i = 0; i < $scope.matrix.width; i++) {
                                    line += el(idx,i)+ ' '                                
                                }
                                return line +'"'
                            }
                            let areas = ' '
                            for (let i = 0; i < $scope.matrix.height; i++) {
                               areas += createRow(i) +' '                                
                            }
                                    
                            $("#flowchart_" + $scope.unique).css('grid-template-areas',areas)
                            $("#flowchart_" + $scope.unique).closest("md-card").css('padding','unset')

							
                           
                        }

                        const loadScript = function (id, path, done) {
							var head = document.getElementsByTagName('head')[0];
							var script = document.createElement('script');
							script.type = 'text/javascript';
							script.id = id
							script.src = path;
							head.appendChild(script);							
							script.onload = function () {
								LeaderLine.positionByWindowResize = false;
								done()
							}
						}

                    }
                });
            }

        } catch (e) {
			console.log(e);
		}
		node.on("close", function () {
			console.log('close')
						
			if (done) {
				done();
			}
		});
	}
    RED.nodes.registerType("ui_flowchart", FlowChartNode);

	var uipath = 'ui';
	if (RED.settings.ui) {
		uipath = RED.settings.ui.path;
	}
	var fullPath = path.join('/', uipath, '/ui-flowchart/*').replace(/\\/g, '/');
	RED.httpNode.get(fullPath, function (req, res) {
		var options = {
			root: __dirname + '/lib/',
			dotfiles: 'deny'
		};
		res.sendFile(req.params[0], options)
	});
};