let stageWorkflow;
let dicElements = {};
let arrobjArrowData = [];
let intCurrentPixelOnAxisX = 10;
let intCurrentPixelOnAxisY = 120;
let layer = new Konva.Layer();
let boolIsSuperAdmin = false;
let boolGeneric = false;

//======================================================================================================================
$(document).ready(function () {
	funInitializeCanvas();
	//														//Get all the info from the workflow and create the.
	//														//		diagram.
	funGetWorkflow();

	const arrHexCodeColors = [
		"#7fff00", "#d2691e", "#ff7f50", "#6495ed", "#dc143c", "#00ffff", "#00008b", "#008b8b", "#b8860b", "#ff6347",
		"#40e0d0", "#ba55d3", "#9370d8", "#ffb6c1", "#800000", "#ff00ff", "#ffff00", "#9acd32", "#ffd700", "#008000",
		"#cd5c5c", "#ff69b4", "#808000", "#ff0000", "#ff1493", "#9400d3", "#b22222", "#fa8072", "#66cdaa", "#1e90ff"];

	//------------------------------------------------------------------------------------------------------------------
	//														//EVENTS.

	//------------------------------------------------------------------------------------------------------------------
	$(window).resize(function (
		//													//If the size of the browser's window change, then the size 
		//													//		of the diagram frame change.
	) {
		stageWorkflow.width($("#divWorkflow").width() - 20);
		stageWorkflow.height(window.innerHeight - $("#productWflwToolSection").height() - $("footer").height() -
			$("nav").height() - 115);
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#divWorkflow").change(function () {
		funGetWorkflow()
	});

	//------------------------------------------------------------------------------------------------------------------
	stageWorkflow.on('click', function (e) {

		if (
			e.target.parent != null
		) {
			let strId = e.target.parent.attrs.id;
			let intPkProcessInWorkflow = strId.substring(1);
			let boolHasSize = $("#boolHasSize").val()

			if (
				intPkProcessInWorkflow != "null" && strId.substring(0, 1) != "N"
			) {
				funGetProcessInWorkflow(intPkProcessInWorkflow, boolHasSize);
			}
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	//														//SUPPORT METHODS.

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funInitializeCanvas(
		//													//Initialize the div wit the frame for the diagram and
		//													//		and set the event for the zoom with the 
		//													//		mouse's scroll.
	) {
		let canvasHeight = window.innerHeight - $("#productWflwToolSection").height() - $("footer").height() -
			$("nav").height() - 115;
		let canvasWidth = $("#divWorkflow").width() - 20;

		//													//Initialize the div wit the frame for the diagram.
		stageWorkflow = new Konva.Stage({
			container: 'divWorkflow',
			width: canvasWidth,
			height: canvasHeight,
			draggable: true,
		});

		//													//Set the zoom event.
		stageWorkflow.on('wheel', (e) => {
			e.evt.preventDefault();
			var oldScale = stageWorkflow.scaleX();

			//												//Get pointer position.
			var pointer = stageWorkflow.getPointerPosition();

			var mousePointTo = {
				x: (pointer.x - stageWorkflow.x()) / oldScale,
				y: (pointer.y - stageWorkflow.y()) / oldScale,
			};

			var newScale =
				e.evt.deltaY > 0 ? oldScale * 1.035 : oldScale / 1.035;

			if (
				//											//Avoid that the diagram be too small or too big.
				(newScale > 0.5) && (newScale < 5)
			) {
				stageWorkflow.scale({ x: newScale, y: newScale });
				var newPos = {
					x: pointer.x - mousePointTo.x * newScale,
					y: pointer.y - mousePointTo.y * newScale,
				};
				stageWorkflow.position(newPos);

				//												//Update all the draws of the frame.
				stageWorkflow.batchDraw();
			}
		});
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funGetWorkflow(
		//													//Get all the workflow information.
	) {
		let intPkWorkflow = $("#intPkWorkflow").val();

		$.ajax({
			type: "GET",
			url: "/Workflow/GetWorkflow",
			data: {
				"intPkWorkflow": intPkWorkflow
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					layer = new Konva.Layer();

					//										//Set data on workflow.
					funSetAllworkflowData(objResponse.objResponse);

					//										//Create the diagram.
					funCreateDiagram(objResponse.objResponse.arrlkornodjson);

					//										//Get all the arrows, and each is align between their nodes.
					funFixArrowPosition();
				}
				else {
					subSendNotification("Something is wrong.", objResponse.intStatus);
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funSetAllworkflowData(
		//													//Object that contains the workflow's name, boolIsReady and
		//													//		boolHasFinalProduct.
		objWorkflow
	) {
		//													//Set the workflow name
		$("#wfName").html(objWorkflow.strWorkflowName + " - Workflow");

		//													//Set the workflow name in a hidden input.
		$("#wfNameInput").val(objWorkflow.strWorkflowName);

		//													//Set the workflow name as the strTypeId.
		$("#strTypeId").val(objWorkflow.strWorkflowName);

		if (
			//												//if the workflow is ready and have a final product, then 
			//												//		the animation color be green.
			objWorkflow.boolIsReady /*&& objWorkflow.boolHasFinalProduct*/
		) {
			//												//
			$(".viewNeeded").find(".animated").removeClass("indicator-not-ready");
			$(".viewNeeded").find(".animated").addClass("indicator-ready");
		}

		//													//Set new intPkWorkflow
		$(".viewNeeded").attr("data-intPk", objWorkflow.intPk);
		$(".calculations").attr("data-intnPkWorkflow", objWorkflow.intPk);
		$("#intPkWorkflow").val(objWorkflow.intPk);
		$("#boolHasSize").val(objWorkflow.boolHasSize)
		boolGeneric = objWorkflow.boolGeneric;

		if (
			//												//If the workflow is generic and the user isn't a suoer
			//												//		admin, remove all the controls for edit a workflow.
			objWorkflow.boolGeneric && !boolIsSuperAdmin
		) {
			$(".workflowControlSections").remove();
		}
		else {
			$(".workflowControlSections").removeAttr("hidden");
		}
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funCreateDiagram(
		//													//For each element of the workflow's array, call the 
		//													//		functions to create, get and link elements on the
		//													//		frame.

		//													//array that contains all the element and their links.
		arrLink
	) {
		$.each(arrLink, function (intIndex, objLink) {
			let nodeFrom = null;
			let boolNodeFromIsNew = false;
			if (
				//											//If the curret node from does not exist in the dictionary
				//											//		as a condition node (N) or process node (P) create
				//											//		the node on the frame and save it in the dictionary
				//											//		but if the node already exist, only get the element
				//											//		reference.
				(dicElements["P" + objLink.nodeFrom.intnPkProcessInWorkflow] == undefined) &&
				(dicElements["N" + objLink.nodeFrom.intnPkNode] == undefined)
			) {
				//											//Create the node.
				nodeFrom = funCreateNode(objLink.nodeFrom, intCurrentPixelOnAxisY, null);

				boolNodeFromIsNew = true;

				if (
					objLink.nodeFrom.intnPkProcessInWorkflow != null
				) {
					intCurrentPixelOnAxisX += 300;
				}
				else {
					intCurrentPixelOnAxisX += 100;
				}
			}
			else {
				//											//Get the reference in the frame.
				nodeFrom = funGetElementNodeOnLayer(objLink.nodeFrom);
			}

			if (
				objLink.arrnodeTo != null
			) {
				let nodeTo = null;

				let intProcessQuantity = intGetProcessQuantity(arrLink, objLink);

				//											//Calculate the coordinates for the next nodes.
				let intAxisY = funCalculateAxisY(objLink, intProcessQuantity);
				let intAxisX = funCalculateAxisX(objLink);

				//											//To easy code.
				let intIncrementAxisY = 0;

				if (
					intProcessQuantity > 1
				) {
					intIncrementAxisY = (((intProcessQuantity * 50) + ((intProcessQuantity - 1) * 35)) /
						(intProcessQuantity - 1));
				}

				let boolAllNodeToExist = true;
				let boolNodeFromHasTheSameXThanNodeTo = false;
				$.each(objLink.arrnodeTo, function (intIndex, objLinkTo) {
					let boolNodeToExists = false;

					if (
						//									//If the curret node from does not exist in the dictionary
						//									//		as a condition node (N) or process node (P) create
						//									//		the node on the frame and save it in the dictionary
						//									//		but if the node already exist, only get the element
						//									//		reference.
						(dicElements["P" + objLinkTo.intnPkProcessInWorkflow] == undefined) &&
						(dicElements["N" + objLinkTo.intnPkNode] == undefined)
					) {
						if (
							objLinkTo.intnPkProcessInWorkflow != null
						) {
							//									//Create the node.
							nodeTo = funCreateNode(objLinkTo, intAxisY, intAxisX);
						}
						else {
							//									//Create the node.
							nodeTo = funCreateNode(objLinkTo, intAxisY, intAxisX);
						}

						boolAllNodeToExist = false;

						//									//Number of links that node receives.
						nodeTo.clipY(1);
					}
					else {
						//									//Get the reference in the frame.
						nodeTo = funGetElementNodeOnLayer(objLinkTo);
						boolNodeToExists = true;

						//									//Number of links that node receives.
						nodeTo.clipY(nodeTo.clipY() + 1);
					}

					//										//Get positions.
					var posFrom = nodeFrom.absolutePosition();
					var posTo = nodeTo.absolutePosition();

					if (
						//									//NodeTo has more than one elements linked to it and the new 
						//									//		link is from a new node.
						(nodeTo.clipY() > 1) && boolNodeFromIsNew
					) {
						let intDefaultSpaceBetweenNodes = 300;
						if (
							nodeFrom.width() == 50
						) {
							intDefaultSpaceBetweenNodes = 150
						}

						nodeFrom.absolutePosition({
							x: (posTo.x - intDefaultSpaceBetweenNodes),
							y: (posTo.y + ((nodeTo.clipY() - 1) * 85))
						});

						//										//Get positions.
						var posFrom = nodeFrom.absolutePosition();
						var posTo = nodeTo.absolutePosition();
						if (
							(intCurrentPixelOnAxisX - intDefaultSpaceBetweenNodes) > posFrom.x
						) {
							intCurrentPixelOnAxisX = intCurrentPixelOnAxisX - intDefaultSpaceBetweenNodes;
						}

						funAlignElementPosition(nodeFrom);
					}

					posFrom = nodeFrom.absolutePosition();
					posTo = nodeTo.absolutePosition();

					if (
						//									//NodeTo is not at the same Y as the nodeFrom and NodeTo has 
						//									//		another link because it exists.
						(posFrom.y != posTo.y) &&
						boolNodeToExists && nodeTo.clipY() > 1 &&
						posFrom.x < posTo.x
					) {
						nodeTo.absolutePosition({
							x: posTo.x,
							y: ((nodeTo.clipX() + posFrom.y) / 2)
						});
					}

					posFrom = nodeFrom.absolutePosition();
					posTo = nodeTo.absolutePosition();

					if (
						posFrom.y < posTo.y
					) {
						nodeTo.clipX(posFrom.y);
					}

					//										//Create the arrow element and link the nodeFrom and
					//										//		the current nodeTo element.
					funLinkNodes(nodeFrom, nodeTo);
					//										//Increase the value of axis "Y" in case that the 
					//										//		arrnodeTo contains more than one element, .
					//										//		to align the elements vertically.
					intAxisY = intAxisY + intIncrementAxisY;

					if (
						nodeTo.y() == nodeFrom.y()
					) {
						boolNodeFromHasTheSameXThanNodeTo = true;
					}
				});

				if (
					boolAllNodeToExist == false
				) {
					intCurrentPixelOnAxisX += 300;
				}
				else if (
					boolNodeFromHasTheSameXThanNodeTo && objLink.arrnodeTo.length > 1
				) {
					nodeFrom.absolutePosition({
						x: nodeFrom.x(),
						y: (nodeFrom.y() + ((objLink.arrnodeTo.length - 1) * 85) / 2)
					});
					
					nodeFrom.fire("dragmove");
				}
			}
		});
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funGetElementNodeOnLayer(
		//													//Return the element reference from the dictionary.

		//													//Receives the objNode.
		objNode
	) {
		let nodeElement = null;

		if (
			//												//If the object is a conditional node.
			objNode.intnPkNode != null
		) {
			nodeElement = dicElements["N" + objNode.intnPkNode];
		}
		else {
			nodeElement = dicElements["P" + objNode.intnPkProcessInWorkflow];
		}

		return nodeElement;
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funCalculateAxisY(
		//													//Calculate the position for the next(s) element that gonna
		//													//		be created.

		//													//Receives the object of the previus element.
		objLink,
		intProcessQuantity
	) {
		let intAxisY = 0;
		let previusElement = null;

		if (
			//												//Get the coordinate "Y" from the previous element.

			//												//If the previous it's a conditional node.
			objLink.nodeFrom.intnPkNode != null
		) {
			previusElement = dicElements["N" + objLink.nodeFrom.intnPkNode];
			intAxisY = previusElement.y();
		}
		else {
			previusElement = dicElements["P" + objLink.nodeFrom.intnPkProcessInWorkflow];
			intAxisY = previusElement.y();
		}

		if (
			//												//If the arrnodeTo array contains more than one element, 
			//												//		then calculate the "Y" coordinate in order to
			//												//		align them vertically.

			//												//Receives the arrnodeTo array.
			intProcessQuantity > 1
		) {
			//												//Calculate the "Y" coordinate where the elements gonna be 
			//												//		added vertically. The formula is:
			//												//		intAxisY = intAxisY - (((a * b) + ((b - c) * d)) / e)
			//												//		Where:
			//												//			a = Number of elements in the array
			//												//			b = Height in pixels for each element (50).
			//												//			c = This values is for calculate the number of 
			//												//				spaces between each element, then the number
			//												//				of spaces are "the subtraction of the total 
			//												//				of elements minus one".
			//												//			d = Height in pixels for each space (50).
			//												//			e = It´s the divider, the value for this is 2,
			//												//				because from the previous element on frame is
			//												//				only necessary the upper half on the frame.
			intAxisY = intAxisY - (((intProcessQuantity * 50) + ((intProcessQuantity - 1) * 35)) / 2);
		}

		return intAxisY;
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funCalculateAxisX(
		//													//Calculate the position for the next(s) element that gonna
		//													//		be created.

		//													//Receives the object of the previus element.
		objLink
	) {
		let intAxisX = 0;
		let previusElement = null;

		if (
			//												//Get the "X" coordinate from the previous element.

			//												//If the previous it's a conditional node.
			objLink.nodeFrom.intnPkNode != null
		) {
			previusElement = dicElements["N" + objLink.nodeFrom.intnPkNode];

			//												//Its the previous "X" coordinate plus the width of
			//												// conditional node (150 px)
			intAxisX = previusElement.x() + 150;
		}
		else {
			previusElement = dicElements["P" + objLink.nodeFrom.intnPkProcessInWorkflow];

			//												//Its the previous "X" coordinate plus the width of
			//												// process node (300 px)
			intAxisX = previusElement.x() + 300;
		}

		return intAxisX;
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funCreateNode(

		//													//Receives the data for the element to create.
		objNode,
		//													//Receives the "Y" coordinate for the element to create.
		intAxisY,
		//													//Receives the "X" coordinate for the element to create.
		intAxisX
	) {
		if (
			//												//If the node to create it's a conditional node, then a 
			//												//		circle will be created, else will be a rectangle.
			objNode.intnPkProcessInWorkflow != null
		) {
			return funCreateProcessNode(objNode, intAxisY, intAxisX);
		}
		else {
			return funCreateConditionNode(objNode, intAxisY, intAxisX);
		}
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funCreateProcessNode(
		//													//Receives the data for the element to create.
		objNode,
		//													//Receives the "Y" coordinate for the element to create.
		intAxisY,
		//													//Receives the "X" coordinate for the element to create.
		intAxisX
	) {
		//													//Create a group that will be contains the form and the text.
		let groupElement = new Konva.Group({
			x: intAxisX ?? intCurrentPixelOnAxisX,
			y: intAxisY,
			width: 200,
			height: 50,
			id: "P" + objNode.intnPkProcessInWorkflow,
			clipX: intAxisY,
			clipY: 0,
			draggable: false,
		});

		//													//Create a form and it's added to the group.
		groupElement.add(new Konva.Rect({
			stroke: '#555',
			strokeWidth: 5,
			fill: '#ddd',
			width: 200,
			height: 50,
			shadowColor: 'black',
			shadowBlur: 10,
			shadowOffsetX: 10,
			shadowOffsetY: 10,
			shadowOpacity: 0.2,
			cornerRadius: 10
		}));

		//													//Create a text and it's added to the group.
		groupElement.add(new Konva.Text({
			text: objNode.strName,
			fontSize: 14,
			fontFamily: 'Rawline Regular',
			fill: '#555',
			width: 200,
			height: 50,
			verticalAlign: "middle",
			align: 'center'
		}));

		//													//The group references it's added to the dictionary.
		dicElements["P" + objNode.intnPkProcessInWorkflow] = groupElement;

		//													//The group it's added to the layer.
		layer.add(groupElement);
		//													//The group it's added to stage(frame of the diagram).
		stageWorkflow.add(layer);

		//													//Return the element reference.
		return groupElement;
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funCreateConditionNode(
		//													//Receives the data for the element to create.
		objNode,
		//													//Receives the "Y" coordinate for the element to create.
		intAxisY,
		//													//Receives the "X" coordinate for the element to create.
		intAxisX
	) {
		//													//Create a group that will be contains the form and the text.
		let groupElement = new Konva.Group({
			x: intAxisX ?? intCurrentPixelOnAxisX,
			y: intAxisY,
			id: "N" + objNode.intnPkNode,
			width: 50,
			height: 50,
			clipX: intAxisY,
			clipY: 0,
			draggable: false,
			strokeWidth: 5,
			stroke: '#555'
		});

		//													//Create a form and it's added to the group.
		groupElement.add(new Konva.Rect({
			stroke: '#555',
			strokeWidth: 5,
			fill: '#ddd',
			width: 50,
			height: 50,
			shadowColor: 'black',
			shadowBlur: 10,
			shadowOffsetX: 10,
			shadowOffsetY: 10,
			shadowOpacity: 0.2,
			cornerRadius: 20
		}));

		//													//Create a text and it's added to the group.
		groupElement.add(new Konva.Text({
			text: objNode.strName,
			fontSize: 14,
			width: 50,
			height: 50,
			fontFamily: 'Rawline Regular',
			fill: '#555',
			align: 'center',
			verticalAlign: "middle"
		}));

		//													//The group references it's added to the dictionary.
		dicElements["N" + objNode.intnPkNode] = groupElement;

		//													//The group it's added to the layer.
		layer.add(groupElement);
		//													//The group it's added to stage(frame of the diagram).
		stageWorkflow.add(layer);

		//													//Return the element reference.
		return groupElement;
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funLinkNodes(
		//													//Add an arrow which is linked to each object (LinkFrom and 
		//													//		LinkTo) and are added events in case than some 
		//													//		element it's moved from their original position.

		//													//Receives object LinkFrom data.
		objLinkFrom,
		//													//Receives object LinkTo data. 
		objLinkTo
	) {
		//													//Get a random hex color code for the arrow.
		let randomColor = arrHexCodeColors[Math.floor(Math.random() * arrHexCodeColors.length)];

		//													//Create the arrow.
		let arrow = new Konva.Arrow({
			x: 0,
			y: 0,
			id: objLinkFrom.id() + "-" + objLinkTo.id(),
			stroke: randomColor,
			fill: randomColor
		});

		arrobjArrowData.push({
			"arrow": arrow,
			"strLinkFromId": objLinkFrom.id(),
			"strLinkToId": objLinkTo.id()
		});

		//													//Add the arrow to the layer.
		layer.add(arrow);
		//													//Add the arrow to the stage.
		stageWorkflow.add(layer);

		//													//Move the arrow to the botton, so if an arrow cross through
		//													//		a node, the arrow does'nt appear over the codition or
		//													//		process node.
		arrow.moveToBottom();

		//													//
		updateNodePosition(objLinkFrom, objLinkTo);

		//													//Update the start and end position of the arrow.
		updateArrowPosition(arrow, objLinkFrom, objLinkTo);

		//													//Create the events.
		objLinkFrom.on('dragmove', function () {
			updateArrowPosition(arrow, objLinkFrom, objLinkTo);
			updateNodePosition(objLinkFrom, objLinkTo);
		});
		objLinkTo.on('dragmove', function () {
			updateArrowPosition(arrow, objLinkFrom, objLinkTo);
			updateNodePosition(objLinkFrom, objLinkTo);
		});

		//													//Trigger the element on drag move.
		objLinkFrom.fire("dragmove");
		objLinkTo.fire("dragmove");
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function updateNodePosition(
		objLinkFrom,
		objLinkTo
	) {
		if (
			//												//If from element is located more to the right than the link
			//												//		to element.
			(objLinkFrom.x() >= objLinkTo.x()) &&
			(objLinkTo.clipY() > 1)
		) {

			//												//Set the element in the new position.
			objLinkTo.x(objLinkFrom.x() + (objLinkFrom.width() + 100));

			//												//Update the draw in the frame.
			layer.batchDraw();
		}
		else if (
			(objLinkFrom.x() > objLinkTo.x()) &&
			(objLinkTo.clipY() == 1)
		) {
			if (
				//											//If the "node from", doesn't contains previous links,
				//											//		then the "node from" be located to the left side of
				//											//		the "node to".
				arrobjArrowData.filter(objArrowData => objArrowData.strLinkToId == objLinkFrom.id()).length == 0
			) {
				objLinkFrom.absolutePosition({
					x: objLinkTo.x() - (objLinkFrom.width() + 100),
					y: objLinkTo.y()
				});
			}
			else {
				//											//The "node from" contains previous links, then the "node to"
				//											//		gonna be located to the right side of the "node from".
				objLinkTo.absolutePosition({
					x: objLinkFrom.x() + (objLinkFrom.width() + 100),
					y: objLinkFrom.y()
				});

				let arrojbArrowDataForLinkFrom = arrobjArrowData.filter(objArrowData =>
					objArrowData.strLinkFromId == objLinkFrom.id() || objArrowData.strLinkFromId == objLinkTo.id());

				$.each(arrojbArrowDataForLinkFrom, function (intIndex, ArrowDataForLinkFrom) {
					updateNodePosition(dicElements[ArrowDataForLinkFrom.strLinkFromId],
						dicElements[ArrowDataForLinkFrom.strLinkToId]);

					dicElements[ArrowDataForLinkFrom.strLinkFromId].fire("dragmove");
					dicElements[ArrowDataForLinkFrom.strLinkToId].fire("dragmove");
				});
			}

			let boolElementChangeOriginalPosition = funAlignElementPosition(objLinkFrom);

			if (
				boolElementChangeOriginalPosition
			) {
				objLinkTo.absolutePosition({
					x: objLinkFrom.x() + (objLinkFrom.width() + 100),
					y: objLinkFrom.y()
				});
			}
		}
		else if (
			objLinkTo.clipY() == 1 &&
			arrobjArrowData.filter(objArrowData => objArrowData.strLinkFromId == objLinkFrom.id()).length >= 1 &&
			(objLinkTo.x() - objLinkFrom.x()) > 300
		) {
			
			objLinkTo.x();
			objLinkTo.absolutePosition({
				x: objLinkFrom.x() + (objLinkFrom.width() + 100),
				y: objLinkFrom.y()
			});

			//												//Update the draw in the frame.
			layer.batchDraw();
			stageWorkflow.add(layer);
		}
		else if (
			(objLinkFrom.x() == objLinkTo.x()) &&
			(objLinkTo.clipY() >= 1)
		) {
			subAlignPreviousNodes(objLinkFrom, objLinkTo);
		}
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function subAlignPreviousNodes(
		objLinkFrom,
		objLinkTo
	) {
		if (
			objLinkTo.clipY() == 1 &&
			arrobjArrowData.filter(objArrowData => objArrowData.strLinkFromId == objLinkFrom.id()).length == 1
		) {
			objLinkFrom.absolutePosition({
				x: objLinkTo.x() - (objLinkFrom.width() + 100),
				y: objLinkTo.y()
			});
		}
		else {
			objLinkFrom.absolutePosition({
				x: objLinkTo.x() - (objLinkFrom.width() + 100),
				y: objLinkFrom.y()
			});
		}

		let arrobjArrowDataFiltered = arrobjArrowData.filter(objArrowData => objArrowData.strLinkToId == objLinkFrom.id());
		$.each(arrobjArrowDataFiltered, function (intIndex, ArrowData) {
			subAlignPreviousNodes(dicElements[ArrowData.strLinkFromId], objLinkFrom);
		});

		layer.batchDraw();
		stageWorkflow.add(layer);
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function updateArrowPosition(
		arrow,
		objLinkFrom,
		objLinkTo,
		boolAlignElementPosition = true
	) {
		//													//To easy code.
		let objArrowPoints = objGetArrowPoints(objLinkFrom, objLinkTo);

		arrow.points([objArrowPoints.arrowyPointAX, objArrowPoints.arrowyPointAY, objArrowPoints.arrowyPointBX,
		objArrowPoints.arrowyPointBY]);

		if (
			boolAlignElementPosition
		) {
			funAlignElementPosition(objLinkFrom);
			funAlignElementPosition(objLinkTo);
		}
		layer.batchDraw();
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function objGetArrowPoints(
		//													//Calculate the position for each side of the arrow.

		//													//Receives object LinkFrom data.
		objLinkFrom,
		//													//Receives object LinkTo data. 
		objLinkTo
	) {

		let objArrowPoints = {
			"arrowyPointAX": objLinkFrom.x() + objLinkFrom.width(),
			"arrowyPointAY": objLinkFrom.y() + (objLinkFrom.height() / 2),
			"arrowyPointBX": objLinkTo.x() - 3,
			"arrowyPointBY": objLinkTo.y() + (objLinkTo.height() / 2)
		};

		return objArrowPoints;
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funAlignElementPosition(
		currentNode
	) {
		let boolElementChangeOriginalPosition = false;
		let arrgroupInLayer = layer.find("Group");

		//													//Get all the Group Element on the workflow and iterate each
		//													//		of the elements.
		//layer.find("Group").each(function (nodeReference) {
		for (let intI = 0; intI < arrgroupInLayer.length; intI++) {
			//												//To easy code.
			let nodeReference = arrgroupInLayer[intI];
			if (
				//											//Verify if the object are not the same
				(nodeReference != currentNode) &&
				//											//If "Y" coodinate is between nodeReference's coordinates
				(((currentNode.y() >= nodeReference.y() - 10) &&
					(currentNode.y() <= (nodeReference.y() + nodeReference.height()) + 10 )) &&
					//											//If "x" coodinate is between nodeReference's coordinates
					((currentNode.x() >= nodeReference.x()) &&
						(currentNode.x() <= (nodeReference.x() + nodeReference.width()))))
			) {
				//											//Take the nodeReference coordinate "Y" and add 35px in
				//											//		order to  positioning the currentNode element below
				//											//		nodeReference.
				currentNode.absolutePosition({
					x: (currentNode.x()),
					y: ((nodeReference.y() + nodeReference.height()) + 52)
				});
				boolElementChangeOriginalPosition = true;
				break;
			}
			else if (
				//											//Verify if the object are not the same
				(nodeReference != currentNode) &&
				//											//If "Y" coodinate is between nodeReference's coordinates
				(((currentNode.y() + currentNode.height()) >= nodeReference.y() - 10) &&
					((currentNode.y() + currentNode.height()) <= (nodeReference.y() + nodeReference.height()) + 10)) &&
				//											//If "x" coodinate is between nodeReference's coordinates
				((currentNode.x() >= nodeReference.x()) &&
					(currentNode.x() <= (nodeReference.x() + nodeReference.width())))
			) {
				//											//Take the nodeReference coordinate "Y" and add 35px in
				//											//		order to  positioning the currentNode element below
				//											//		nodeReference.
				currentNode.absolutePosition({
					x: (currentNode.x()),
					y: ((nodeReference.y() - nodeReference.height()) - 52)
				});

				boolElementChangeOriginalPosition = true;
				break;
			}
		};

		return boolElementChangeOriginalPosition;
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function intGetProcessQuantity(
		arrLink,
		objLink
	) {
		let intProcessQuantity = 0;

		if (
			objLink.nodeFrom.intnPkProcessInWorkflow != null
		) {
			intProcessQuantity = objLink.arrnodeTo.length;
		}
		else {
			intProcessQuantity = objLink.arrnodeTo.filter(node => node.intnPkProcessInWorkflow != null).length;

			//											//Get all the conditional nodes.
			let arrNodeToCondition = objLink.arrnodeTo.filter(node => node.intnPkNode != null);

			$.each(arrNodeToCondition, function (intIndex, objLinkTo) {
				//										//Get the number of links that are connected to this node.
				let intTotalLinksAreConectedToNode = arrLink
					.filter(link => link.arrnodeTo.filter(node => node.intnPkNode == objLinkTo.intnPkNode)).length;

				if (
					//									//If the node only have link connected, the
					//									//		intProcessQuantity increase in one.
					intTotalLinksAreConectedToNode == 1
				) {
					intProcessQuantity += 1
				}
			});
		}

		return intProcessQuantity;
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funFixArrowPosition() {
		$.each(arrobjArrowData, function (intIndex, objArrowData) {
			//												//To easy code.
			let eleLinkFrom = dicElements[objArrowData.strLinkFromId];
			let eleLinkTo = dicElements[objArrowData.strLinkToId];

			updateArrowPosition(objArrowData.arrow, eleLinkFrom, eleLinkTo, false);
		});
	}

	//------------------------------------------------------------------------------------------------------------------
});
//======================================================================================================================