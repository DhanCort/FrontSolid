$(document).ready(function () {
	//loader();
	let currentUrl = Cookies.get("currentUrl");
	if (currentUrl != null) {
		$(".backWfJobs").removeAttr("href");
		$(".backWfJobs").attr("href", currentUrl);
	}

	//------------------------------------------------------------------------------------------------------------------
	//															//TRANSFORMATION METHODS.

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".viewNeeded", function () {
		let intPk = $(this).attr("data-intPk");

		$.ajax({
			type: "GET",
			url: "/Workflow/GetWorkflowInformation",
			data: { "intPkWorkflow": intPk },
			dataType: "html",
			success: function (response) {
				//console.log(response)
				$(".neededResourcesAndProcess").html(response);
				$('#neededModal').modal('show');
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("submit", ".saveCostPrice", function (event) {
		//debugger
		event.preventDefault();
		let strJobId = $("#strJobId").val();
		let intnCopyNumber = $(this).find("input[name=intnCopyNumber]").val();
		let objData = $(this).serialize();

		$.ajax({
			type: "GET",
			url: "/Jobs/IsPriceChangeable",
			data: { "intJobId": strJobId },
			dataType: "html",
			beforeSend: function () {
				//$(".content").fadeOut(300);
				disableElements()
			},
			success: function (strResponse) {
				let objResponse = JSON.parse(strResponse);
				if (objResponse.intStatus == 200) {
					if (
						objResponse.objResponse
					) {
						subSetJobPrice(objData, intnCopyNumber);
					}
					else {
						enableElements();
						$(".btnYesNo").css("display", "block");
						$(".btnOk").css("display", "none");
						$("#confirmation-modal").modal('show');
						$("#myModalBody").html("<span class='font-bold'>" + objResponse.strUserMessage + "</span>");

						$("#modal-btn-yes").bind("click", function () {
							subSetJobPrice(objData, intnCopyNumber);
							$("#confirmation-modal").modal('hide');
						});
					}
				}
				else {
					enableElements();
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btn-reset-price", function () {
		let strJobId = $("#strJobId").val();
		let intPkWorkflow = $(this).attr("data-intPkWf-EstId").split("|")[0];
		let intnEstimateId = $(this).attr("data-intPkWf-EstId").split("|")[1];
		let intnCopyNumber = $(this).data("intncopynumber");
		let boolIsEstimate = JSON.parse($("#boolIsEstimate").val() ?? null);

		$.ajax({
			url: "/Jobs/ResetPriceForAJob",
			type: "POST",
			data: {
				"intJobId": strJobId,
				"intnEstimateId": intnEstimateId,
				"intPkWorkflow": intPkWorkflow,
				"intnCopyNumber": intnCopyNumber
			},
			beforeSend: function () {
				//$(".content").fadeOut(300);
				disableElements()
			},
			success: function (objResponse) {
				boolSendEmail = false;
				if (objResponse.intStatus == 200) {
					//loader();
					location.reload();
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			},
			error: function () {
				boolSendEmail = false;
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------

	$('#addCalculationModalByProcess, #generalPorpousesModal').on('hidden.bs.modal', function () {
		conditionToApplyObject = null;
		let strJobId = $("#strJobId").val();
		if (
			strJobId != null && strJobId != ""
		) {
			disableElements();
			location.reload();
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#start-job-btn").click(function () {
		let strJobId = $("#strJobId").val();
		let intPkWorkflow = $("#intPkWorkflow").val();
		let strPrintshopId = $(".btnNotif").attr("data-strPrintshopId");

		$.ajax({
			type: "POST",
			url: "/Jobs/ModifyJobStagePendingToProgress",
			data: {
				"intJobId": strJobId,
				"intPkWorkflow": intPkWorkflow
			},
			beforeSend: function () {
				//$(".content").fadeOut(300);
				disableElements()
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					if (objResponse.boolSendNotification) {
						connection.invoke("SendToAFew", strPrintshopId, objResponse.arrintContactId,
							objResponse.strNotificationMessage);
					}

					if (objResponse.boolReduceNotifications) {
						connection.invoke("ReduceToAFew", strPrintshopId, objResponse.arrintContactIdToReduce);
					}

					location.reload();
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
	$(".btn-process-stage").click(function () {
		let intJobId = $("#strJobId").val();
		let intPkProcessInWorkflow = $(this).data("intpkprocessinworkflow");
		let intStage = $(this).data("intstage");
		let strPrintshopId = $(".btnNotif").attr("data-strPrintshopId");

		$.ajax({
			type: "POST",
			url: "/Jobs/UpdateProcessStage",
			data: {
				"intPkProcessInWorkflow": intPkProcessInWorkflow,
				"intJobId": intJobId,
				"intStage": intStage
			},
			beforeSend: function () {
				//$(".content").fadeOut(300);
				disableElements()
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					if (objResponse.boolSendNotification) {
						connection.invoke("SendToAFew", strPrintshopId, objResponse.arrintContactId,
							objResponse.strNotificationMessage);
					}

					if (objResponse.boolReduceNotifications) {
						connection.invoke("ReduceToAFew", strPrintshopId, objResponse.arrintContactIdToReduce);
					}

					disableElements();
					if (intStage == 2) {
						subGetProcessesAndResourcesCosts(intPkProcessInWorkflow);
					}
					else {
						location.reload();
					}

					if (
						//									//Validate if the email dialog needs to be open.
						objResponse.objResponse
					) {
						let strEmailMessage = "The order has been already started.";
						if (
							intStage == 2
						) {
							strEmailMessage = "The order has been completed.<br />" +
								"Would you like to send an email to your customer?";
						}

						funShowEmailDialog(strEmailMessage, function () { funSendEmail(intJobId) });
					}
				}
				else {
					enableElements();
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				enableElements();
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".workflow-job-dropdown").on("shown.bs.dropdown", function () {
		//debugger
		let intPkProduct = $(this).data("intpkproduct");
		let intJobId = $(this).data("intjobid");
		let dropdownSection = $(this).find("div");
		let service = $(this).attr("data-service");
		let boolEstimate = $(this).attr("data-boolEstimate");

		Cookies.remove("currentUrl");
		Cookies.set("currentUrl", window.location.href);
		$.ajax({
			type: "GET",
			url: "/Jobs/GetProductWorkflows",
			data: {
				"intPkProduct": intPkProduct,
				"intnJobId": intJobId,
				"boolEstimate": boolEstimate
			},
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {
					let boolHasAtLeastOneDefault = false;
					let strMessage = "";
					dropdownSection.html("");
					let intRowNumber = objResponse.objResponse.length;

					if (service == "Workflow") {
						if (
							objResponse.objResponse.length > 0
						) {
							$.each(objResponse.objResponse, function (intIndex, objValue) {
								let srtUrl = "/Jobs/Workflow?intJobId=" + intJobId + "&intPkWorkflow=" +
									objValue.intPkWorkflow;
								let linkElement = $("<a class='dropdown-item'>" +
									objValue.strName + "</a>").attr("data-intPkWorkflow", objValue.intPkWorkflow);

								if (
									(!objValue.boolUsed && boolHasAtLeastOneDefault && !objValue.boolNewVersion) ||
									(objValue.boolUsed && !objValue.boolStillValid)
								) {
									linkElement.addClass("showNotification");
									if (
										objValue.boolUsed && !objValue.boolStillValid
									) {
										srtUrl = srtUrl + "&boolReadOnly=true";
										linkElement.attr("data-boolReadOnly", true);
										linkElement.attr("data-strWarningMessage", "There is a new version for this " +
											"workflow, you can open it as read only.");
									}
									else {
										linkElement.attr("data-strWarningMessage", strMessage);
									}
								}

								linkElement.attr("href", srtUrl);
								dropdownSection.append(linkElement);
								if (
									objValue.boolUsed
								) {
									boolHasAtLeastOneDefault = true;
									strMessage = objValue.strWarningMessage;

									if (
										intRowNumber > 1
									) {
										dropdownSection.append('<div class="dropdown-header">Other Workflows</div>');
									}
								}
							});
						} else {
							dropdownSection.append('<div class="dropdown-header">No workflows found.</div>');
						}
					}
					else if (service == "Estimate") {
						$.each(objResponse.objResponse, function (intIndex, objValue) {
							let strUrl = "/Estimate/GetEstimates?intJobId=" +
								intJobId + "&intPkWorkflow=" + objValue.intPkWorkflow + "&intPkProduct=" + intPkProduct;
							let linkElement = $("<a class='dropdown-item'>" + objValue.strName + "</a>")
								.attr("data-intPkWorkflow", objValue.intPkWorkflow);

							if (
								(!objValue.boolUsed && boolHasAtLeastOneDefault && !objValue.boolNewVersion) ||
								(objValue.boolUsed && !objValue.boolStillValid)
							) {
								linkElement.addClass("showNotification");
								if (
									objValue.boolUsed && !objValue.boolStillValid
								) {
									strUrl = strUrl + "&boolReadOnly=true";
									linkElement.attr("data-boolReadOnly", true);
									linkElement.attr("data-strWarningMessage", "There is a new version for this " +
										"workflow, you can open it as read only.");
								}
								else {
									linkElement.attr("data-strWarningMessage", strMessage);
								}
							}

							linkElement.attr("href", strUrl);
							dropdownSection.append(linkElement)
							if (
								objValue.boolUsed
							) {
								boolHasAtLeastOneDefault = true;
								strMessage = objValue.strWarningMessage;

								if (
									intRowNumber > 1
								) {
									dropdownSection.append('<div class="dropdown-header">Other Workflows</div>');
								}
							}
						});
					}
					else if (service == "Ticket") {
						$.each(objResponse.objResponse, function (intIndex, objValue) {

							let linkElement = $("<a class='dropdown-item download'>" + objValue.strName + "</a>")
								.attr("data-intJobId", intJobId)
								.attr("data-intPkProduct", intPkProduct)
								.attr("data-intPkWorkflow", objValue.intPkWorkflow)
								.attr("data-strName", objValue.strName);

							if (
								(!objValue.boolUsed && boolHasAtLeastOneDefault && !objValue.boolNewVersion) ||
								(objValue.boolUsed && !objValue.boolStillValid)
							) {
								linkElement.addClass("showNotification");
								if (
									objValue.boolUsed && !objValue.boolStillValid
								) {
									linkElement.attr("data-strWarningMessage", "There is a new version for this " +
										"workflow.");
								}
								else {
									linkElement.attr("data-strWarningMessage", strMessage);
								}
							}
							else {
								linkElement.addClass("download-ticket");
							}

							dropdownSection.append(linkElement);
							if (
								objValue.boolUsed
							) {
								boolHasAtLeastOneDefault = true;
								strMessage = objValue.strWarningMessage;

								if (
									intRowNumber > 1
								) {
									dropdownSection.append('<div class="dropdown-header">Other Workflows</div>');
								}
							}
						});
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
	$(document).on("click", ".showNotification", function (event) {
		event.preventDefault();
		let linkElement = $(this);
		let boolDownload = $(this).hasClass("download");
		let boolSelectWfTask = $(this).hasClass("taskSelect");
		let optionSelected = $(this);
		let strMessage = $(this).data("strwarningmessage");
		let boolReadOnly = $(this).data("boolreadonly");

		$(".btnYesNo").css("display", "block");
		$(".btnOk").css("display", "none");
		$("#confirmation-modal").modal('show');
		$("#myModalBody").html(
			"<span class=''>" + strMessage + "</span><br /> " +
			"<span class='font-bold'>Continue anyway?</span><br />"
		);

		$("#modal-btn-yes").unbind();
		$("#modal-btn-yes").bind("click", function () {
			if (
				!boolDownload && !boolSelectWfTask
			) {
				//Cookies.set("boolReadOnly", boolReadOnly, { expires: 1 });
				location.href = optionSelected.attr("href");
			}
			else if (
				boolSelectWfTask
			) {
				Cookies.set("boolReadOnly", boolReadOnly, { expires: 1 });
				linkElement.addClass("selectWfTask");
				linkElement.trigger("click");
			}
			else {
				let intPkWorkflow = optionSelected.data("intpkworkflow");
				let intJobId = optionSelected.data("intjobid");
				let intPkProduct = optionSelected.data("intpkproduct");
				let strName = optionSelected.data("strname");

				subDownloadTicket(intPkWorkflow, intJobId, intPkProduct, strName);
			}

			$("#confirmation-modal").modal('hide');
		});

		$("#modal-btn-no").unbind();
		$("#modal-btn-no").bind("click", function () {
			$("#confirmation-modal").modal('hide');
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".download-ticket", function () {
		let intPkWorkflow = $(this).data("intpkworkflow");
		let intJobId = $(this).data("intjobid");
		let intPkProduct = $(this).data("intpkproduct");
		let strName = $(this).data("strname");

		subDownloadTicket(intPkWorkflow, intJobId, intPkProduct, strName);
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function subDownloadTicket(
		intPkWorkflow,
		intJobId,
		intPkProduct,
		strName
	) {
		$.ajax({
			type: "GET",
			url: "/Jobs/DownloadTicket",
			data: {
				"intPkWorkflow": intPkWorkflow,
				"intJobId": intJobId
			},
			success: function (objResponse) {
				if (
					typeof objResponse == "object"
				) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus)
				}
				else {
					//window.open("data:application/pdf;base64, " + objResponse);	
					const linkSource = `data:application/pdf;base64,${objResponse}`;
					const downloadLink = document.createElement("a");
					const fileName = strName + "_ticket.pdf";
					downloadLink.href = linkSource;
					downloadLink.download = fileName;
					downloadLink.click();
				}
			},
			error: function () {
				subSendNotification("Something is wrong,", 400)
			}
		});
	}

	//------------------------------------------------------------------------------------------------------------------
	$(".wfJobHref").click(function (e) {
		e.preventDefault();

		//debugger
		let url = $(this).attr("href");
		Cookies.remove("currentUrl");
		Cookies.set("currentUrl", window.location.href);

		window.location.href = url;
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#editJobWflwDueDate").click(function () {
		let strDueDate = $(this).data("strduetime");

		subGetDueDateLog(strDueDate);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("submit", ".jobWflwDueDateForm", function (event) {
		event.preventDefault();
		let formElement = $(this);

		$.ajax({
			type: "POST",
			url: "/Jobs/SetDueDate",
			data: {
				"intJobId": formElement.find("input[name=intJobId]").val(),
				"strDueDate": formElement.find("#strDueDate").val().split(" ")[0],
				"strDueTime": formElement.find("#strDueDate").val().split(" ")[1] + ":00",
				"strDescription": formElement.find("input[name=strDescription]").val()
			},
			beforeSend: function () {
				disableElements();
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					subGetDueDateLog(formElement.find("#strDueDate").val())
				}
				else {
					enableElements();
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				enableElements();
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#costSummaryBtn").click(function () {
		let intJobId = $("#strJobId").val();
		let intPkWorkflow = $("#intPkWorkflow").val();
		$("#generalPorpousesModalTitle").html("Costs");

		$.ajax({
			type: "GET",
			url: "/Jobs/GetProcessCostEstimateAndFinalFromJob",
			data: {
				"intJobId": intJobId,
				"intPkWorkflow": intPkWorkflow
			},
			success: function (objResponse) {
				if (
					typeof objResponse == 'object'
				) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
				else {
					subShowModal("Costs", objResponse, "modal-md", null, true, false);
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".finalCostModal").click(function () {
		let intPkProcessInWorkflow = $(this).data("intpkprocessinworkflow");
		let strName = $(this).data("strname");

		$("#generalPorpousesModalTitle").html(strName);
		subGetProcessesAndResourcesCosts(intPkProcessInWorkflow);
	})

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("submit", ".UpdateCostOrQuantity", function (event) {
		event.preventDefault();
		let intPkProcessInWorkflow = $(this).find("input[name=intPkProcessInWorkflow]").val();

		$.ajax({
			type: "POST",
			url: "/Jobs/UpdateCostOrQuantity",
			data: $(this).find(':input:not([readonly])').serialize(),
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					subGetProcessesAndResourcesCosts(intPkProcessInWorkflow);
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".viewHistory", function () {
		let intPkFinal = $(this).data("intpkfinal");
		let strCalculationType = $(this).data("strcalculationtype");
		let boolIsBase = $(this).data("boolisbase");
		let formElement = $(this).parent().parent().clone();

		$.ajax({
			type: "GET",
			url: "/Jobs/GetProcessFinalCostLog",
			data: {
				"intPkFinal": intPkFinal,
				"strCalculationType": strCalculationType,
				"boolIsBase": boolIsBase,
			},
			beforeSend: function () {
				$("#costHistorySection").html("");
			},
			success: function (objResponse) {
				if (
					typeof objResponse == 'object'
				) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
				else {
					//formElement.find("input").attr("disabled", true);
					//formElement.find("button").remove();
					//formElement.removeClass("border-bottom");
					//formElement.find(".costDescriptionDiv").remove();
					//$("#costHistorySection").append(formElement);
					$("#costHistorySection").append("<div class='row'><div class='col-sm-12'>"
						+ "<button class='btn btn-secondary btn-sm pull-right' id='backToFinalCostSection'>"
						+ "<span class='fa fa-angle-left'></span> Back</button></div></div>");
					$("#costHistorySection").append(objResponse);
					$("#costHistorySection").prev().attr("hidden", true)
					$("#costHistorySection").removeAttr("hidden")
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#backToFinalCostSection", function () {
		$("#costHistorySection").html("");
		$("#costHistorySection").prev().removeAttr("hidden");
		$("#costHistorySection").attr("hidden", true);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "input[name=numnFinalCost], input[name=numnFinalQuantity]", function () {
		let formElement = null
		let strElementName = $(this).attr("name");
		formElement = $(this).closest("form");

		if (strElementName == "numnFinalCost") {
			formElement.find("input[name=numnFinalQuantity]").prop("readonly", true);
		}
		else {
			formElement.find("input[name=numnFinalCost]").prop("readonly", true);
		}

		$(this).removeAttr("readonly");
		formElement.find("button[type=submit]").removeAttr("disabled");

	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".showPriceLog", function () {
		let numPrice = $(this).data("numactualprice");
		let intnCopyNumber = $(this).data("intncopynumber");
		let intPkWorkflow = $(this).attr("data-intPkWf-EstId").split("|")[0];
		let intnEstimationId = $(this).attr("data-intPkWf-EstId").split("|")[1] == ""
			? null : $(this).attr("data-intPkWf-EstId").split("|")[1];

		subGetJobPriceLog(numPrice, intPkWorkflow, intnEstimationId, intnCopyNumber);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".btnConfirmResource").click(function () {
		$.ajax({
			type: "POST",
			url: "/Jobs/ConfirmResourceAutomaticallySet",
			data: $(this).parent().serialize(),
			beforeSend: function () {
				disableElements();
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					location.reload();
				}
				else {
					enableElements();
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
				enableElements();
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", "#strTypeTemplateAndResourceI", function () {
		let intnPkEleetOrEleele = $(this).find(':selected').data("intnpkeleetoreleele");
		let boolIsEleet = $(this).find(':selected').data("booliseleet");
		let strUnit = $(this).find(':selected').data("strunit");
		let intnPkResource = $(this).find(':selected').data("intnpkresource");

		//													//Set new unit on input.
		$("#strTypeTemplateAndResourceILabel").html(strUnit);

		$("#transform-calculation-form").find("input[name=boolIsEleetI]").val(boolIsEleet);
		$("#transform-calculation-form").find("input[name=intPkEleetOrEleeleI]").val(intnPkEleetOrEleele);
		$("#transform-calculation-form").find("input[name=intPkResourceI]").val(intnPkResource);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".showQuantityInfo", function () {
		let arrdata = $(this).attr("data-io").split("|");
		$.ajax({
			type: "GET",
			url: "/Jobs/GetResourceWaste",
			data: {
				"intPkProcessInWorkflow_I": arrdata[0],
				"intPkEleetOrEleele_I": arrdata[1],
				"boolIsEleet_I": JSON.parse(arrdata[2].toLowerCase())
			},
			success: function (jobwfmodel) {
				if (
					jobwfmodel != null
				) {
					$("#modalResourceQuantity").modal("show");
					$(".modal-title").text(jobwfmodel.strResource + " Quantities");

					$(".tabWasteBody").children().remove();

					$.each(jobwfmodel.darrwstmodel, function (intIndex, wstmodel) {
						let strWasteToPropagate = "-";
						if (wstmodel.numnWasteToPropagate != null) {
							strWasteToPropagate = wstmodel.numnWasteToPropagate;
						}

						$(".tabWasteBody").append("<tr><td>" + wstmodel.numInitial + "</td><td>" + wstmodel.numWaste +
							"</td><td>" + wstmodel.numTotal + "</td><td>" + strWasteToPropagate +
							"</td><td>" + wstmodel.strUnitPropagate + "</td><td>" + wstmodel.strTarget + "</td></tr>");
					});

					$(".tabWasteAdditionalBody").children().remove();

					$.each(jobwfmodel.darrwstaddmodel, function (intIndex, wstaddmodel) {

						$(".tabWasteAdditionalBody").append("<tr><td>" + wstaddmodel.numWasteAdditional +
							"</td><td>" + wstaddmodel.strSource + "</td></tr>");
					});
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400)
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".showJobWfTips", function () {
		let intJobId = $(this).attr("data-intjobid");
		let intPkWorkflow = $(this).attr("data-intPk");
		$('#jobwfTipsModal').modal('show');

		$.ajax({
			type: "GET",
			url: "/Jobs/GetJobWorkflowInformation",
			data: { "intjobId": intJobId, "intPkWorkflow": intPkWorkflow },
			dataType: "html",
			success: function (response) {
				let jsonResponse = JSON.parse(response)
				if (jsonResponse.intStatus == 200) {
					let arrstrTips = jsonResponse.objResponse.strTips.split("|");

					let strList = "";

					for (var i = 0; i < arrstrTips.length; i++) {
						if (arrstrTips[i] != "") {
							strList = strList + "<li>" + arrstrTips[i] + "</li>"
						}
					}

					$(".jobwfTipsBody").html("<ul style='list-style-type: none'>" + strList + "</ul>");
					$('#jobwfTipsModal').modal('show');
				}
				else {
					subSendNotification("Something is wrong.", 400);
				}
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".openMovements", function () {
		let intJobId = $(this).parent().parent().attr("id").split('_')[1];

		$.ajax({
			type: "GET",
			url: "/Jobs/GetJobMovements",
			data: {
				"intJobId": intJobId
			},
			dataType: "html",
			success: function (response) {
				$("#movementsModalBody").html(response)
				$("#movementsModal").modal("show")
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".openFilesModal", function () {
		let intJobId = $(this).attr("data-jobId");

		$.ajax({
			type: "GET",
			url: "/Jobs/GetJobFilesUrl",
			data: { "intJobId": intJobId },
			dataType: "html",
			success: function (htmlResponse) {
				//console.log(response)
				subShowModal("Job Files", htmlResponse, "modal-md", "autoHeight", true, false);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("submit", "#workInProgressStatusForm", function (event) {
		event.preventDefault();
		let jsonFormData = $("#workInProgressStatusForm").serialize();
		let objData = subConvertSerializeDataToJson(jsonFormData);


		let funUpdateWorkInProgressStatus = function () {
			objData["boolSendEmail"] = boolSendEmail;
			$.ajax({
				type: "POST",
				url: "/Jobs/UpdateWorkInProgressStatus",
				data: objData,
				success: function (objResponse) {
					boolSendEmail = false;
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				},
				error: function () {
					boolSendEmail = false;
					subSendNotification("Something is wrong.", 400);
				}
			});
		};

		funShowEmailDialog("Updated stage information has been saved.<br />" +
			"Would you like to send an email to your customer?", funUpdateWorkInProgressStatus);

	});

	//------------------------------------------------------------------------------------------------------------------
	//															//SUPPORT METHODS.

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function subGetDueDateLog(strDueDate) {
		$.ajax({
			post: "GET",
			url: "/Jobs/GetDueDateLog",
			data: {
				"intJobId": $("#strJobId").val(),
				"strDueDate": strDueDate
			},
			success: function (objResponse) {
				if (
					typeof objResponse != 'object'
				) {
					$("#generalPorpousesModalBody").html(objResponse);
					$("#generalPorpousesModalTitle").html("Due Date Log");
					$("#generalPorpousesModal").modal("show");

					$('#strDueDate').datetimepicker({
						format: "YYYY-MM-DD HH:mm"
					});
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		})
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function subGetJobPriceLog(
		numPrice,
		intPkWorkflow,
		intnEstimationId,
		intnCopyNumber
	) {
		$.ajax({
			post: "GET",
			url: "/Jobs/GetPriceLog",
			data: {
				"intJobId": $("#strJobId").val(),
				"numPrice": numPrice,
				"intPkWorkflow": intPkWorkflow,
				"intnEstimationId": intnEstimationId,
				"intnCopyNumber": intnCopyNumber
			},
			success: function (objResponse) {
				if (
					typeof objResponse != 'object'
				) {
					$("#generalPorpousesModalBody").html(objResponse);
					$("#generalPorpousesModalTitle").html("Price Log");
					$("#generalPorpousesModal").modal("show");
				}
				else {
					subSendNotification("Something is wrong.", 400);
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		})
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function subGetProcessesAndResourcesCosts(intPkProcessInWorkflow) {
		$.ajax({
			type: "GET",
			url: "/Jobs/GetProcessFinalCostData",
			data: {
				"intPkProcessInWorkflow": intPkProcessInWorkflow,
				"intPkProduct": $("#intPkProduct").val(),
				"intJobId": $("#strJobId").val()
			},
			success: function (objResponse) {
				if (
					typeof objResponse == 'object'
				) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
				else {
					$("#generalPorpousesModalBody").html(objResponse);
					$("#generalPorpousesModalTitle").html("Costs");
					$('#generalPorpousesModal').modal('show');
				}
			},
			error: function () {

			}
		});
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function subSetJobPrice(
		objData,
		intnCopyNumber
	) {
		let deserializeObj = subConvertSerializeDataToJson(objData);
		let boolIsEstimate = JSON.parse($("#boolIsEstimate").val() ?? null);

		$.ajax({
			type: "GET",
			url: "/Jobs/SetPriceForAJob",
			data: objData,
			dataType: "html",
			beforeSend: function () {
				//$(".content").fadeOut(300);
				disableElements()
			},
			success: function (response) {
				boolSendEmail = false;
				let json = JSON.parse(response);
				if (json.intStatus == 200) {
					subGetJobPriceLog(deserializeObj.numPrice, deserializeObj.intPkWorkflow,
						deserializeObj.intnEstimateId, intnCopyNumber);
				}

				subSendNotification(json.strUserMessage, json.intStatus);
			}
		});
	}
});

