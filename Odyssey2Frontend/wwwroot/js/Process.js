
$(document).ready(function () {

	//---------------------------------------------------------------------------------------------------------------------
	$(".myProcessBody").ready(function () {
		let processSelected = Cookies.get("processSelected");
		if (processSelected != null) {
			$(".backToWorkflow").css("display", "block");
			let processCollapseLink = $(".process-collapse-link");
			processCollapseLink.each(function (index, value) {
				//debugger
				let elementId = value.id;
				let strProcess = $("#" + elementId).attr("data-strtypeid-text");
				if (strProcess == processSelected) {
					$("#" + elementId).click();
					Cookies.remove('processSelected');
					return false;
				}
			});
        }
        let currentWorkflowUrl = Cookies.get("currentWorkflowUrl");
        if (currentWorkflowUrl == null) {
            $(".goToProcessOrWf").attr("href", "javascript: history.back()");
        }
        else {
            $(".goToProcessOrWf").attr("href", currentWorkflowUrl);
        }
        Cookies.remove("currentWorkflowUrl");
	});

	//---------------------------------------------------------------------------------------------------------------------
	$(".backToWorkflow").click(function () {
		//debugger
		let queryUrl = Cookies.get("queryUrl");
		Cookies.remove("queryUrl");
		Cookies.remove("processSelected");
		$(location).attr('href', "/Workflow" + queryUrl);
	});

	//---------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".process-type-radio", function () {

		$("#add-new-process-next-btn").prop("hidden", true);
		if (
			$("input[name='intPkTypeRadio']:checked").length > 0
		) {
			$("#add-new-process-next-btn").prop("hidden", false);
		}
	});

	//---------------------------------------------------------------------------------------------------------------------
	$("#add-new-process-next-btn").click(function () {
		let intPkType = $("input[name='intPkTypeRadio']:checked").val();
		let strTypeId = $("input[name='intPkTypeRadio']:checked").data("strtypeid");
		$("#process-modal-title").html("Add " + strTypeId + "  Process")

		$("#intPkType").val(intPkType);
		let htmlElement = $("#intPkType");

		$("#xjdf-radio-section").prop("hidden", true);
		$("#xjdf-instance-section").prop("hidden", false);
		$("#xjdf-process-filter").prop("hidden", true);

		$("#add-new-process-next-btn").prop("hidden", true);
		$("#add-new-process-back-btn").prop("hidden", false);
	});

	//---------------------------------------------------------------------------------------------------------------------
	$("#add-new-process-back-btn").click(function () {
		$("#process-modal-title").html("Add Process");

		$("#xjdf-radio-section").prop("hidden", false);
		$("#xjdf-instance-section").prop("hidden", true);
		$("#xjdf-process-filter").prop("hidden", false);

		$("#add-new-process-next-btn").prop("hidden", false);
		$("#add-new-process-back-btn").prop("hidden", true);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("submit", "#add-new-process-instance-form", function (event) {
		event.preventDefault();
		let strFromPageProcessElement = $(this).data("page-process-element");

		$.ajax({
			type: "POST",
			url: "/PrintshopTemplate/Add",
			data: $(this).serialize(),
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					if (
						strFromPageProcessElement == undefined || strFromPageProcessElement.length == 0
					) {
						$("#process-modal-title").html("Add Process");

						$("#xjdf-radio-section").prop("hidden", false);
						$("#xjdf-instance-section").prop("hidden", true);
						$("#xjdf-process-filter").prop("hidden", false);

						$("#add-new-process-next-btn").prop("hidden", true);
						$("#add-new-process-back-btn").prop("hidden", true);
					}

					$("#add-new-process-instance-form")[0].reset();
				}
				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//---------------------------------------------------------------------------------------------------------------------
	$(".deleteProcess").click(function () {
		let strTypeId = $(this).data("strtypeid-text").replace(/ /g, "_");
		let intPk = $(this).val();
		debugger
		ProcessIsDispensable(intPk);
	});

	//---------------------------------------------------------------------------------------------------------------------
	$('#xjdfTemplateModal').on('hidden.bs.modal', function () {
		location.reload();
	});

	//------------------------------------------------------------------------------------------------------------------
	$("input[name=Source_from]").change(function () {
		var items = null;
		var className;
		var form;
		var elementId;
		var intPkProcess;
		if ($(this).is(":checked")) {
			var val = $(this).val();
			className = $(this).attr("class");
			form = className.replace("radio", "form");
			elementId = className.replace("radio_", "");
			intPkProcess = $("#" + form).find("#intPkProcess").val();
			if (val == "my") {
				items = GetPrintshopXJDFResources("Resource");
				$("#" + form).find(".strInputOrOutput_" + elementId).css('pointer-events', 'auto');
			}
			else {
				items = GetProcessSuggestedResources(intPkProcess);
				$("#" + form).find(".strInputOrOutput_" + elementId).css('pointer-events', 'none');
			}
		}

		if (items.length > 0) {
			var selectList = document.createElement("select");
			selectList.id = "intPkResource";
			selectList.name = "intPkResource";
			selectList.className = "form-control intent-select intPkResource_" + elementId;
			selectList.onchange = function () { ValidateUsage(intPkProcess, $("#" + form).find("." + className.replace("radio", "intPkResource")).val(), elementId); }

			var option = document.createElement("option");
			option.value = "";
			option.text = "Pick one";
			selectList.appendChild(option);

			for (var i = 0; i < items.length; i++) {
				var obj = items[i];
				option = document.createElement("option");
				option.value = obj.intPk;
				option.text = obj.strTemplateId;
				selectList.appendChild(option);
			}

			$("#" + form).find("#" + className.replace("radio", "myResources")).html(selectList);
			$("#" + form).find("#add_" + elementId).prop("disabled", false);
		}
		else {
			$("#" + form).find("#" + className.replace("radio", "myResources")).html('<div class="alert alert-warning">Empty list</div>');
			$("#" + form).find("#add_" + elementId).prop("disabled", true);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".form-process-resources").submit(function (event) {
		event.preventDefault();
		let formElement = $(this);
		let strType = $(this).data("strtypeid-text").replace(/ /g, "_");
		var intPkProcess = $(this).find("input[name=intPkProcess]").val();
		var intPkTypeOrTemp = $(this).find("#intPkTypeOrTemp").val().split('|');

		let intnPkTemplate = intPkTypeOrTemp[0];
		let intnPkType = null;
		if (
			intPkTypeOrTemp[1] == "true"
			)
		{
			intnPkTemplate = null;
			intnPkType = intPkTypeOrTemp[0];
		}

		let data = {
			"intPkProcess": intPkProcess,
			"intnPkType": intnPkType,
			"intnPkTemplate": intnPkTemplate,
			"strInputOrOutput": formElement.find('input[name=resourceType]:checked').val()
		}

		$.ajax({
			type: "GET",
			url: "/PrintshopTemplate/IsModifiable",
			data: data,
			success: function (jsonResponse) {
				/*CASE*/
				if (
					//										//Process modifiable, it is not necessary to consult with 
					//										//		the user.
					(jsonResponse.intStatus == 200) &&
					(jsonResponse.objResponse == true)
					)
				{
					funAddInputOrOutput(formElement, data, strType);
				}
				else if (
					//										//Process not modifiable, it is necessary to ask what to 
					//										//		do to the user.
					(jsonResponse.intStatus == 200) &&
					(jsonResponse.objResponse == false)
					)
				{
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
						funAddInputOrOutput(formElement, data, strType);
						$("#confirmation-modal").modal('hide');
					});

					//										//Abort modification.
					$("#modal-btn-no").bind("click", function () {
						$("#confirmation-modal").modal('hide');
					});
				}
				else
				{
					//										//Invalid data.
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				}
				/*EN-CASE*/
			},
			error: function ()
			{
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funAddInputOrOutput(
		formElement_I,
		data_I,
		strType_I
		)
	{
		$.ajax({
			type: "POST",
			url: formElement_I.attr("action"),
			data: data_I,
			dataType: "html",
			success: function (strResponse)
			{
				let objResponse = JSON.parse(strResponse);
				if (
					objResponse.intStatus == 200
					)
				{
					GetPrintshopProcessWithTypesAndTemplates(objResponse.objResponse, strType_I);
					formElement_I[0].reset();
					formElement_I.find("input[name=resourceType]").prop("disabled", false);

					$("input." + strType_I).val(objResponse.objResponse);
					$("button." + strType_I).val(objResponse.objResponse);
					$("a." + strType_I).attr("id", objResponse.objResponse);
				}
				else
				{
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			},
			error: function ()
			{
				subSendNotification("Something is wrong.", 400);
			}
		});
    }

	//------------------------------------------------------------------------------------------------------------------
	$(".addProcessDefaultCalculation").click(function () {
		let strType = $(this).data("strtypeid");
		let intPkProcessType = $("#intPkType").val();
		let strProcessTypeId = $("#strTypeId").val();
		let intPkProcess = $(this).val();
		let strProcessName = $(this).data("strtypeid");
		debugger
		//													//Disable the inputs.
		$(".intPkProcessType").css("pointer-events", "none");
		$(".intnPkProcess").css("pointer-events", "none");
		$(".intPkProcessType").css("background", "#dddddd");
		$(".intnPkProcess").css("background", "#dddddd");

		//													//Set values in the inputs.
		$(".intPkProcessType").html("");
		$(".intPkProcessType").val(intPkProcessType);
		$(".intPkProcessType").append("<option value='All' selected>All</option>");
		$(".intPkProcessType").append("<option value='" + intPkProcessType + "' selected>" + strProcessTypeId + "</option>")

		//													//Set the option on the dropdown.
		$('.intnPkProcess option:selected').removeAttr("selected");
		$(".intnPkProcess").val(intPkProcess);

	});

	//------------------------------------------------------------------------------------------------------------------
	$('#defaulCalculationModal').on('hidden.bs.modal', function () {
		$(".panel-collapse").collapse("hide");
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#classification-process-select").change(function () {
		//
		$(".checkbox").hide();

		if ($(this).val() != "All") {
			$("." + $(this).val()).show();
			$("." + $(this).val()).removeAttr("hidden");
		}
		else {
			$(".checkbox").each(function (index, value) {
				$(value).show();
				$(value).removeAttr("hidden");
			});
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".addProcessTemplate").click(function () {
		let strType = $(this).val();

		$("#addXJDFProcessSection, #addCustomProcessSection").attr("hidden", "true");

		if (strType == "xjdf") {
			$("#addXJDFProcessSection").removeAttr("hidden");
			$("#process-modal-title").html("Add Process");
		}
		else {
			$("#addCustomProcessSection").removeAttr("hidden");
			$("#process-modal-title").html("Add Custom Process");
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#addCustomProcessForm").submit(function (event) {
		event.preventDefault();
		let formElement = $(this);
		let strMessage = '<br /><div class="alert alert-danger text-center">Invalid data.</div >';
		let submitButtonElement = formElement.children("button");
		submitButtonElement.prop("disabled", true);

		$.ajax({
			type: "POST",
			url: formElement.attr("action"),
			data: formElement.serialize(),
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {
					formElement[0].reset();
				}

				submitButtonElement.prop("disabled", false);
				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				submitButtonElement.prop("disabled", false);
				subSendNotification("Something is wrong.", 400);
			}
		});
	})

	//------------------------------------------------------------------------------------------------------------------
	$('.dropdown-process-filter').on('click', function (e) {
		e.stopPropagation();
	});

	//------------------------------------------------------------------------------------------------------------------
	$('.process-filter-btn').on('click', function () {
		let selectList = $(this).parent().parent().parent().parent().parent().next().find("select");
		let filterSectionElement = $(this).parent().parent().parent();
		let arrcheckboxElements = filterSectionElement.find("input");

		selectList.html("");
		$("<option />").val("").text("Pick one").appendTo(selectList);

		$.ajax({
			type: "GET",
			url: "../PrintshopTemplate/GetTypeOrTempFromFilter",
			data: arrcheckboxElements.serialize(),
			dataType: "html",
			success: function (response) {
				var json = JSON.parse(response);
				$.each(json, function (key, value) {
					let strDropdownOptionValue = value.intPk + '|' + value.boolIsType;

					if (
						filterSectionElement.find("input[name='boolIsSuggested']").prop("checked") == true
					) {
						strDropdownOptionValue = strDropdownOptionValue + "|" + value.strUsage;
					}

					$("<option />").val(strDropdownOptionValue).text(value.strTypeId).appendTo(selectList);
				});

				filterSectionElement.parent().find(".dropdown").removeClass("show");
				filterSectionElement.before().find("#process-filter-dropdown").attr("aria-expanded", false);
				filterSectionElement.removeClass("show");
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".intPkTypeOrTemp").change(function () {
		let arrstrDropDawnValue = $(this).val().split('|');
		let checkboxSection = $(this).parent().parent().parent().parent();

		checkboxSection.find("input[name=resourceType]").prop("disabled", false);
		if (
			arrstrDropDawnValue.length == 3
		) {
			let strIO = "Input";
			let strNonIO = "Output";
			if (
				arrstrDropDawnValue[arrstrDropDawnValue.length - 1] === "Output"
			) {
				strIO = "Output";
				strNonIO = "Input";
			}
			checkboxSection.find("input[name=resourceType][value='"+ strNonIO + "']").prop("checked", false);
			checkboxSection.find("input[name=resourceType][value='" + strNonIO + "']").prop("disabled", true);
			checkboxSection.find("input[name=resourceType][value='" + strIO + "']").prop("disabled", false);
			checkboxSection.find("input[name=resourceType][value='"+ strIO + "']").prop("checked", true);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".process-collapse-link").click(function () {
		let strTypeId = $(this).data("strtypeid-text").replace(/ /g, "_");
		let intPkProcess = $("#" + strTypeId).val();

		GetPrintshopProcessWithTypesAndTemplates(intPkProcess, strTypeId);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".form-custom-resources").submit(function (event) {
		event.preventDefault();
		let formElement = $(this);
		var form = $(this).serialize();
		let strType = $(this).data("strtypeid-text").replace(/ /g, "_");

		$.ajax({
			type: "POST",
			url: formElement.attr("action"),
			data: form,
			dataType: "html",
			success: function (strResponse) {
				let objResponse = JSON.parse(strResponse)
				if (
					objResponse.intStatus == 200
				) {
					GetPrintshopProcessWithTypesAndTemplates(objResponse.objResponse, strType);

					$("input." + strType_I).val(objResponse.objResponse);
					$("button." + strType_I).val(objResponse.objResponse);
					$("a." + strType_I).attr("id", objResponse.objResponse);
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus)
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400)
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".physical-checkbox, .type-template-checkbox").click(function () {
		let arrElementClassNames = $(this).attr("class").split(' ');
		let strElementClassName = arrElementClassNames[arrElementClassNames.length - 1];

		let dropdownElement = $(this).parent().parent().parent().parent().parent();
		let arrCheckedElements = dropdownElement.find("." + strElementClassName + ":checked");

		if (arrCheckedElements.length == 0) {
			if (
				(strElementClassName == "physical-checkbox")
			) {
				if ($(this).attr("name") == "boolIsPhysical") {
					dropdownElement.find("input[name = 'boolIsNotPhysical']").prop("checked", true);
				}
				else {
					dropdownElement.find("input[name = 'boolIsPhysical']").prop("checked", true);
				}
			}
			else {
				if ($(this).attr("name") == "boolIsType") {
					dropdownElement.find("input[name = 'boolIsTemplate']").prop("checked", true);
				}
				else {
					dropdownElement.find("input[name = 'boolIsType']").prop("checked", true);;
				}
			}
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".delete-resource", function (event) {
		event.preventDefault();
		let strType = $(this).data("strtypeid-text").replace(/ /g, "_");
		let arrValues = $(this).attr("id").split('|');

		$.ajax({
			type: "GET",
			url: "../PrintshopTemplate/InputOrOutputIsDispensable",
			data: {
				"intPk": arrValues[0],
				"intPkEleetOrEleele": arrValues[1],
				"boolIsEleet": arrValues[2]
			},
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {
					if (objResponse.objResponse == false) {
						$("#confirmation-modal").modal('show');
                        $("#myModalBody").html("<b>" + objResponse.strUserMessage + "</b>" +
                            "<br/> Delete anyway?")

						$("#modal-btn-yes").unbind();
						$("#modal-btn-yes").css('display', '');

						$("#modal-btn-no").unbind();
						$("#modal-btn-no").css('display', '');

						$("#modal-btn-yes").bind("click", function () {
							subDeleteResourceFromProcess(arrValues[1], arrValues[2], strType);
							$("#confirmation-modal").modal('hide');
						});

						$("#modal-btn-no").bind("click", function () {
							$("#confirmation-modal").modal('hide');
						});
					}
					else {
						subDeleteResourceFromProcess(arrValues[1], arrValues[2], strType);
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
	$(".editProcessName").click(function () {
		let elementParent = $(this).parent().parent();
		
		elementParent.children("div").attr("hidden", true);
		elementParent.find("form").removeAttr("hidden");
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".cancelEditProcessName").click(function () {
		let elementParent = $(this).closest("form").parent();

		elementParent.children("div").removeAttr("hidden");
		elementParent.find("form").attr("hidden", true);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".saveNewProcessName").submit(function (event) {
		event.preventDefault();
		let elementParent = $(this).parent();
		let elementForm = $(this);

		$.ajax({
			type: "POST",
			url: "/PrintshopTemplate/EditName",
			data: elementForm.serialize(),
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {
					elementParent.children("div").removeAttr("hidden");
					elementParent.find("form").attr("hidden", true);

					elementParent.find("div").find("a").html(elementForm.find("input[name=strProcessName]").val());
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

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function GetPrintshopProcessWithTypesAndTemplates(intPk, strTypeId) {
	$.ajax({
		type: "GET",
		url: "../PrintshopTemplate/GetPrintshopProcessWithTypesAndTemplates",
		data:
		{
			'intPk': intPk,
		},
		dataType: "html",
		success: function (strResponse) {
			let objResponse = JSON.parse(strResponse);
			if (
				objResponse.intStatus == 200
			) {
				var arrresInput = objResponse.objResponse.arrrestyportemInput;
				var strInputHtml = "";
				for (var i = 0; i < arrresInput.length; i++) {
					var obj = arrresInput[i];
					strInputHtml = strInputHtml + '<div class="col-sm-12">' + obj.strTypeOrTemplate +
						' <a class="fa fa-trash-o delete-resource pull-right p-1" id="' + intPk + '|' +
						obj.intPkEleetOrEleele + '|' + obj.boolIsEleet + '" href="#" data-strTypeId-text="' +
						strTypeId + '"></a></div>';
				}
				$("#input_" + strTypeId).html(strInputHtml);

				var arrresOutput = objResponse.objResponse.arrrestyportemOutput;
				var strOutputHtml = "";
				for (var i = 0; i < arrresOutput.length; i++) {
					var obj = arrresOutput[i];
					strOutputHtml = strOutputHtml + '<div class="col-sm-12">' + obj.strTypeOrTemplate +
						' <a class="fa fa-trash-o delete-resource pull-right p-1" id="' + intPk + '|' +
						obj.intPkEleetOrEleele + '|' + obj.boolIsEleet + '" href="#" data-strTypeId-text="' +
						strTypeId + '"></a></div>';
				}
				$("#output_" + strTypeId).html(strOutputHtml);
			}
			else {
				subSendNotification(objResponse.strUserMessage, objResponse.strUserMessage);
			}
		},
		error: function () {
			subSendNotification("Something wronasdg.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function GetPrintshopXJDFResources(strResOrPro) {
	var items = $.ajax({
		type: "GET",
		url: "../PrintshopTemplate/GetPrintshopXJDFResources",
		data:
		{
			'strResOrPro': strResOrPro
		},
		dataType: "html",
		async: false
	});

	return JSON.parse(items.responseText);
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function GetProcessSuggestedResources(intPk) {
	var items = $.ajax({
		type: "GET",
		url: "../PrintshopTemplate/GetProcessSuggestedResources",
		data:
		{
			'intPk': intPk
		},
		dataType: "html",
		async: false
	});

	return JSON.parse(items.responseText);
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function ValidateUsage(intPkProcess, intPkSuggested, elementId) {
	$.ajax({
		type: "GET",
		url: "../PrintshopTemplate/ValidateUsage",
		data: { 'intPk': intPkProcess, 'intPkSuggested': intPkSuggested },
		dataType: "html",
		success: function (response) {
			if (response != "") {
				$("#form_" + elementId).find(".strInputOrOutput_" + elementId).val(response);
				$("#form_" + elementId).find(".strInputOrOutput_" + elementId).css('pointer-events', 'none');
			}
			else {
				$("#form_" + elementId).find(".strInputOrOutput_" + elementId).val("");
				$("#form_" + elementId).find(".strInputOrOutput_" + elementId).css('pointer-events', 'auto');
			}
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function ProcessIsDispensable(intPk) {
	$.ajax({
		type: "POST",
		url: "/PrintshopTemplate/IsDispensable",
		data:
		{
			"intPk": intPk
		},
		success: function (objResponse) {
			debugger
			if (!objResponse.objResponse) {
				$("#confirmation-modal").modal('show');
				$("#myModalBody").html("<b>" + objResponse.strUserMessage + "</b>" +
					"<br/> Delete anyway?")

				$("#modal-btn-yes").unbind();
				$("#modal-btn-yes").css('display', '');

				$("#modal-btn-no").unbind();
				$("#modal-btn-no").css('display', '');

				$("#modal-btn-yes").bind("click", function () {
					deleteProcess(intPk);
					$("#confirmation-modal").modal('hide');
				});

				$("#modal-btn-no").bind("click", function () {
					$("#confirmation-modal").modal('hide');
					checkboxElement.prop("checked", true);
				});
			}
			else {
				deleteProcess(intPk);
			}
		},
		error: function () {
			subSendNotification("Something is wrong", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function deleteProcess(intPkProcess) {
	$.ajax({
		type: "POST",
		url: "../PrintshopTemplate/DeleteProcessFromPrintshop",
		data: { 'intPkProcess': intPkProcess },
		dataType: "html",
		success: function (response) {
			debugger
			let jsonResponse = JSON.parse(response);
			if (jsonResponse.intStatus == 200) {
				location.reload();
			}
			else {
				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
			}
		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subDeleteResourceFromProcess(intPkEtetOrEtel, boolIsEtet, strType_I) {
	$.ajax({
		type: "POST",
		url: "/PrintShopTemplate/DeleteTypeOrTemplate",
		data: {
			"intPkEleetOrEleele": intPkEtetOrEtel,
			"boolIsEleet": boolIsEtet
		},
		success: function (objResponse) {
			if (objResponse.intStatus == 200) {
				GetPrintshopProcessWithTypesAndTemplates(objResponse.objResponse, strType_I);

				$("input." + strType_I).val(objResponse.objResponse);
				$("button." + strType_I).val(objResponse.objResponse);
				$("a." + strType_I).attr("id", objResponse.objResponse);
			}

			subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
		}
	});
}