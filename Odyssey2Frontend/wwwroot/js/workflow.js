let checkA = null;
let checkB = null;
let lastInputcheckbox = null;
let lastOutputcheckbox = null;
let url = null;
let wfNameInput = null;
let objIOTemp = null;

$(document).ready(function () {
	//loader();
	//------------------------------------------------------------------------------------------------------------------
	$('[data-toggle="tooltip"]').tooltip();

	//------------------------------------------------------------------------------------------------------------------
	$("#wkflwLink").click(function () {
		let intPkWorkflow = $("#intPkWorkflow").val();
		let intPkProduct = $("#intPkProduct").val();

		$.ajax({
			type: "GET",
			url: "/Workflow/GetLinkView",
			data: {
				"intPkWorkflow": intPkWorkflow,
				"intnPkProduct": intPkProduct
			},
			success: function (strBody) {
				subShowModal("Link Process", strBody, "modal-lg", "modal-content-scroll-screen-height", true, false);
				boolReloadSite = true;
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".nodeAndProcessesDropdown", function () {
		let intnPkProcessInWorkflow = $(this).find(':selected').data('intpkprocessinworkflow')
		let boolIsInput = $(this).find(':selected').data('boolisinput')
		let nextDropdownElement = $(this).parent().parent().next().find("select");
		nextDropdownElement.html("");

		if (
			//												//If the intnPkProcessInWorkflow is not null, then gets all
			//												//		the IO's of process.
			intnPkProcessInWorkflow != "" && intnPkProcessInWorkflow > 0
		) {
			$.ajax({
				type: "GET",
				url: "/Workflow/GetProcessIOs",
				data: {
					"intPkProcessInWorkflow": intnPkProcessInWorkflow,
					"boolIsInput": boolIsInput
				},
				success: function (objResponse) {
					if (
						objResponse.intStatus == 200
					) {
						//									//Remove all previous elements and enabled
						nextDropdownElement.prop("disabled", false);
						nextDropdownElement.append("<option value=''>Pick one</option");

						//									//Each element of the array is added as a option 
						//									//		in the dropdown.
						$.each(objResponse.objResponse, function (intIndex, objIO) {
							nextDropdownElement.append("<option data-intPkEleetOrEleele='" + objIO.intPkEleetOrEleele +
								"' data-boolIsEleet='" + objIO.boolIsEleet + "' value='" + objIO.intPkEleetOrEleele +
								"'>" + objIO.strIO + "</option");
						});

						if (
							boolIsInput != "True"
						) {
							//								//Disable the condition to apply button.
							$(".openConditionToApplyModal").attr("disabled", true);
							$(".openConditionToApplyModal").attr("disabled", true);

							$("#linkProcessAndNodesForm").find("#strConditionToApply").val("");
							$("#linkProcessAndNodesForm").find("#translatedCondition").attr("hidden", true);
							$("#linkProcessAndNodesForm").find("#translatedCondition").html("");
						}
					}
					else {
						subSendNotification("Something is wrong.", 400);
					}
				},
				error: function () {
					subSendNotification("Something is wrong.", 400);
				}
			});
		}
		else {
			if (
				//											//If the selected drop down is for the from process.
				boolIsInput != "True"
			) {
				//											//The element is disbled because the selected element is a
				//											//		condition node.
				$(".openConditionToApplyModal").removeAttr("disabled");
			}
			nextDropdownElement.prop("disabled", true);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".wkflwUnlink", function () {
		let intPkIn = $(this).data("intpkin");
		let intPkOut = $(this).data("intpkout");
		let intPkWorkflow = $("#intPkWorkflow").val();

		$.ajax({
			type: "GET",
			url: "/workflow/IsModifiable",
			data:
			{
				"intPkWorkflow_I": intPkWorkflow
			},
			success: function (jsonResponse) {
				/*CASE*/
				if (
					//										//Workflow modifiable, it is not necessary to consult with 
					//										//		the user.
					(jsonResponse.intStatus == 200) &&
					(jsonResponse.objResponse == true)
				) {
					funUnlink(intPkIn, intPkOut);
				}
				else if (
					//										//Workflow not modifiable, it is necessary to ask what to 
					//										//		do to the user.
					(jsonResponse.intStatus == 200) &&
					(jsonResponse.objResponse == false)
				) {
					//										//Modal (first step).
					$(".btnYesNo").css("display", "block");
					$(".btnOk").css("display", "none");
					$("#confirmation-modal").modal('show');
					$("#myModalBody").html("<span class='font-bold'>" + jsonResponse.strUserMessage + "</span>" +
						"<br/> Unlink anyway?")

					$("#modal-btn-yes").unbind();
					$("#modal-btn-no").unbind();

					//										//Yes (second step).
					$("#modal-btn-yes").bind("click", function () {
						funUnlink(intPkIn, intPkOut);
						$("#confirmation-modal").modal('hide');
					});

					//										//Abort modification.
					$("#modal-btn-no").bind("click", function () {
						$("#confirmation-modal").modal('hide');
					});
				}
				else {
					//										//Invalid data.
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				}
				/*EN-CASE*/
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funUnlink(
		intPkIn,
		intPkOut
	) {
		let intPkProduct = $("#intPkProduct").val();
		let intPkWorkflow = $("#intPkWorkflow").val();
		let boolEstimate = $("#boolEstimate").val();

		$.ajax({
			type: "POST",
			url: "/Workflow/Unlink",
			data: {
				"intPkIn": intPkIn,
				"intPkOut": intPkOut
			},
			beforeSend: function () {
				//disableElements();
			},
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {

					if (
						(boolEstimate == null || boolEstimate == undefined || boolEstimate == "")
					) {
						strNewLinkForReload = "/Workflow?intPkWorkflow=" + objResponse.objResponse +
							"&intPkProduct=" + intPkProduct;

						$("#intPkWorkflow").val(objResponse.objResponse);
					}
					else {
						strNewLinkForReload = "/Workflow?intPkWorkflow=" + objResponse.objResponse +
							"&intPkProduct=" + intPkProduct;
                    }

					//										//Get all the links saved and print it on the table.
					funGetLinks(objResponse.objResponse);
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				enableElements();
				subSendNotification("Something is wrong.", 400);
			}
		});
	}

	//------------------------------------------------------------------------------------------------------------------
	$("#intPkProcessGroupSelect").change(function () {
		let intPkProcessGroup = $(this).val();

		if (
			intPkProcessGroup != "All"
		) {
			$.ajax({
				type: "GET",
				url: "/Workflow/GetProcessesByProcessType",
				data: {
					"intPkProcessGroup": intPkProcessGroup
				},
				success: function (objResponse) {
					if (
						objResponse.intStatus == 200
					) {
						funSetProcessInSelectElement(objResponse.objResponse);
					}
				},
				error: function () {
					subSendNotification("Something is wrong.", 400);
				}
			});
		}
		else {
			$.ajax({
				type: "GET",
				url: "/Workflow/GetAllProcess",
				success: function (objResponse) {
					funSetProcessInSelectElement(objResponse);
				},
				error: function () {
					subSendNotification("Something is wrong.", 400);
				}
			});
		}
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funSetProcessInSelectElement(
		arrPrintshopProcess
	) {
		$("#intPkProcess").html("");
		$("#intPkProcess").append("<option value=''>Pick one</option>");

		$.each(arrPrintshopProcess, function (intIndex, object) {
			$("#intPkProcess").append("<option value='" + object.value + "'>" + object.text +
				"</option>");
		});

		$("#intPkProcess").focusin();
	}

	//------------------------------------------------------------------------------------------------------------------
	$("#wkflwAddProcess").click(function () {

		//													//Get data to add process.
		let intPkProcess = $("#intPkProcess").val();
		let intPkWorkflow = $("#intPkWorkflow").val();
		let intPkProduct = $(this).attr("data-pkProduct");
		let boolEstimate = $("#boolEstimate").val();

		$.ajax({
			type: "GET",
			url: "/workflow/IsModifiable",
			data:
			{
				"intPkWorkflow_I": intPkWorkflow
			},
			success: function (jsonResponse) {
				/*CASE*/
				if (
					//										//Workflow modifiable, it is not necessary to consult with 
					//										//		the user.
					(jsonResponse.intStatus == 200) &&
					(jsonResponse.objResponse == true)
				) {
					funAddProcess(intPkProcess, intPkWorkflow, intPkProduct, boolEstimate);
				}
				else if (
					//										//Workflow not modifiable, it is necessary to ask what to 
					//										//		do to the user.
					(jsonResponse.intStatus == 200) &&
					(jsonResponse.objResponse == false)
				) {
					//										//Modal (first step).
					$(".btnYesNo").css("display", "block");
					$(".btnOk").css("display", "none");
					$("#confirmation-modal").modal('show');
					$("#myModalBody").html("<span class='font-bold'>" + jsonResponse.strUserMessage + "</span>" +
						"<br/> Add anyway?")

					$("#modal-btn-yes").unbind();
					$("#modal-btn-no").unbind();

					//										//Yes (second step).
					$("#modal-btn-yes").bind("click", function () {
						funAddProcess(intPkProcess, intPkWorkflow, intPkProduct, boolEstimate);
						$("#confirmation-modal").modal('hide');
					});

					//										//Abort modification.
					$("#modal-btn-no").bind("click", function () {
						$("#confirmation-modal").modal('hide');
					});
				}
				else {
					//										//Invalid data.
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				}
				/*EN-CASE*/
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funAddProcess(
		//													//Data required to add a new process to the workflow.
		intPkProcess_I,
		intPkWorkflow_I,
		intPkProduct_I,
		boolEstimate_I
	) {
		if (
			//												//There is a process selected.
			intPkProcess_I != ""
		) {
			$.ajax({
				type: "POST",
				url: "/Workflow/AddNewProcess",
				data:
				{
					"intPkProcess": intPkProcess_I,
					"intPkWorkflow": intPkWorkflow_I,
					"intPkProduct": intPkProduct_I,
					"boolEstimate": boolEstimate_I
				},
				dataType: "html",
				beforeSend: function () {
					disableElements();
				},
				success: function (strjsonResponse) {
					let objResponse = JSON.parse(strjsonResponse);
					if (
						objResponse.intStatus == 200
					) {
						if (
							objResponse.objResponse != null
						) {
							let locationUrl = objResponse.objResponse
							window.location.href = locationUrl;
						}
						else {
							location.reload();
						}
					}
					else {
						subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					}
				},
				error: function () {
					subSendNotification("Something is wrong.", 400);
				}
			});
		}
	}

	//------------------------------------------------------------------------------------------------------------------
	$("#wkflwAddNode").click(function () {
		let intPkProduct = $("#intPkProduct").val();

		$.ajax({
			type: "POST",
			url: "/Workflow/AddNode",
			data:
			{
				"intPkWorkflow": $("#intPkWorkflow").val()
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					location.href = "/Workflow?intPkWorkflow=" + objResponse.objResponse +
						"&intPkProduct=" + intPkProduct;
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("submit", "#linkProcessAndNodesForm", function (event) {
		//													//Event to cerifu if the workflow it's modifiable and ask
		//													//		to the user if it's sure to change de workflow.
		event.preventDefault();
		let intPkWorkflow = $("#intPkWorkflow").val();

		$.ajax({
			type: "GET",
			url: "/workflow/IsModifiable",
			data:
			{
				"intPkWorkflow_I": intPkWorkflow
			},
			success: function (jsonResponse) {
				/*CASE*/
				if (
					//										//Workflow modifiable, it is not necessary to consult with 
					//										//		the user.
					(jsonResponse.intStatus == 200) &&
					(jsonResponse.objResponse == true)
				) {
					funStartLink(intPkWorkflow);
				}
				else if (
					//										//Workflow not modifiable, it is necessary to ask what to 
					//										//		do to the user.
					(jsonResponse.intStatus == 200) &&
					(jsonResponse.objResponse == false)
				) {
					//										//Modal (first step).
					$(".btnYesNo").css("display", "block");
					$(".btnOk").css("display", "none");
					$("#confirmation-modal").modal('show');
					$("#myModalBody").html("<span class='font-bold'>" + jsonResponse.strUserMessage + "</span>" +
						"<br/> Link anyway?")

					$("#modal-btn-yes").unbind();
					$("#modal-btn-no").unbind();

					//										//Yes (second step).
					$("#modal-btn-yes").bind("click", function () {
						funStartLink(intPkWorkflow);
						$("#confirmation-modal").modal('hide');
					});

					//										//Abort modification.
					$("#modal-btn-no").bind("click", function () {
						$("#confirmation-modal").modal('hide');
					});
				}
				else {
					//										//Invalid data.
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				}
				/*EN-CASE*/
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - -
	function funStartLink(
		//													//Function to create a link between processes or nodes.
	) {
		let intPkWorkflow = $("#intPkWorkflow").val();
		let intPkProduct = $("#intPkProduct").val();
		let boolEstimate = $("#boolEstimate").val();

		//													//Create the object that contains all the information to create
		//													//		the link.
		objLink = funCreateLinkObject();

		$.ajax({
			type: "POST",
			url: "/Workflow/WorkflowLink",
			data: objLink,
			success: function (response) {
				if (
					response.intStatus == 200
				) {
					//										//Reset the form.
					$("#linkProcessAndNodesForm")[0].reset();

					//										//Disable de IO's dropdowns.
					$("#linkProcessAndNodesForm").find("select[name=nodeFromResources]").html("")
						.prop("disabled", true);
					$("#linkProcessAndNodesForm").find("select[name=nodeToResources]").html("")
						.prop("disabled", true);

					if (
						(boolEstimate == null || boolEstimate == undefined || boolEstimate == "")
					) {
						//										//Set the new link that will be loaded when the modal
						//										//		being close.
						$("#intPkWorkflow").val(response.objResponse);
						strNewLinkForReload = "/Workflow?intPkWorkflow=" + response.objResponse +
							"&intPkProduct=" + intPkProduct;
					}

					//										//Clean the inputs for the condition to apply.
					$("#linkProcessAndNodesForm").find("#strConditionToApply").val("");
					$("#linkProcessAndNodesForm").find("#translatedCondition").attr("hidden", true);
					$("#linkProcessAndNodesForm").find("#translatedCondition").html("");

					//										//Get all the links saved and print it on the table.
					funGetLinks(response.objResponse);
					conditionToApplyObject = null;
				}

				subSendNotification(response.strUserMessage, response.intStatus);
			},
			error: function () {
				//enableElements();
				subSendNotification("Something is wrong.", 400);
			}
		});
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funCreateLinkObject(
		//													//Funtion that creates the objecte for the link
	) {
		let linkFormElement = $("#linkProcessAndNodesForm");

		let objLink = {
			//												//Data for the node from.
			//												//Process in workflow pk.
			"intnPkProcessInWorkflowO": linkFormElement.find("select[name=nodeFrom]")
				.find(':selected').data('intpkprocessinworkflow'),
			//												//intnPkEleetOrEleeleO
			"intnPkEleetOrEleeleO": linkFormElement.find("select[name=nodeFromResources]")
				.find(':selected').data('intpkeleetoreleele'),
			//												//boolnIsEleetO
			"boolnIsEleetO": linkFormElement.find("select[name=nodeFromResources]")
				.find(':selected').data('booliseleet'),
			//												//intnPkNodeO
			"intnPkNodeO": linkFormElement.find("select[name=nodeFrom]")
				.find(':selected').data('intnpknode'),
			//												//Data for the node to.
			//												//Process in workflow pk.
			"intnPkProcessInWorkflowI": linkFormElement.find("select[name=nodeTo]")
				.find(':selected').data('intpkprocessinworkflow'),
			//												//intnPkEleetOrEleeleI
			"intnPkEleetOrEleeleI": linkFormElement.find("select[name=nodeToResources]")
				.find(':selected').data('intpkeleetoreleele'),
			//												//boolnIsEleetI
			"boolnIsEleetI": linkFormElement.find("select[name=nodeToResources]")
				.find(':selected').data('booliseleet'),
			//												//intnPkNodeI
			"intnPkNodeI": linkFormElement.find("select[name=nodeTo]")
				.find(':selected').data('intnpknode'),
			//												//Data for the condition to apply.
			"condition": linkFormElement.find("input[name=condition]").val()
		}

		return objLink;
	}

	//------------------------------------------------------------------------------------------------------------------
	$(document).on('show.bs.dropdown', ".wkflwResource, .job-wkflwResource", function () {
		let arrValues = $(this).children("button").val().split('|');
		let dropdownElement = $(this).find("select");
		let strDropDownClass = $(this).attr("class").split(' ')[1];
		let intnJobId = $(this).data("intjobid");

		if (
			dropdownElement.length > 0
		) {
			$.ajax({
				type: "GET",
				url: "/Workflow/GetTypeOrTemplateAllResources",
				data: {
					"intPk": arrValues[0],
					"boolIsType": arrValues[1],
					"intnJobId": intnJobId,
					"intPkProcessInWorkflow": arrValues[2]
				},
				success: function (objResponse) {
					if (
						objResponse.intStatus == 200
					) {
						dropdownElement.html("");

						dropdownElement.append(new Option("Pick one", null));

						if (
							strDropDownClass != "job-wkflwResource"
						) {
							dropdownElement.append(new Option("None", null));
						}

						$.each(objResponse.objResponse, function (index, value) {
							dropdownElement.append(new Option(value.strResourceName, value.intPk));
						});
					}
					else {
						subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					}
				},
				error: function () {
					subSendNotification("Something is wrong.", 400);
				}
			});
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".wkflwResource-dropdown", function () {

		let intPkWorkflow = $("#intPkWorkflow").val();
		let formElement = $(this).closest("form");
		let intPkProduct = $("#intPkProduct").val();
		let boolIsOutput = $(this).data("boolisoutput");

		$.ajax({
			type: "GET",
			url: "/workflow/ResourceIsAddable",
			data: formElement.serialize(),
			success: function (jsonResponse) {
				/*CASE*/
				if (
					//										//Workflow modifiable, it is not necessary to consult with 
					//										//		the user.
					(jsonResponse.intStatus == 200) &&
					(jsonResponse.objResponse == true)
				) {
					funAddResourceToIO(formElement, intPkProduct, boolIsOutput);
				}
				else if (
					//										//Workflow not modifiable, it is necessary to ask what to 
					//										//		do to the user.
					(jsonResponse.intStatus == 200) &&
					(jsonResponse.objResponse == false)
				) {
					//										//Modal (first step).
					$(".btnYesNo").css("display", "block");
					$(".btnOk").css("display", "none");
					$("#confirmation-modal").modal('show');
					$("#myModalBody").html("<span class='font-bold'>" + jsonResponse.strUserMessage + "</span>" +
						"<br/> Add anyway?")

					$("#modal-btn-yes").unbind();
					$("#modal-btn-no").unbind();

					//										//Yes (second step).
					$("#modal-btn-yes").bind("click", function () {
						$("#confirmation-modal").modal('hide');
						funAddResourceToIO(formElement, intPkProduct, boolIsOutput);
					});

					//										//Abort modification.
					$("#modal-btn-no").bind("click", function () {
						$("#confirmation-modal").modal('hide');
					});
				}
				else {
					//										//Invalid data.
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				}
				/*EN-CASE*/
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funAddResourceToIO(
		formElement,
		intPkProduct,
		boolIsOutput
	) {
		let sectionListElement = formElement.parent().parent().next().children().children();
		let strActtion = formElement.attr("action");
		let data = formElement.serialize();
		let boolAddCalculations = $(".wkflwResource-dropdown").attr("data-add-calculations");
		let boolIsDeviceToolOrCustom = $(".wkflwResource-dropdown").attr("data-boolisdevicetoolorcustom");

		$.ajax({
			type: "POST",
			url: strActtion,
			data: data,
			beforeSend: function () {
				//$(".content").fadeOut(300);
				disableElements();
			},
			success: function (objResponse) {

				if (
					objResponse.intStatus == 200
				) {
					if (
						strActtion == "/Jobs/SetResourceForAJob"
					) {
						location.reload();
					}
					else {
						enableElements();

						$("#intPkWorkflow").val(objResponse.objResponse.intPkWorkflow);
						$("#intPkProduct").val(intPkProduct);

						strNewLinkForReload = "/Workflow?intPkWorkflow=" + objResponse.objResponse.intPkWorkflow +
							"&intPkProduct=" + intPkProduct;

						//									//Add item to the list section.
						let itemListElement = $("<li></li>").addClass("list-group-item d-flex " +
							"justify-content-between align-items-center").text(objResponse.objResponse.strName).appendTo(sectionListElement);

						//									//Add button section to the item.
						let buttonSectionElement = $("<span></span>").addClass("badge badge-pill").appendTo(itemListElement);

						if (
							objResponse.objResponse.boolIsPhysical
						) {
							let strAddcalculationClass = "btnAddCalculationByResource";

							if (
								boolIsOutput.toLowerCase() == "true"
							) {
								strAddcalculationClass = "edit-transform-calculation";
							}

							if (
								boolAddCalculations == "True"
							) {
								//								//Add calculation button and append icon.
								let calculationbButtonElement = $("<button></button>").addClass("btn btn-info btn-sm").addClass(strAddcalculationClass)
									.attr("type", "button").attr("data-intnPkResource", objResponse.objResponse.intPk)
									.attr("data-intnPkProcessInWorkflow", objResponse.objResponse.intPkProcessInWorkflow)
									.attr("data-intPkProcessInWorkflow", objResponse.objResponse.intPkProcessInWorkflow)
									.attr("data-intnPkEleetOrEleele", formElement.find("#intPkEleetOrEleele").val())
									.attr("data-intPkEleetOrEleele", formElement.find("#intPkEleetOrEleele").val())
									.attr("data-strtypetemplateandresource", objResponse.objResponse.strName)
									.attr("data-strUnit", objResponse.objResponse.strUnit)
									.attr("data-boolAvoidReloadPage", "True")
									.attr("data-boolIsAbleToSave", "True")
									.attr("data-boolIsPaper", objResponse.objResponse.boolIsPaper)
									.attr("data-boolnIsEleet", formElement.find("#boolIsEleet").val())
									.attr("data-boolIsEleet", formElement.find("#boolIsEleet").val())
									.appendTo(buttonSectionElement);

								$("<i></i>").addClass("fa fa-calculator").attr("aria-hidden", true).appendTo(calculationbButtonElement);
							}
						}

						//									//Add delete button and append icon.
						let deletebButtonElement = $("<button></button>").addClass("btn btn-danger btn-sm btnDeleteResource")
							.attr("type", "button").attr("data-intnpkresource", objResponse.objResponse.intPk)
							.attr("data-intnpkprocessinworkflow", objResponse.objResponse.intPkProcessInWorkflow)
							.attr("data-intnpkeleetoreleele", formElement.find("#intPkEleetOrEleele").val())
							.attr("data-boolniseleet", formElement.find("#boolIsEleet").val())
							.attr("data-boolisdevicetoolorcustom", boolIsDeviceToolOrCustom).appendTo(buttonSectionElement);

						$("<i></i>").addClass("fa fa-trash").attr("aria-hidden", true).appendTo(deletebButtonElement);

						//									//Reset the dropdown
						formElement[0].reset();
						formElement.find("input[name=intPkProcessInWorkflow]").val(objResponse.objResponse.intPkProcessInWorkflow);
					}
				}
				else {
					enableElements();
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			},
			error: function () {
				enableElements();
				subSendNotification("Something is wrong.", 400);
			}
		});
	}

	//------------------------------------------------------------------------------------------------------------------
	$('#addCalculationModalByResource').on('hidden.bs.modal', function () {

		conditionToApplyObject = null; 
		$("#addCalculationModalByResource").find("#intPk").val("");
		$("#addCalculationModalByResource").find("#byResourcePartialView").find("#ProcessPerQuantityResource").removeClass("show");

		boolFromClose = true
		let intJobId = $("#strJobId").val();

		$.when(
			subDeleteTemporalPaperTransformation()
		).then(function () {
			let intnPkProcessInWorkflow = $("#intPkProcessInWorkflow").val();
			let boolHasSize = $("#boolHasSize").val()
			if (
				intnPkProcessInWorkflow != "" && intJobId == undefined
			) {
				funGetProcessInWorkflow(intnPkProcessInWorkflow, boolHasSize);
			}
			else {
				disableElements();
				window.location.reload();
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".removeProcess", function () {
		let divProcess = $(this).parent().parent().parent().parent().parent().parent();
		let intPkProcess = $(this).val();
		let intPkProduct = $("#intPkProduct").val();

		ProcessOrNodeIsDispensable(intPkProcess, intPkProduct, null);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".wkflwNewResource", function () {
		let data_to_resource = $(this).attr("data-to-resource").split("|");
		let boolIsCustom = $(this).data("booliscustom").toLowerCase();
		let boolIsPhysical = true;

		Cookies.remove("showUnitOfMeasurement");

		if (
			data_to_resource[4].toLowerCase() == "true" ||
			data_to_resource[4].toLowerCase() == "True"
		) {
			Cookies.set("showUnitOfMeasurement", "true");
		}
		else {
			boolIsPhysical = false;
			Cookies.set("showUnitOfMeasurement", "false");
		}

		Cookies.set("Origin", "workflow");

		Cookies.set("strTypeId", $("#strTypeId").val());
		Cookies.set("intPkProductWkflw", $("#intPkProduct").val());

		if (boolIsCustom == "false") {
			$(location).attr('href',
				"/PrintshopResourcesTemplate/AddXJDFForm?intPkType="
				+ data_to_resource[2] + "&strType=" + data_to_resource[1] +
				"&intPkResource=0&intnPkTemplate=" + data_to_resource[3] + "&boolIsPhysical=" + boolIsPhysical
				+ "&boolnIsChangeable=true");
		}
		else {
			Cookies.set("strElementIdForTriggerEvent", "AddCustomResourceButton");

			$(location).attr("href", "/PrintshopResourcesTemplate/GetTemplatesAndResources?intPk=" + data_to_resource[2]
				+ "&boolIsType=True");
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".editInputsAndOutputs", function () {
		//debugger
		let intPkProcessType = $(this).attr("data-intPkProcessType");
		let processSelected = $(this).attr("data-strName");
		let strNameProcessType = $(this).attr("data-strNameProcessType");

		let queryUrl = "?intPk=" + $("#intPkProduct").val() + "&strTypeId=" + $("#strTypeId").val();

		Cookies.set("queryUrl", queryUrl);
		Cookies.set('processSelected', processSelected);

		Cookies.remove("currentWorkflowUrl");
		Cookies.set("currentWorkflowUrl", window.location.href);

		$(location).attr('href', "/PrintshopTemplate/GetProcesses?intPkProcessType=" +
			intPkProcessType + "&strTypeId=" + strNameProcessType);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".edit-wflw-resource", function () {
		let intPkResource = $(this).attr("data-intnPkResource");
		let intPkProduct = $("#intPkProduct").val();
		let strTypeId = $("#strTypeId").val();
		let strJobId = $("#strJobId").val();

		//													//The cookie expires on 10 minutes.
		let intExpireTime = (1000 * 60) * 10;
		Cookies.set("intPkResource", intPkResource, { expires: intExpireTime });
		Cookies.set("strJobId", strJobId, { expires: intExpireTime });
		window.location = '/Calculation/AddCalculations?intPk=' + intPkProduct + '&strTypeId=' + strTypeId;
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnAddCalculationByResource", function () {

		$("#addCalculationModalByResource").find(".addByResource").html("").css("display", "none");
		$("#addCalculationModalByResource").find("#byResourcePartialView").css("display", "block");

		let boolIsInPostProcess = $(this).attr("data-boolisinpostprocess");
		if (
			boolIsInPostProcess == "True"
		) {
			$("#addCalculationModalByResource").find("#numnPercentWaste").prop("disabled", true);
			$("#addCalculationModalByResource").find("#numnQuantityWaste").prop("disabled", true);
			$("#addCalculationModalByResource").find("#intnPkProduct").attr("data-boolisinpostprocess", boolIsInPostProcess);
		}
		else if (
			typeof boolIsInPostProcess != "undefined"
		) {
			$("#addCalculationModalByResource").find("#numnPercentWaste").prop("disabled", false);
			$("#addCalculationModalByResource").find("#numnQuantityWaste").prop("disabled", false);
		}

		//													//Get the values.
		let intPkResource = $(this).data("intnpkresource");
		let intnPkProcessInWorkflow = $(this).data("intnpkprocessinworkflow");
		let intnPkEleetOrEleele = $(this).data("intnpkeleetoreleele");
		let boolnIsEleet = $(this).data("boolniseleet");
		let boolIsPaper = JSON.parse($(this).attr("data-boolIsPaper").toLowerCase());
		let boolIsDeviceOrMiscConsumable = JSON.parse($(this).attr("data-boolIsDeviceOrMiscConsumable").toLowerCase());

		//													//Disable the inputs.
		$("#ResourceForm, #BaseResourceForm").find("#intnPkResourceI").css("pointer-events", "none");
		$("#ResourceForm, #BaseResourceForm").find("#intnPkResourceI").css("background", "#dddddd");
		let strProcessName = $("#procesNameSpan_" + intnPkProcessInWorkflow).text();
		$("#addCalculationModalByResource").children().children().find(".modal-header").html(strProcessName);
		$("#addCalculationModalByResource").modal("show")

		//													//Get the process inputs.
		subProcessInputs(intnPkProcessInWorkflow, intPkResource, $("#strJobId").val(), intnPkEleetOrEleele,
			boolnIsEleet);

		//													//Set the option on the dropdown.
		$('#intnPkResourceI option:selected').removeAttr("selected");
		$("#intnPkResourceI").val(intPkResource).change();

		//													//Set other data in the form.
		$("#PerQuantityResource").data("intnpkprocessinworkflow", intnPkProcessInWorkflow);
		$("#ResourceForm, #BaseResourceForm").find("#intnPkProcessInWorkflow").val(intnPkProcessInWorkflow);
		$("#ResourceForm, #BaseResourceForm").find("#intnPkEleetOrEleeleI").val(intnPkEleetOrEleele);
		$("#ResourceForm, #BaseResourceForm").find("#boolnIsEleetI").val(boolnIsEleet);
		$("#ResourceForm, #BaseResourceForm").find("#intnPkResourceI").val(intPkResource);
		$("#ResourceForm, #BaseResourceForm").find("#boolIsPaper").val(boolIsPaper);
		$("#ResourceForm").find("#intnPkTrans").val("");
		$("#ResourceForm").find("#numnNeeded").prop('readonly', false);
		$("#ResourceForm").find("#numnPerUnits").prop('readonly', false);
		$("#ResourceForm").find("#numnNeeded").removeClass('readonly');
		$("#ResourceForm").find("#numnPerUnits").removeClass('readonly');
		$("#ResourceForm").find("#numnPerUnits").prop("disabled", false);
		$("#ResourceForm").find("#intnPkResourceO").css("pointer-events", "all");
		$("#ResourceForm").find("#intnPkResourceO").css("background", "transparent none repeat scroll 0 0");

		intLastPkProcessInWorkflow = intnPkProcessInWorkflow;

		$("#ResourceForm, #BaseResourceForm").find("#group-calculation").css("display", "none");
		$("#ResourceForm, #BaseResourceForm").find("#group-calculation").css("display", "none");

		if (boolIsPaper) {
			$("#ResourceForm").find(".openPaperModal").removeAttr("style");
		}
		else {
			$("#ResourceForm").find(".openPaperModal").css("display", "none");
		}

		//													//Set other data in the paper modal form.
		$("#frmPaper").find("#intPkProcessInWorkflow").val(intnPkProcessInWorkflow);
		$("#frmPaper").find("#intPkEleetOrEleeleI").val(intnPkEleetOrEleele);
		$("#frmPaper").find("#boolIsEleetI").val(boolnIsEleet.toLowerCase());
		$("#frmPaper").find("#intPkResourceI").val(intPkResource);

		if (
			boolIsDeviceOrMiscConsumable
		) {
			$(".NeededPerUnit").removeClass("col-sm-5");
			$(".NeededPerUnit").addClass("col-sm-3");
			$(".chkNeededPerUnit").prop("disabled", true);
			$(".NeededPerUnitCheckbox").prop("hidden", false);
		} else {
			$(".NeededPerUnit").removeClass("col-sm-3");
			$(".NeededPerUnit").addClass("col-sm-5");
			$(".NeededPerUnitCheckbox").prop("hidden", true);
		}

		let intnJobId = $(this).attr("data-intJobId") == "" ? null : $(this).attr("data-intJobId")
		console.info(intnJobId)

		hiddenColumns = true;
		$(".card-header:not(.estimate-card)").children().children().attr("Class", "fa fa-plus-circle");
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnAddCalculationByProcess", function () {
		//													//Get the values.
		let intPkProcess = $(this).attr("data-intpkprocess");
		let intnPkProcessInWorkflow = $(this).data("intnpkprocessinworkflow");

		//													//Disable the inputs.
		$(".intPkProcessType").css("pointer-events", "none");
		$(".intnPkProcess").css("pointer-events", "none");
		$(".intPkProcessType").css("background", "#dddddd");
		$(".intnPkProcess").css("background", "#dddddd");

		let strProcessName = $("#procesNameSpan_" + intnPkProcessInWorkflow).text();
		$("#addCalculationModalByProcess").children().children().find(".modal-header").html(strProcessName);
		$("#addCalculationModalByProcess").modal("show");

		//													//Set the option on the dropdown.
		$('.intnPkProcess option:selected').removeAttr("selected");
		$(".intnPkProcess").val(intPkProcess);

		//													//Set other data in the form.
		$(".intnPkProcessInWorkflow").val(intnPkProcessInWorkflow);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".wkflwSetResourceModal", function () {

		$("#addCalculationModalByResource").find("#byResourcePartialView").find("#ProcessPerQuantityResource").removeClass("show");
		$("#ResourceForm")[0].reset();
		$("#ResourceForm").attr("action", "/Calculation/AddCalculation");
		$("#ResourceForm").find(".btn-primary").html('<span class="fa fa-floppy-o"></span> Save');

		$("#BaseResourceForm")[0].reset();
		$("#BaseResourceForm").attr("action", "/Calculation/AddCalculation");
		$("#BaseResourceForm").find(".btn-primary").html('<span class="fa fa-floppy-o"></span> Save');

		let data = $(this).attr("value").split("|");
		let data_to_resource = $(this).attr("data-to-resource");
		let boolAddCalculations = $(this).data("add-calculations");
		let intPkProduct = $(this).attr("data-intPkProduct");
		let intPkWorkflow = $(this).attr("data-intPkWorkflow");
		let boolIsDeviceToolOrCustom = $(this).attr("data-boolisdevicetoolorcustom");
		let boolIsCustom = $(this).attr("data-booliscustom");
		let boolIsOutput = $(this).attr("data-boolisoutput");
		let boolIsInPostProcess = $(this).attr("data-boolisinpostprocess");
		$("#addCalculationModalByResource").find("#intnPkProduct").attr("data-boolisinpostprocess", boolIsInPostProcess);

		url = "Workflow?intPkWorkflow=" + intPkWorkflow + "&intPkProduct=" + intPkProduct;
		$.when(
			$.ajax({
				type: "GET",
				url: "/Workflow/GetResourcesForIO",
				data: {
					"intPkProcessInWorkflow": data[2],
					"intPkEleetOrEleele": data[0],
					"boolIsEleet": data[1],
					"boolAddCalculations": boolAddCalculations,
					"boolIsDeviceToolOrCustom": boolIsDeviceToolOrCustom,
					"boolIsCustom": boolIsCustom,
					"boolIsOutput": boolIsOutput
				},
				dataType: "html",
				success: function (objResponse) {
					$("#addCalculationModalByResource").find(".addByResource").html(objResponse);
					$("#addCalculationModalByResource").find(".wkflwNewResource").attr("data-to-resource", data_to_resource);

					$("#addCalculationModalByResource").find(".addByResource").css("display", "block");
					$("#addCalculationModalByResource").find("#byResourcePartialView").css("display", "none");

					if (
						boolIsInPostProcess == "True"
					) {
						$("#addCalculationModalByResource").find("#numnPercentWaste").prop("disabled", true);
						$("#addCalculationModalByResource").find("#numnQuantityWaste").prop("disabled", true);
					}
					else {
						$("#addCalculationModalByResource").find("#numnPercentWaste").prop("disabled", false);
						$("#addCalculationModalByResource").find("#numnQuantityWaste").prop("disabled", false);
					}

					let strProcessName = $("#procesNameSpan_" + data[2]).text();
					$("#addCalculationModalByResource").children().children().find(".modal-header").html(strProcessName);
					$("#addCalculationModalByResource").modal("show");
				}
			})
		).then(function () {
			//debugger
			let dropdownElement = $("#addCalculationModalByResource").find(".wkflwResource-dropdown");
			$("#addCalculationModalByResource").find("#intPkProcessInWorkflow").val(data[2]);
			$("#addCalculationModalByResource").find("#intPkEleetOrEleele").val(data[0]);
			$("#addCalculationModalByResource").find("#boolIsEleet").val(data[1]);

			$("#addCalculationModalByResource").find(".btnAddCalculationByResource").attr("data-intnPkProcessInWorkflow", data[2]);
			$("#addCalculationModalByResource").find(".btnAddCalculationByResource").attr("data-intnPkEleetOrEleele", data[0]);
			$("#addCalculationModalByResource").find(".btnAddCalculationByResource").attr("data-boolnIsEleet", data[1]);

			$("#addCalculationModalByResource").find(".edit-transform-calculation").attr("data-intPkProcessInWorkflow", data[2]);
			$("#addCalculationModalByResource").find(".edit-transform-calculation").attr("data-intPkEleetOrEleele", data[0]);
			$("#addCalculationModalByResource").find(".edit-transform-calculation").attr("data-boolIsEleet", data[1]);

			$("#addCalculationModalByResource").find(".btnDeleteResource").attr("data-intnPkProcessInWorkflow", data[2]);
			$("#addCalculationModalByResource").find(".btnDeleteResource").attr("data-intnPkEleetOrEleele", data[0]);
			$("#addCalculationModalByResource").find(".btnDeleteResource").attr("data-boolnIsEleet", data[1]);

			$.ajax({
				type: "GET",
				url: "/Workflow/GetTypeOrTemplateAllResources",
				data: {
					"intPk": data[0],
					"boolIsType": data[1],
					"intPkProcessInWorkflow": data[2]
				},
				success: function (objResponse) {
					//debugger
					if (
						objResponse.intStatus == 200
					) {
						dropdownElement.html("");

						dropdownElement.append(new Option("Pick one", null));

						$.each(objResponse.objResponse, function (index, value) {
							dropdownElement.append(new Option(value.strResourceName, value.intPk));
						});

						dropdownElement.attr("data-intPkProduct", intPkProduct);
						dropdownElement.attr("data-intPkWorkflow", intPkWorkflow);
					}
					else {
						subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					}
				},
				error: function () {
					subSendNotification("Something is wrong.", 400);
				}
			});
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnDeleteResource", function () {
		//													//Get data.
		let intPkResource = $(this).data("intnpkresource");
		let intnPkProcessInWorkflow = $(this).data("intnpkprocessinworkflow");
		let intnPkEleetOrEleele = $(this).data("intnpkeleetoreleele");
		let boolnIsEleet = $(this).data("boolniseleet");

		let objData =
		{
			"intPkProcessInWorkflow": intnPkProcessInWorkflow,
			"intPkResource": intPkResource,
			"intPkEleetOrEleele": intnPkEleetOrEleele,
			"boolIsEleet": boolnIsEleet
		}

		let btnDeleteResource = $(this);
		$.ajax({
			type: "GET",
			url: "/Workflow/ResourceIsDispensable",
			data: objData,
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					if (
						objResponse.objResponse.boolResourceIsDispensable == false
					) {
						$(".btnYesNo").css("display", "block");
						$(".btnOk").css("display", "none");
						$("#confirmation-modal").modal('show');
						$("#myModalBody").html("<span class='font-bold'>" + objResponse.objResponse.strJobs + "</span>" +
							"<br/> Delete anyway?");

						$("#modal-btn-yes").unbind();
						$("#modal-btn-yes").bind("click", function () {
							subDeleteResourcesForIO(objData, btnDeleteResource);
							$("#confirmation-modal").modal('hide');
						});
					}
					else {
						subDeleteResourcesForIO(objData, btnDeleteResource);
					}
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#modalProcessInWorkflow").on("hidden.bs.modal", function () {
		if (strNewLinkForReload != null) {
			location.href = strNewLinkForReload;
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".wkflwCheckThickness", function () {
		let checkbox = $(this);
		let strCheckboxClass = checkbox.attr("class").split(" ")[2];
		let objThickness = {
			"intPkEleetOrEleele": checkbox.data("intpkeleetoreleele"),
			"boolIsEleet": checkbox.data("booliseleet"),
			"intPkProcessInWorkflow": checkbox.data("intpkprocessinworkflow"),
			"boolThickness": false
		}

		if (
			checkbox.is(":checked")
		) {
			objThickness.boolThickness = true;
		}

		$.ajax({
			type: "POST",
			url: "/Workflow/SetAsThickness",
			data: objThickness,
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					$("." + strCheckboxClass).prop("checked", false);

					if (
						objThickness.boolThickness
					) {
						checkbox.prop("checked", true);
					}
				}
				else {
					checkbox.prop("checked", false);
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".edit-transform-calculation", function () {
		conditionToApplyObject = null;
		let intnPk = $(this).data("intnpk");
		let boolCustomWorkflow = $(this).data("boolcustomworkflow");
		let strTypeTemplateAndResourceO = $(this).data("strtypetemplateandresource");
		let intPkProcessInWorkflow = $(this).data("intpkprocessinworkflow");
		let strUnitO = $(this).data("strunit");
		let intPkEleetOrEleeleO = $(this).data("intpkeleetoreleele");
		let boolIsEleetO = $(this).data("booliseleet");
		let intnPkResourceO = $(this).data("intnpkresource");
		let boolAvoidReloadPage = $(this).data("boolavoidreloadpage") == "True" ? false : true;
		let boolIsAbleToSave = $(this).data("boolisabletosave") == "True" ? true : false;

		$.ajax({
			type: "GET",
			url: "/Workflow/GetTransformCalculation",
			data: {
				"intnPk": intnPk,
				"strTypeTemplateAndResourceO": strTypeTemplateAndResourceO,
				"intPkProcessInWorkflow": intPkProcessInWorkflow,
				"strUnitO": strUnitO,
				"intPkEleetOrEleeleO": intPkEleetOrEleeleO,
				"boolIsEleetO": boolIsEleetO,
				"intnPkResourceO": intnPkResourceO,
				"intnJobId": $("#strJobId").val(),
				"boolIsAbleToSave": boolIsAbleToSave,
				"boolCustomWorkflow": boolCustomWorkflow
			},
			success: function (strResponse) {
				subShowModal(strTypeTemplateAndResourceO, strResponse, "modal-lg", "autoHeight", true,
					boolIsAbleToSave);

				boolReloadSite = boolAvoidReloadPage;
				$("#mi4pMasterModalSave").removeAttr("disabled");
				$("#mi4pMasterModalSave").unbind();
				$("#mi4pMasterModalSave").bind("click", function () {
					$("#transform-calculation-form").find("button").not(".btn").click();
				});
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("submit", "#transform-calculation-form", function (event) {
		event.preventDefault();
		let intnJobId = $("#strJobId").val();
		let intPkProcessInWorkflow = $("#transform-calculation-form").find("input[name=intPkProcessInWorkflow]").val();

		$.ajax({
			type: "POST",
			url: "/Calculation/SetTransform",
			data: $(this).serialize(),
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					//										//Get all the transform calculations and refresh the.
					//										//		the table.
					funGetTransformCalculation(intnJobId, intPkProcessInWorkflow);

					//										//Reset the form.
					$("#transform-calculation-form")[0].reset();
					$("#transform-calculation-form").find("input[name=intnPk]").val("");

					//										//Clean the inputs for the condition to apply.
					$("#transform-calculation-form").find("#strConditionToApply").val("");
					$("#transform-calculation-form").find("#translatedCondition").attr("hidden", true);
					$("#transform-calculation-form").find("#translatedCondition").html("");

					//										//The delete button for the updated record is enabled.
					$(".deleteTransformCalculationBtn").prop("disabled", false);
					conditionToApplyObject = null;
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400)
			}
		});
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funGetTransformCalculation(
		intnJobId,
		intPkProcessInWorkflow
	) {
		$.ajax({
			type: "GET",
			url: "/Workflow/GetAllTransformCalculation",
			data: {
				"intnJobId": intnJobId,
				"intPkProcessInWorkflow": intPkProcessInWorkflow
			},
			beforeSend: function () {
				$("#trasformCalculationTableSection").html('<div class="col-sm-12 text-center">' +
					'<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only" ></span ></div>');
			},
			success: function (objResponse) {
				$("#trasformCalculationTableSection").html(objResponse);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	}

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".editTransformCalculationBtn", function () {
		let buttonElement = $(this);
		let intPk = $(this).data("intpk");

		$.ajax({
			type: "GET",
			url: "/Workflow/GetOneTransform",
			data: {
				"intnPk": intPk
			},
			beforeSend: function () {
				$(".deleteTransformCalculationBtn").prop("disabled", false);
				buttonElement.next().prop("disabled", true);
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					$("#transform-calculation-form").find("input[name=intnPk]").val(objResponse.objResponse.intnPk);
					$("#transform-calculation-form").find("#strTypeTemplateAndResourceI")
						.val(objResponse.objResponse.intPkResourceI).change();
					$("#transform-calculation-form").find("input[name=numNeeded]").val(objResponse.objResponse.numNeeded);
					$("#transform-calculation-form").find("input[name=numPerUnit]").val(objResponse.objResponse.numPerUnit);

					if (
						objResponse.objResponse.strConditionToApply != null &&
						objResponse.objResponse.strConditionToApply != "" &&
						objResponse.objResponse.strConditionToApply != undefined
					) {
						//									//Show the condition to apply elements.
						$("#transform-calculation-form").find("#translatedCondition").show();
						$("#transform-calculation-form").find("#translatedCondition")
							.html(objResponse.objResponse.strConditionToApply);

						if (
							(objResponse.objResponse.numnMinQty != null &&
								objResponse.objResponse.numnMinQty != undefined &&
								objResponse.objResponse.numnMinQty > 0) ||
							(objResponse.objResponse.numnMaxQty != null &&
								objResponse.objResponse.numnMaxQty != undefined &&
								objResponse.objResponse.numnMaxQty > 0)
						) {
							$("#numnInferiorLimitSection, #numnSuperiorLimitSection").removeAttr("hidden");
						}

						//									//Set all the value for conditions to apply.
						$("#transform-calculation-form").find("input[name=numnInferiorLimit]")
							.val(objResponse.objResponse.numnMinQty);
						$("#transform-calculation-form").find("input[name=numnSuperiorLimit]")
							.val(objResponse.objResponse.numnMaxQty);
						$("#transform-calculation-form").find("input[name=boolConditionAnd]")
							.val(objResponse.objResponse.boolConditionAnd);
						$("#transform-calculation-form").find("input[name=strConditionToApply]")
							.val(objResponse.objResponse.strConditionToApplyCoded);
					}
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400)

			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".deleteTransformCalculationBtn", function () {
		let intPk = $(this).data("intpk");
		let intnJobId = $("#strJobId").val();
		let intPkProcessInWorkflow = $("#transform-calculation-form").find("input[name=intPkProcessInWorkflow]").val();

		$.ajax({
			type: "POST",
			url: "/Workflow/DeleteTransform",
			data: {
				"intPk": intPk
			},
			success: function (ObjResponse) {
				funGetTransformCalculation(intnJobId, intPkProcessInWorkflow);
				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400)

			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------
$("#wfRenameButton").on("click", function () {
	$("#wfName").css("display", "none");
	$("#wfRenameButton").css("display", "none");
	$("#wfNameInput").removeAttr("hidden");
	$("#wfSaveNameButton").removeAttr("hidden");
	$("#wfRenameCancelButton").removeAttr("hidden");

	wfNameInput = $("#wfNameInput").val();
});

//----------------------------------------------------------------------------------------------------------------------
$("#wfRenameCancelButton").on("click", function () {
	let resetName = $("#strTypeId").val();
	$("#wfNameInput").val(resetName);

	$("#wfNameInput").attr("hidden", "");
	$("#wfSaveNameButton").attr("hidden", "");
	$("#wfRenameCancelButton").attr("hidden", "");
	$("#wfName").css("display", "");
	$("#wfRenameButton").css("display", "");

});

//----------------------------------------------------------------------------------------------------------------------
$("#wfSaveNameButton").on("click", function () {
	let intPkWorkflow = $("#intPkWorkflow").val();
	let strWorkflowName = $("#wfNameInput").val();
	let objData = {
		"intPkWorkflow": intPkWorkflow,
		"strWorkflowName": strWorkflowName
	};

	if (strWorkflowName != "") {
		$.ajax({
			type: "POST",
			url: "/Workflow/RenameWorkflow",
			data: objData,
			beforeSend: function () {
				disableElements();
			},
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					location.reload();
				}
				else {
					enableElements();
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					$("#wfNameInput").val(wfNameInput);
				}
			},
			error: function () {
				enableElements();
				subSendNotification("Something is wrong.", 400);
			}
		});
	}
	else {
		$("#wfNameInput").val(wfNameInput);
		subSendNotification("Something is wrong", 400);
	}
});

//----------------------------------------------------------------------------------------------------------------------
$(document).on("change", ".wkflwCheckFinal", function () {
	//													//Get the values for the service.
	arrstrData = $(this).val().split('|');

	//													//Get bool to know if the workflow is for an estimation.
	let boolEstimate = JSON.parse($("#boolEstimate").val().toLowerCase());

	//													//Create the object.
	let objData = {
		"intPkProcessInWorkflow": arrstrData[0],
		"intPkEleetOrEleele": arrstrData[1],
		"boolIsEleet": arrstrData[2],
		"boolIsFinalProduct": false,
		"boolEstimate": $("#boolEstimate").val()
	};

	if (
		//													//Set the final product.
		$(this).is(":checked")
	) {
		objData.boolIsFinalProduct = true;
	}

	$.ajax({
		type: "POST",
		url: "/Workflow/SetFinalProduct",
		data: objData,
		success: function (objResponse) {
			subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			if (
				objResponse.intStatus != 200
			) {
				if (
					$(this).is(":checked")
				) {
					$(this).prop("checked", false);
				}
				else {
					$(this).prop("checked", true);
				}
			}
			else {
				if (
					objResponse.objResponse != null
				) {
					let intPkProduct = $("#intPkProduct").val();

					location.href = "/Workflow?intPkWorkflow=" + objResponse.objResponse +
						"&intPkProduct=" + intPkProduct;

					$("#intPkWorkflow").val(objResponse.objResponse);
				}
				else {
					location.reload();
				}
			}

		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
		}
	});
});

//----------------------------------------------------------------------------------------------------------------------
$(document).on("change", ".wkflwCheckSize", function () {

	//													//Get the values for the service.
	let chkSize = $(this);
	arrstrData = chkSize.val().split('|');

	//													//Create the object.
	let objData = {
		"intPkProcessInWorkflow": arrstrData[0],
		"intPkEleetOrEleele": arrstrData[1],
		"boolIsEleet": arrstrData[2],
		"boolSize": false
	};

	let strSetUnset = "Unset";
	if (
		//													//Set the final product.
		chkSize.is(":checked")
	) {
		strSetUnset = "Set";
		objData.boolSize = true;
	}

	$.ajax({
		type: "GET",
		url: "/Workflow/HasNotCalculations",
		data: objData,
		success: function (response) {
			if (
				response.intStatus == 200
			) {
				if (
					response.objResponse == false
				) {
					$(".btnYesNo").css("display", "block");
					$(".btnOk").css("display", "none");
					$("#myModalBody").html("<span class='font-bold'>" + response.strUserMessage + "</span>" +
						"<br/>" + strSetUnset + " anyway?");
					$("#confirmation-modal").modal('show');

					$("#modal-btn-yes").unbind();
					$("#modal-btn-no").unbind();

					$("#modal-btn-yes").bind("click", function () {
						funSetSize(objData, chkSize);
						$("#confirmation-modal").modal('hide');
					});
					$("#modal-btn-no").bind("click", function () {
						if (
							chkSize.is(":checked")
						) {
							chkSize.prop("checked", false);
						}
						else {
							chkSize.prop("checked", true);
						}
						$("#confirmation-modal").modal('hide');
					});
				}
				else {
					funSetSize(objData, chkSize);
				}
			}
			else {
				if (
					chkSize.is(":checked")
				) {
					chkSize.prop("checked", false);
				}
				else {
					chkSize.prop("checked", true);
				}
				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			}
		},
		error: function () {
			if (
				chkSize.is(":checked")
			) {
				chkSize.prop("checked", false);
			}
			else {
				chkSize.prop("checked", true);
			}
			subSendNotification("Something is wrong.", 400);
		}
	});


});

//----------------------------------------------------------------------------------------------------------------------
$(document).on("click", "#wkflwDeleteNode", function () {
	let intnPkNode = $("#intnPkNode").val();
	let intPkProduct = $("#intPkProduct").val();

	ProcessOrNodeIsDispensable(null, intPkProduct, intnPkNode);
});

//----------------------------------------------------------------------------------------------------------------------
//															//SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function ProcessOrNodeIsDispensable(intPkProcess, intPkProduct, intnPkNode) {
	$.ajax({
		type: "GET",
		url: "/Workflow/ProcessOrNodeIsDispensable",
		data: {
			"intnPkProcessInWorkflow": intPkProcess,
			"intnPkNode": intnPkNode
		},
		success: function (objResponse) {
			if (objResponse.intStatus == 200) {
				if (!objResponse.objResponse) {
					$("#confirmation-modal").modal('show');
					$("#myModalBody").html("<b>" + objResponse.strUserMessage + "</b>" +
						"<br/> Delete anyway?")

					$("#modal-btn-yes").unbind();
					$("#modal-btn-yes").css('display', '');

					$("#modal-btn-no").unbind();
					$("#modal-btn-no").css('display', '');

					$("#modal-btn-yes").bind("click", function () {
						subDeleteProcess(intPkProcess, intnPkNode, intPkProduct);
						$("#confirmation-modal").modal('hide');
					});

					$("#modal-btn-no").bind("click", function () {
						$("#confirmation-modal").modal('hide');
					});
				}
				else {
					subDeleteProcess(intPkProcess, intnPkNode, intPkProduct);
				}
			}
			else {
				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			}
		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subDeleteProcess(intPkProcess, intnPkNode, intPkProduct) {
	let boolEstimate = $("#boolEstimate").val();

	$.ajax({
		type: "POST",
		url: "/Workflow/DeleteProcess",
		data: {
			"intnPkProcessInWorkflow": intPkProcess,
			"intnPkNode": intnPkNode,
			"intPkProduct": intPkProduct,
			"boolEstimate": boolEstimate
		},
		beforeSend: function () {
			//$(".content").fadeOut(300);
			disableElements()
		},
		success: function (objResponse) {
			if (
				objResponse.intStatus == 200
			) {
				if (
					objResponse.objResponse != null
				) {
					let locationUrl = objResponse.objResponse.value;
					window.location.href = locationUrl;
				}
				else {
					location.reload();
				}
			}
			else {
				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			}
		},
		error: function () {
			enableElements();
			subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subDeleteResourcesForIO(objData, btnDeleteResource) {
	$.ajax({
		type: "POST",
		url: "/Workflow/DeleteResourcesForIO",
		data: objData,
		success: function (objResponse) {
			//debugger
			if (objResponse.intStatus == 200) {
				$("#intPkWorkflow").val(objResponse.objResponse);
				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				btnDeleteResource.parent().parent().remove();

				strNewLinkForReload = "/Workflow?intPkWorkflow=" + objResponse.objResponse + "&intPkProduct=" +
					$("#intPkProduct").val();
			}
			else {
				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			}
		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subProcessInputs(intPkProcessInWorkflow, intPkResource, intnJobId, intnPkEleetOrEleele, boolnIsEleet,
	intnPkResourceO = null) {
	$.ajax({
		type: "GET",
		url: "/Jobs/GetProcessInputs",
		data: {
			"intPkProcessInWorkflow": intPkProcessInWorkflow,
			"intnPkResource": intPkResource,
			"intnJobId": intnJobId,
			"intPkeleetOrEleele": intnPkEleetOrEleele,
			"boolIsEteel": boolnIsEleet
		},
		success: function (objResponse) {
			let quantityFromDropdown = $("#ResourceForm").find("#intnPkResourceO");
			quantityFromDropdown.html("");
			quantityFromDropdown.append("<option value=''>Pick one</option>")

			$.each(objResponse, function (intIndex, objValue) {
				let strAreaUnit = objValue.strAreaUnit == null ? "null" : objValue.strAreaUnit;
				$("<option>" + objValue.strTypeTemplateAndResource + "</option>")
					.attr("value", objValue.intnPkResource == null ?
						"JobQuantity" : objValue.intnPkResource)
					.attr("data-intnPkEleetOrEleele", objValue.intnPkEleetOrEleele)
					.attr("data-boolIsEleet", objValue.boolIsEleet)
					.attr("data-strUnit", objValue.strUnit)
					.attr("data-boolIsComponent", objValue.boolIsComponet)
					.attr("data-boolSize", objValue.boolSize)
					.attr("data-boolIsRoll", objValue.boolIsRoll)
					.attr("data-boolIsMedia", objValue.boolIsMedia)
					.attr("data-strAreaUnit", strAreaUnit).appendTo(quantityFromDropdown);
			});

			quantityFromDropdown.find("option[value=" + intPkResource + "]").attr("hidden", true);
			quantityFromDropdown.removeAttr("disabled");

			if (
				intnPkResourceO != null
			) {
				quantityFromDropdown.val(intnPkResourceO).change();
			}
			else {
				quantityFromDropdown.val("").change();
			}
		}
		//													//This was commented because if the modal of calculations
		//													//		is closed quickly an error happens because the call
		//													//		is interrumpted.
		//},
		//error: function () {
		//	subSendNotification("Something is wrong.", 400);
		//}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subDeleteTemporalPaperTransformation() {
	if (intPkPaTrans != null /*|| intnPkCalcu != null*/) {
		$.ajax({
			type: "POST",
			url: "/PaperTransformation/DeletePaper",
			data: {
				"intPkPaTrans": intPkPaTrans,
				"intnPkCalculation": intnPkCalcu,
				"boolFromClose": boolFromClose
			},
			success: function (jsonResponse) {
				$("#ResourceForm").find("#intnPkTrans").val("");
				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
			},
			error: function () {
				//subSendNotification("Something is wrong.", 400);
			}
		});
	}
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funGetProcessInWorkflow(
	//													//Process in workflow to get.
	intPkProcessInWorkflow_I,
	boolHasSize_I
) {
	$.ajax({
		type: "GET",
		url: "/Workflow/GetProcessDetails",
		data: {
			"intPkProcessInWorkflow_I": intPkProcessInWorkflow_I,
			"boolGeneric_I": boolGeneric,
			"boolSuperAdmin_I": boolIsSuperAdmin,
			"boolHasSize_I": boolHasSize_I
		},
		success: function (objResponse) {
			if (typeof objRespose === "object") {
				subSendNotification(objRespose.strUserMessage, objRespose.intStatus);
			}
			else {
				$("#modalProcessInWorkflow").find(".modal-body").html(objResponse);

				$("#modalProcessInWorkflow").modal("show");
			}
		}
	})
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funGetLinks(
	//													//Function that return a view with all links data.

	//													//Receives the intPkWorkflow.
	intPkWorkflow_I
) {
	$.ajax({
		type: "GET",
		url: "/Workflow/GetLinks",
		data: {
			"intPk": intPkWorkflow_I
		},
		success: function (strHtmlCode) {
			$("#linkTableSection").html(strHtmlCode);
		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funSetSize(
	//													//Function that set/unset an io as size.

	//													//Receives the io info.
	objData_I,
	//													//The checkbox.
	chkSize_I
) {
	$.ajax({
		type: "POST",
		url: "/Workflow/SetSize",
		data: objData_I,
		success: function (objResponse) {
			subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			if (
				objResponse.intStatus != 200
			) {
				if (
					chkSize_I.is(":checked")
				) {
					chkSize_I.prop("checked", false);
				}
				else {
					chkSize_I.prop("checked", true);
				}
			}
		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -