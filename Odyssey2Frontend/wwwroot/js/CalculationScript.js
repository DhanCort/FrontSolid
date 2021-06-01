let boolByProcess = false;
let boolByIntent = false;
let boolByResource = false;
let boolnByTime = false;
let strOrderFormValue = null;
let strSelectedValue = null;
let arrintPkSelectedvalue = null;
let intPkSelectedResource = null;
let intPkSelectedProcess = null;
let intPkSelectedResourceElement = null;
let hiddenColumns = null;
let intLastPkProcessInWorkflow = null;

//----------------------------------------------------------------------------------------------------------------------
//															//TRANSFORMATION METHODS.

$(document).ready(function () {
	hiddenColumns = null;

	//------------------------------------------------------------------------------------------------------------------
	$("#addCalculationsBody").ready(function () {
		subSetResourceOnForm();
	});

	//------------------------------------------------------------------------------------------------------------------
	$('.attribute-Order-Form').change(function () {
		let intPkAttribute = $(this).val();
		let element = $(this).closest("div").next().find("select");

		element.html("");

		if (!/[^0-9]|\./.test(intPkAttribute)) {
			GetValuesOrderForm(intPkAttribute, element);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#newCostBtn").click(function () {
		$(".addNewCalculation").find("button").click();
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".addNewCalculation").submit(function (event) {
		event.preventDefault();
		debugger
		//													//Get th condition to apply and is saved in the hidden
		//													//		input.
		let conditionToApplyObject = funCreateObject();
		$("#strConditionToApply").val(JSON.stringify(conditionToApplyObject));

		//													//Get th url to save the calculation and the data from the 
		//													//		the form.
		let strAction = $(this).attr("action");
		let strSerializedData = $(this).serialize();

		$.ajax({
			type: "POST",
			url: strAction,
			data: strSerializedData,
			success: function (jsonObject) {
				if (
					jsonObject.intStatus == 200
				) {
					location.href = $("#strUrlForRedirection").val();
				}
				else {
					subSendNotification("Something is wrong.", 400);
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".calculationStatus", function () {
		let element = $(this).children().children();
		let boolEnabled = $(this).children().children().hasClass("on");
		let intPkCalculation = $(this).data("intpkcalculation");

		$.ajax({
			type: "POST",
			url: "/Calculation/UpdateStatus",
			data: {
				"intPkCalculation": intPkCalculation
			},
			success: function (jsonobj) {
				subSendNotification(jsonobj.strUserMessage, jsonobj.intStatus);
				if (
					jsonobj.intStatus != 200
				) {
					if (
						!boolEnabled
					) {
						element.addClass("on");
						element.closest(".genericSwitch").find("label").html("Enabled");
					}
					else {
						element.removeClass("on");
						element.closest(".genericSwitch").find("label").html("Disabled");
					}
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
				if (
					!boolEnabled
				) {
					element.addClass("on");
					element.closest(".genericSwitch").find("label").html("Enabled");
				}
				else {
					element.removeClass("on");
					element.closest(".genericSwitch").find("label").html("Disabled");
				}
			}
		});

		if (
			boolEnabled
		) {
			element.addClass("on");
			element.closest(".genericSwitch").find("label").html("Enabled");
		}
		else {
			element.removeClass("on");
			element.closest(".genericSwitch").find("label").html("Disabled");
		}
	});
	//------------------------------------------------------------------------------------------------------------------
	$("#baseCalculationRadio, #perQuantityCalculationRadio").change(function () {
		if (
			$(this).hasClass("base")
		) {
			$(this).parent().find(".form-control, input[name=strCalculationType]").prop("disabled", false);
			$(this).parent().next().find(".form-control, input[name=strCalculationType]").prop("disabled", true)
			$(".perQuantity").prop("disabled", true);
		}
		else {
			$(this).parent().find(".form-control, input[name=strCalculationType]").prop("disabled", false);
			$(this).parent().prev().find(".form-control, input[name=strCalculationType]").prop("disabled", true);
			$(".perQuantity").prop("disabled", false);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".add-calculation").submit(function (event) {
		event.preventDefault();

		let intnPkTrans = $("#ResourceForm").find("#intnPkTrans").val();
		let intnPkCalculation = $("#ResourceForm").find("#intPk").val();
		let quantityFromTemp = $("#ResourceForm").find("#intnPkResourceO").val()
		let neededTemp = $("#ResourceForm").find("#numnNeeded").val()
		let perUnitsTemp = $("#ResourceForm").find("#numnPerUnits").val()

		//													//Data for the update of section of calculations.
		let form = $(this);
		let intPkProduct = form.find("#intnPkProduct").val();
		let strBy = $(this).data("strby");
		let strCalculationType = $(this).data("strcalculationtype");
		let strHtmlSectionId = GetHtmlSection(strBy, strCalculationType);
		let intPkProcessType = $(this).find(".intPkProcessType").val()
		let intnPkProcess = $(this).find("#intnPkProcess").val();
		let intnPkResource = $("#intnPkResourceI").val();
		let intnPkResourceElement = $("#intnPkResourceElement").val();
		let eleElement = $(this);
		let strSerializedData = $(this).serialize();

		let formAction = "/Calculation/AddCalculation";
		if (strBy == "processTime") {
			formAction = "/Calculation/AddProcessTimeCalculation";
		}

		let numnMin = $(this).find("#numnMin").val();
		let numnBlock = $(this).find("#numnBlock").val();

		let strUnit = $(this).find("#strUnitI").val();

		if (
			(((neededTemp == "" || neededTemp == null || neededTemp == undefined) &&
				$("#ResourceForm").find("#numnNeeded").hasClass("readonly")) ||
				((perUnitsTemp == "" || perUnitsTemp == null || perUnitsTemp == undefined) &&
					$("#ResourceForm").find("#numnPerUnits").hasClass("readonly"))) &&
			(intnPkTrans == "" || intnPkTrans == undefined)
		) {
			subSendNotification("You need to add a Paper Transformation.", 300);
		}
		else {
			if (
				intnPkTrans == "" || intnPkTrans == undefined
			) {
				saveCalculation(form, intPkProduct, strBy, strCalculationType, strHtmlSectionId,
					intPkProcessType, intnPkProcess, intnPkResource, intnPkResourceElement,
					eleElement, strSerializedData, formAction, numnMin, numnBlock, strUnit)
			}
			else if (
				intnPkTrans != "" &&
				(quantityFromTemp == quantityFrom &&
					neededTemp == needed &&
					perUnitsTemp == perUnits
				)
			) {
				saveCalculation(form, intPkProduct, strBy, strCalculationType, strHtmlSectionId,
					intPkProcessType, intnPkProcess, intnPkResource, intnPkResourceElement,
					eleElement, strSerializedData, formAction, numnMin, numnBlock, strUnit)
			}
			else {
				$("#confirmation-modal").modal('show');
				$("#myModalBody").html('<b>If you change this information, the "Paper transformation" will be deleted. <br/> Continue?</b>')

				$("#modal-btn-yes").unbind();
				$("#modal-btn-yes").css('display', 'block');

				$("#modal-btn-no").unbind();
				$("#modal-btn-no").css('display', 'block');

				$("#modal-btn-yes").bind("click", function () {
					intPkPaTrans = intnPkTrans;
					intnPkCalcu = intnPkCalculation == "0" ? null : intnPkCalculation;
					boolFromClose = false;
					subDeleteTemporalPaperTransformation()



					$("#confirmation-modal").modal('hide');
				});

				$("#modal-btn-no").bind("click", function () {
					$("#ResourceForm").find("#intnPkResourceO").val(quantityFrom)
					$("#ResourceForm").find("#numnNeeded").val(needed)
					$("#ResourceForm").find("#numnPerUnits").val(perUnits)
					$("#confirmation-modal").modal('hide');
				});
			}
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".calculations", function () {
		if (
			$(this).children().attr("Class") == "fa fa-plus-circle"
		) {
			$(this).children().attr("Class", "fa fa-minus-circle");
			$(".collapsed").children().attr("Class", "fa fa-plus-circle");
		} else {
			$(this).children().attr("Class", "fa fa-plus-circle");
		}

		let elementClasses = $(this).attr("class").split(" ");
		let intnPkProduct = $("#intnPkProduct").val();
		let strBy = $(this).data("strby");
		let strCalculationType = $(this).data("strcalculationtype");
		let strHtmlSectionId = GetHtmlSection(strBy, strCalculationType);
		let intnJobId = $(this).data("intjobid");
		let intnPkWorkflow = $(this).data("intnpkworkflow");
		let hidebuttons = $(this).data("hidebuttons");
		let intnPkProcessInWorkflow = $(this).data("intnpkprocessinworkflow");

		let intnPkProcessOrResource = $("#intnPkProcess").val();
		intnPkResourceElement = null;
		if (strCalculationType.split("-")[0] == "ResourceDefaults") {
			intnPkProcessOrResource = $("#intnPkResource").val();
			intnPkResourceElement = $("#intnPkResourceElement").val();
			$("#intnPkResourceElement").removeAttr('required');
		}

		GetCalculationData(intnPkProduct, strCalculationType, strHtmlSectionId, $(this).data("boolnisworkflow"),
			intnJobId, intnPkWorkflow, hidebuttons, intnPkProcessInWorkflow);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".show-defaults").click(function () {
		let form = $(this).parent().parent().parent().parent().closest("form");
		let classes = $(this).attr("class").split(" ");

		let switch2 = $(this).find("#switch2");
		if (
			!(switch2.attr("class") === "switch on")
		) {
			$(this).find("#switch2").addClass("on");

			if (GetDefaultCalculations(form, classes)) {
				$("#" + classes[1] + "-table").css("display", "none");
				$("#" + classes[1] + "-table-default").css("display", "block");
			}
			else {
				$(this).find("#switch2").removeClass("on");
			}
		}
		else {
			$(this).find("#switch2").removeClass("on");
			$("#" + classes[1] + "-table").css("display", "block");
			$("#" + classes[1] + "-table-default").css("display", "none");
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on('click', '.delete-calculation', function (event) {
		event.preventDefault();
		let intPkCalculation = $(this).attr("id");
		let tableElement = $(this).closest('table');
		let tbodyElement = $(this).closest('tbody');
		let totalRows = $('tr', $(tableElement).find('tbody')).length - 1;

		if ($(this).attr("disabled") != "disabled") {
			$.ajax({
				type: "POST",
				url: "/Calculation/subDeleteCalculation",
				data:
				{
					'intPkCalculation': intPkCalculation
				},
				dataType: "html",
				success: function (response) {

					$("#row_" + intPkCalculation).remove();

					if (totalRows == 0) {
						tbodyElement.append('<tr><td colspan="15">This section contains no records.</td></tr>');
					}
				}
			});
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on('click', '.edit-calculation', function (e) {
		e.preventDefault();
		let arrclasses = $(this).attr("class").split(" ");
		let element = $(this);
		let form = element.closest("div").parent().parent().parent().prev();
		let strBy = form.data("strby");
		intLastPkProcessInWorkflow = form.find("#intnPkProcessInWorkflow").val();
		let intPk = element.attr("id");
		let boolIsInPostProcess = element.attr("data-boolisinpostprocess");

		objIOTemp = {
			"intnPkProduct": $("#ResourceForm").find("#intnPkProduct").val(),
			"strCalculationType": $("#ResourceForm").find("#strCalculationType").val(),
			"intPk": $("#ResourceForm").find("#intPk").val(),
			"intnPkProcessInWorkflow": $("#ResourceForm").find("#intnPkProcessInWorkflow").val(),
			"intnPkEleetOrEleeleI": $("#ResourceForm").find("#intnPkEleetOrEleeleI").val(),
			"boolnIsEleetI": $("#ResourceForm").find("#boolnIsEleetI").val(),
			"intnPkResourceI": $("#ResourceForm").find("#intnPkResourceI").val(),
			"strUnitI": $("#ResourceForm").find("#strUnitI").val(),
			"intnPkEleetOrEleeleO": $("#ResourceForm").find("#intnPkEleetOrEleeleO").val(),
			"boolnIsEleetO": $("#ResourceForm").find("#boolnIsEleetO").val(),
			"strUnitO": $("#ResourceForm").find("#strUnitO").val(),
			"boolnIsWorkflow": $("#ResourceForm").find("#boolnIsWorkflow").val(),
			"intJobId": $("#ResourceForm").find("#intJobId").val(),
			"intnPkWorkflow": $("#ResourceForm").find("#intnPkWorkflow").val(),
			"hidebuttons": $("#ResourceForm").find("#hidebuttons").val(),
		};

        $.when(
            $.ajax({
                type: "GET",
                url: "/Calculation/GetOneCalculation",
                data:
                {
                    'intPk': intPk
                },
                dataType: "html",
                beforeSend: function () {
                    //													//Disable the inputs.
                    form.find("select").not("#boolnByArea", "#intnPkResourceO, #intnHours, #intnMinutes, #intnSeconds, #intnPkAccount")
                        .css("pointer-events", "none");
                    form.find("select").not("#boolnByArea", "#intnPkResourceO, #intnHours, #intnMinutes, #intnSeconds, #intnPkAccount")
                        .css("background", "#dddddd");
                },
                success: function (response) {
                    //
                    //											//Set the information on the form.
                    let json = JSON.parse(response);

					console.info(json)
					if (json.intStatus == 200) {
						if (
							json.objResponse.intnPkProcessInWorkflow != null
						) {
							//								//To easy code.
							let intnPkResourceI = json.objResponse.intnPkResourceI;
							let intnPkResourceO = json.objResponse.intnPkResourceO;
							let intnPkProcessInWorkflow = json.objResponse.intnPkProcessInWorkflow;
							let intnPkEleetOrEleeleI = json.objResponse.intnPkEleetOrEleeleI;
							let boolnIsEleetI = json.objResponse.boolnIsEleetI

							subProcessInputs(intnPkProcessInWorkflow, intnPkResourceI, $("#strJobId").val(), intnPkEleetOrEleeleI,
								boolnIsEleetI, intnPkResourceO);
						}

                        let boolnByArea = null;
                        let strUnitO = null;
                        let strAreaUnitO = null;
                        $.each(json.objResponse, function (key, value) {
                            if (
                                key != "intnPkProduct" && key != "intPkProduct" && key != "strBy" &&
                                key != "intnPkEleetOrEleele" && key != "boolnIsEleet" && key != "boolnIsBlock"
                            ) {
                                form.find(".openConditionToApplyModal").html("Condition To Apply");
                                form.find(".delete-condition-to-apply").show();
                                if (key == "intnPkProcessInWorkflow" || key == "boolnIsWorkflow") {
                                    if (
                                        value != null && value.length > 0
                                    ) {
                                        form.find("#" + key).val(value);
                                    }
                                    else if (
                                        key == "intnPkProcessInWorkflow" &&
                                        value != "" && value != null && value > 0
                                    ) {
                                        form.find("#" + key).val(value);
                                    }
                                }
                                else if (key == "boolIsEnable") {
                                    form.find("input[name='" + key + "'][value='" + value + "']").prop('checked', true);
                                }
                                else if (key == "boolIsBlock") {
                                    form.find("input[name='boolnIsBlock']").prop('checked', value);
								}
								else if (key == "arrintAscendantPk") {
									form.find("#strAscendantElements").val(value[0]).trigger("change");
									arrintPkSelectedvalue = value;
								}
								else if (key == "strValue") {
									strSelectedValue = value;
								}
								else if (
									key == "boolConditionAnd"
								) {
									form.find("boolConditionAnd").find("input").val(value);
								}
								else if (key == "strConditionToApply") {
									if (value != "" && value != null) {
										form.find("#translatedCondition").removeAttr("hidden");
										form.find("#translatedCondition").html("<b>" + value + "</b>");
									}
									else {
										form.find("#translatedCondition").attr("hidden", true);
									}
								}
								else if (key == "strConditionToApplyCoded") {
									if (value != "" && value != null) {
										form.find("#strConditionToApply").val(value);
									}
								}
								else if (key == "numnQuantityWaste") {
									if (value == null) {
										value = "";
									}
									form.find("#numnQuantityWaste").val(value);
								}
								else if (key == "numnPercentWaste") {
									if (value == null) {
										value = "";
									}
									form.find("#numnPercentWaste").val(value);
								}
								else if (key == "intnPkResourceO") {
									if (value == null) {
										value = "JobQuantity"
									}
									form.find("#" + key).val(value);

                                    quantityFrom = value;
                                }
                                else if (key == "intnPkPaTrans") {
                                    $("#ResourceForm").find("#intnPkTrans").val(value);
                                    $("#frmPaper").find("#intnPkCalculation").val(json.objResponse.intPk);
                                }
                                else {
                                    form.find("#" + key).val(value);
                                    if (key == "intPk") {
                                        intnPkCalcu = value;
                                    }
                                    else if (key == "intnPkOrderFormAttribute" && value != null) {
                                        let eleValueOrderForm = form.find("#" + key).closest("div").next().find("select");
                                        eleValueOrderForm.html("");
                                        GetValuesOrderForm(value, eleValueOrderForm);
                                    }
                                    else if (key == "strOrderFormValue") {
                                        strOrderFormValue = value;
                                    }
                                    else if (key == "intnPkResourceElement") {
                                        intPkSelectedResourceElement = value;
                                        if (intPkSelectedResource != null && intPkSelectedResource.length > 0) {
                                            form.find("#intnPkResource").val("All").change();
                                        }
                                        else if (intPkSelectedResourceElement != null && intPkSelectedResourceElement.length > 0) {
                                            form.find("#intnPkResourceElement").change();
                                        }
                                    }
                                    else if (key == "numnCost") {
                                        //debugger
                                        form.find("#" + key).html(value);
                                    }
                                    else if (key == "numnQuantity") {
                                        form.find("#" + key).html(value);
                                    }
                                    else if (
                                        key == "strUnitI"
                                    ) {
                                        form.find("#strUnitILabel").html(value);
                                    }
                                    else if (
                                        key == "strUnitO"
                                    ) {
                                        form.find("#strUnitOLabel").html(value);
                                        strUnitO = value;
                                    }
                                    else if (
                                        key == "strAreaUnitO"
                                    ) {
                                        if (value != null) {
                                            strAreaUnitO = value;
                                        }
                                    }
                                    else if (
                                        key == "boolnByArea"
                                    ) {
                                        boolnByArea = value;
                                    }
                                    else if (key == "numnNeeded") {
                                        needed = value;
                                    }
                                    else if (key == "numnPerUnits") {
                                        perUnits = value
                                    }
                                    else if (key == "boolFromThickness") {
                                        if (value == true) {
                                            form.find("#boolnFromThickness").prop("checked", true);
                                            form.find("#boolnFromThickness").val("True");
                                            form.find("#numnPerUnits").prop('disabled', true);
                                        } else {
                                            form.find("#boolnFromThickness").prop("checked", false);
                                            form.find("#boolnFromThickness").val("False");
                                            form.find("#numnPerUnits").prop('disabled', false);
                                        }
                                    }
                                }
                            }
                        });

                        form.find("#boolnByArea").html('');
                        form.find("#boolnByArea").append(new Option(strUnitO, "false"));
                        form.find("#boolnByArea").append(new Option(strAreaUnitO, "true"));
						form.find("#boolnByArea").val(boolnByArea == null ? "" : boolnByArea.toString());

                        if (
                            strAreaUnitO != null
                        ) {
                            $("#ResourceForm").find("#strUnitOLabel").prop("hidden", true);
                            $("#ResourceForm").find("#spanUnitO").prop("hidden", false);
                        } else {
                            $("#ResourceForm").find("#strUnitOLabel").prop("hidden", false);
                            $("#ResourceForm").find("#spanUnitO").prop("hidden", true);
                        }

                        //
                        $(".delete-calculation").removeAttr("disabled");

						//													//Disable the inputs.
						form.find("#intnPkResourceO").css("pointer-events", "none");
						form.find("#intnPkResourceO").css("background", "#dddddd");

						element.parent().prev().find("button").attr("disabled", "true");

						if (arrclasses[arrclasses.length - 1] != "add-default") {
							if (strBy == "processTime") {
								form.attr("action", "/Calculation/ModifyProcessTime")
							}
							else {
								form.attr("action", "/Calculation/ModifyCalculation")
							}
							form.find(".btn-primary").html("Update");
						}

						if (
							boolIsInPostProcess == "True"
						) {
							form.find("#numnPercentWaste").prop("disabled", true);
							form.find("#numnQuantityWaste").prop("disabled", true);
						}
						else {
							form.find("#numnPercentWaste").prop("disabled", false);
							form.find("#numnQuantityWaste").prop("disabled", false);
						}
					}
					else {
						subSendNotification(json.strUserMessage, json.intStatus);
					}
				}
			})
		).then(function () {
			subDeleteTemporalPaperTransformation()
			$(".modal-body").animate({ scrollTop: 0 }, 1000);
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on('click', '.delete-condition-to-apply', function (event) {
		event.preventDefault();
		let element = $(this);
		let form = element.closest("div").parent().parent();
		conditionToApplyObject = null;

		form.find("#strConditionToApply").val("");
		form.find("#translatedCondition").attr("hidden", true);
		form.find("#translatedCondition").html("");
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on('click', '.display_box', function (event) {
		//debugger
		let unitSelected = $(this).attr("data-unit-value");

		$(this).parent().prev().val(unitSelected).change();

		$("#addXJDFForm").find("#strUnitResourceForm").val(unitSelected)

		$(".unitsList").css("display", "none");
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#back-workflow-job").click(function (event) {
		event.preventDefault();
		let strHref = $(this).attr("href") + "/Workflow?intJobId=" + Cookies.get('strJobId');

		Cookies.remove('strJobId')
		location.href = strHref;
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".intPkProcessType").change(function () {
		let intPkProcessType = $(this).val();
		let processDropdown = $(this).parent().next().find("select");

		if (intPkProcessType > 0 || (intPkProcessType.length > 0 && intPkProcessType == "All")) {
			$.ajax({
				type: "GET",
				url: intPkProcessType == "All" ? "/Calculation/GetAllProcess" : "/Calculation/GetProcessFromProcessType",
				data: {
					intPkProcessType: intPkProcessType
				},
				success: function (objResponse) {
					if (
						objResponse.intStatus == 200
					) {
						processDropdown.html("");
						processDropdown.append("<option>Pick one</option>")
						$.each(objResponse.objResponse, function (index, value) {
							processDropdown.append("<option value='" + value.intPk + "'>" + value.strElementName +
								"</option>")
						});

						if (intPkSelectedProcess != null) {
							processDropdown.val(intPkSelectedProcess);
							intPkSelectedProcess = null;
						}
					}
					else {
						subSendNotification(objResponse.intStatus, objResponse.intStatus);
					}
				},
				error: function () {
					subSendNotification("Something is wrong.", 400);
				}
			});
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on('click', '.switchConditionToApply', function (event) {

		event.preventDefault();
		let element = $(this);
		let switchConditionToApply = element.find("#switchConditionToApply");

		if (
			switchConditionToApply.attr("Class") === "switch on"
		) {
			switchConditionToApply.removeClass("on");
		}
		else {
			switchConditionToApply.addClass("on");
		}
	});

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".chkNeededPerUnit", function () {
        if (
            $(".chkNeededPerUnit").is(":checked")
        ) {
            $("#ResourceForm").find("#numnPerUnits").prop("disabled", true);
            $(".chkNeededPerUnit").val("True");
            $("#ResourceForm").find("#boolnByArea").val("false");
            $("#ResourceForm").find("#boolnByArea").prop("disabled", true);
        } else {
            $("#ResourceForm").find("#numnPerUnits").prop("disabled", false);
            $(".chkNeededPerUnit").val("False");
            $("#ResourceForm").find("#boolnByArea").prop("disabled", false);
        }
    });

});

//----------------------------------------------------------------------------------------------------------------------
//															//SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function GetCalculationData(intnPkProduct, strActionName, strHtmlSectionId, boolIsWorkflow, intnJobId, intnPkWorkflow,
	hideButtons = false, intnPkProcessInWorkflow) {
	let arrstr = strActionName.split("-", 2);
	strActionName = arrstr[0];
	if (
		strActionName == "Base" ||
		strActionName == "BasePerQuantity" ||
		strActionName == "PerUnit" ||
		strActionName == "PerQuantity" ||
		strActionName == "Profit" ||
		strActionName == "ProcessDefaults" ||
		strActionName == "ResourceDefaults"
	) {
		$.ajax({
			type: "GET",
			url: "/Calculation/GetAllCalculations",
			data:
			{
				'intPkProduct': intnPkProduct,
				'strActionName': strActionName,
				'boolnByProcess': boolByProcess,
				'boolnByIntent': boolByIntent,
				'boolByResource': boolByResource,
				'boolnByProduct': boolByProduct,
				'strCalculationType': arrstr[1],
				'boolIsWorkflow': boolIsWorkflow,
				"boolnByTime": boolnByTime,
				'intnJobId': intnJobId,
				"intnPkWorkflow": intnPkWorkflow,
				"intnPkProcessInWorkflow": intnPkProcessInWorkflow
			},
			dataType: "html",
			beforeSend: function () {
				$(strHtmlSectionId).html('<div class="col-sm-12 text-center"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only" >Loading...</span ></div>');
			},
			success: function (response) {
				//											//Show the table.
				$(strHtmlSectionId).html(response);
			}
		});
	}
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function GetHtmlSection(strType, strActionName) {
	let strHtmlSectionId = "";
	let arrstr = strActionName.split("-", 2);

	if (arrstr.length > 1) {
		strActionName = GetActionType(arrstr[1]);
	}

	if (strType == "process") {
		boolByProcess = true;
		boolByIntent = null;
		boolByResource = null;
		boolByProduct = null;
		boolnByTime = false;
		strHtmlSectionId = "#process-" + strActionName + "-table"
	}
	else if (strType == "processTime") {
		boolByProcess = true;
		boolByIntent = null;
		boolByResource = null;
		boolByProduct = null;
		boolnByTime = true;
		strHtmlSectionId = "#processTime-" + strActionName + "-table"
	}
	else if (strType == "intent") {
		strHtmlSectionId = "#intent-" + strActionName + "-table"
		boolByProcess = null;
		boolByIntent = true;
		boolByResource = null;
		boolByProduct = null;
		boolnByTime = null;
	}
	else if (strType == "resource") {
		strHtmlSectionId = "#resource-" + strActionName + "-table"
		boolByProcess = null;
		boolByIntent = null;
		boolByResource = true;
		boolByProduct = null;
		boolnByTime = null;
	}
	else {
		strHtmlSectionId = "#product-" + strActionName + "-table"
		boolByProcess = null;
		boolByIntent = null;
		boolByResource = null;
		boolByProduct = true;
		boolnByTime = null;
	}

	return strHtmlSectionId;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function GetActionType(strActionType) {

	if (strActionType == "B") {
		strActionType = "Base";
	}
	else if (strActionType == "PU") {
		strActionType = "PerUnit";
	}
	else if (strActionType == "PQ") {
		strActionType = "PerQuantity";
	}

	return strActionType;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function GetValuesOrderForm(intPkAttribute, element) {
	$.ajax({
		type: "GET",
		url: "/Calculation/GetValuesForAnAttribute",
		data:
		{
			'intPkAttribute': intPkAttribute
		},
		dataType: "html",
		success: function (response) {
			let darr = JSON.parse(response);
			$.each(darr, function () {
				if (strOrderFormValue != null && strOrderFormValue == this.value) {
					$("<option selected/>").val(this.value).text(this.text).appendTo(element);
				}
				else {
					$("<option />").val(this.value).text(this.text).appendTo(element);
				}
			});
			strOrderFormValue = null;
		},
		error: function (xhr, status) {

		}
	})
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function GetIntPkValue(element) {

	let intPk = null;
	if (intPkProcess != 0 || intPkProcess != null) {
		element.find("#intnPkProcess").val(intPkProcess)
		intPk = intPkProcess;
	}
	else if (intPkResource != 0 || intPkResource != null) {
		element.find("#intnPkResource").val(intPkResource)
		intPk = intPkResource;
	}

	return intPk;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function GetDefaultCalculations(form, classes) {
	//
	let arrselectElements = form.find(".default-select");
	let boolShowDefaultCalculations = true;

	//if (
	//	arrselectElements != null &&
	//	(
	//		!isNaN($(arrselectElements[0]).val()) ||
	//		!isNaN($(arrselectElements[1]).val())
	//	)
	//) {
	GetCalculationData(0, classes[2], "#" + classes[1] + "-table-default"
			/*,$(arrselectElements[0]).val(), $(arrselectElements[1]).val()*/);
	boolShowDefaultCalculations = true;
	//}
	//else {
	//	alert("Is necessary to select an process.")
	//}

	return boolShowDefaultCalculations;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subSetResourceOnForm() {
	intPkSelectedResourceElement = null;
	if (
		//													//Verify if the intPkResource value existe
		Cookies.get('intPkResource') != undefined &&
		Cookies.get('intPkResource').length > 0
	) {
		intPkSelectedResourceElement = Cookies.get('intPkResource');
		Cookies.remove("intPkResource");

		$("#ByResourcesPill").click();
		$("#PerQuantityResource").click();
	}

	if (
		//													//Verify if the strJobId value existe
		Cookies.get('strJobId') != undefined &&
		Cookies.get('strJobId').length > 0
	) {
		$("#back-workflow-job").removeAttr("hidden");
	}
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subGetProcessesResourcesAndAccounts() {
	subGetAllProcess("All");
	subGetAllResources("All");
	subGetAllAccounts();
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subGetAllResources(intResourcePk) {
	let selectList = $("#ResourceForm, #BaseResourceForm").find("#intnPkResourceI");

	selectList.html("");
	$("<option selected/>").val(null).text("Pick one").appendTo(selectList);

	$.ajax({
		type: "GET",
		url: "/Calculation/GetResourceFromResourceType",
		data: { 'intResourcePk': intResourcePk },
		dataType: "html",
		success: function (strResponse) {
			var objResponse = JSON.parse(strResponse);
			//console.info(objResponse)
			if (objResponse.intStatus == 200) {
				$.each(objResponse.objResponse, function (key, value) {
					$("<option />").val(value.intPk).text(value.strTypeId)
						.attr("data-strUnit", value.strUnit)
						.attr("data-numQuantity", value.numQuantity)
						.attr("data-numCost", value.numCost)
						.attr("data-numnMin", value.numnMin)
						.attr("data-boolIsBlock", value.boolIsBlock)
						.appendTo(selectList);
				});
				selectList.val(intPkSelectedResourceElement).change();
			}
			else {
				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			}
		},
		error: function () {
			//subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subGetAllProcess(intPkProcessType) {
	let processDropdown = $("select[name=intnPkProcess]");

	$.ajax({
		type: "GET",
		url: intPkProcessType == "All" ? "/Calculation/GetAllProcess" : "/Calculation/GetProcessFromProcessType",
		data: {
			intPkProcessType: intPkProcessType
		},
		success: function (objResponse) {
			if (
				objResponse.intStatus == 200
			) {
				processDropdown.html("");
				processDropdown.append("<option>Pick one</option>")
				$.each(objResponse.objResponse, function (index, value) {
					processDropdown.append("<option value='" + value.intPk + "'>" + value.strElementName +
						"</option>")
				});

				$(".intPkProcessType").val("All");

				if (intPkSelectedProcess != null) {
					processDropdown.val(intPkSelectedProcess);
					intPkSelectedProcess = null;
				}
			}
			else {
				subSendNotification(objResponse.intStatus, objResponse.intStatus);
			}
		},
		error: function () {
			//subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subGetAllAccounts() {
	let accountDropdown = $("select[name=intnPkAccount]");

	$.ajax({
		type: "GET",
		url: "/Calculation/GetAllAccounts",
		success: function (objResponse) {
			//debugger
			if (
				Array.isArray(objResponse)
			) {
				accountDropdown.html("");
				accountDropdown.append("<option>Pick one</option>");
				$.each(objResponse, function (index, value) {
					accountDropdown.append("<option value='" + value.intPk + "'>" + value.strName + "</option>");
				});
			}
			else {
				subSendNotification("Something is worng", 400);
			}
		},
		error: function () {
			//subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function saveCalculation(form, intPkProduct, strBy, strCalculationType, strHtmlSectionId,
	intPkProcessType, intnPkProcess, intnPkResource, intnPkResourceElement,
	eleElement, strSerializedData, formAction, numnMin, numnBlock, strUnit) {
	if (parseFloat(strUnit)) {
		subSendNotification("Unit of Measurement cannot start with a number.", 400);
	}
	else {
		if (
			numnMin != "" && numnBlock != ""
		) {
			numnMin = parseFloat(numnMin);
			numnBlock = parseFloat(numnBlock);

			if (
				numnBlock > 0 &&
				numnMin > 0 &&
				numnMin < numnBlock
			) {
				$("#confirmation-modal").modal('show');
				$("#myModalBody").html("<b>" + "Min to Use is going to change from " + numnMin + " to " + numnBlock +
					"</b>" + "<br/> Continue anyway?")

				$("#modal-btn-yes").unbind();
				$("#modal-btn-yes").css('display', 'block');

				$("#modal-btn-no").unbind();
				$("#modal-btn-no").css('display', 'block');

				$("#modal-btn-yes").bind("click", function () {
					funSaveCalculation(strSerializedData, eleElement, form,
						formAction, strHtmlSectionId, intPkProduct, intPkProcessType,
						intnPkProcess, intnPkResource, intnPkResourceElement, strCalculationType, strBy);
					$("#confirmation-modal").modal('hide');
				});

				$("#modal-btn-no").bind("click", function () {
					$("#confirmation-modal").modal('hide');
				});
			}
			else if (
				numnBlock < numnMin &&
				numnBlock > 0 &&
				numnMin > 0 &&
				numnMin % numnBlock != 0
			) {
				let intToMultiply = Math.trunc(numnMin / numnBlock) + 1;
				let numMinFinal = numnBlock * intToMultiply;

				$("#confirmation-modal").modal('show');
				$("#myModalBody").html("<b>" + "Min to Use is going to change from " + numnMin + " to " + numMinFinal +
					"</b>" + "<br/> Continue anyway?")

				$("#modal-btn-yes").unbind();
				$("#modal-btn-yes").css('display', 'block');

				$("#modal-btn-no").unbind();
				$("#modal-btn-no").css('display', 'block');

				$("#modal-btn-yes").bind("click", function () {
					funSaveCalculation(strSerializedData, eleElement, form,
						formAction, strHtmlSectionId, intPkProduct, intPkProcessType,
						intnPkProcess, intnPkResource, intnPkResourceElement, strCalculationType, strBy);
					$("#confirmation-modal").modal('hide');
				});

				$("#modal-btn-no").bind("click", function () {
					$("#confirmation-modal").modal('hide');
				});
			}
			else {
				funSaveCalculation(strSerializedData, eleElement, form,
					formAction, strHtmlSectionId, intPkProduct, intPkProcessType,
					intnPkProcess, intnPkResource, intnPkResourceElement, strCalculationType, strBy);
			}
		}
		else {
			funSaveCalculation(strSerializedData, eleElement, form,
				formAction, strHtmlSectionId, intPkProduct, intPkProcessType,
				intnPkProcess, intnPkResource, intnPkResourceElement, strCalculationType, strBy);
		}
	}
}


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function funSaveCalculation(strSerializedData, eleElement, formX, formAction, strHtmlSectionId, intPkProduct,
	intPkProcessType, intnPkProcess, intnPkResource, intnPkResourceElement, strCalculationType, strBy) {
	$.ajax({
		type: "POST",
		url: formX.attr("action"),
		data: strSerializedData,
		dataType: "html",
		success: function (response) {
			var objResponse = response;
			if (!(response.constructor.name === "Object")) {
				objResponse = JSON.parse(response);
			}

			if (
				objResponse.intStatus == 200 || objResponse == null
			) {
				let boolIsInPostProcess = eleElement.find("#intnPkProduct").attr("data-boolisinpostprocess");
				if (
					boolIsInPostProcess == "True"
				) {
					eleElement.find("#numnPercentWaste").prop("disabled", true);
					eleElement.find("#numnQuantityWaste").prop("disabled", true);
				}
				else if (boolIsInPostProcess == "False"
				) {
					eleElement.find("#numnPercentWaste").prop("disabled", false);
					eleElement.find("#numnQuantityWaste").prop("disabled", false);
				}

				$("#ResourceForm").find("#intnPkTrans").val("");
				$("#ResourceForm").find("#intPk").val("");
				intPkPaTrans = null;
				intnPkCalcu = null;

				$("#ResourceForm").find("#strUnit").html("-");
				//eleElement.find(".delete-condition-to-apply").hide();
				eleElement.find(".openConditionToApplyModal").html("Conditions to apply");

				eleElement.attr("action", formAction);
				eleElement.find(".btn-primary").html('<span class="fa fa-floppy-o"></span> Save');
				eleElement.find("#strConditionToApply").val("");
				eleElement.find("#translatedCondition").attr("hidden", true);

				eleElement.find(".openPaperModal").removeAttr("data-pkpapertrans")
				eleElement.find(".chkNeededPerUnit").prop("disabled", true);
				$("#ResourceForm").find("#numnPerUnits").prop('disabled', false);

				let intnPkEleetOrEleeleI = eleElement.find("#intnPkEleetOrEleeleI").val()
				let boolnIsEleetI = eleElement.find("#boolnIsEleetI").val()

				//													//Enable the inputs.
				eleElement.find("#intnPkResourceO").css("pointer-events", "all");
				eleElement.find("#intnPkResourceO").css("background", "#ffffff");

				eleElement[0].reset();

				$(".openPaperModal").removeAttr("data-pkpapertrans");
				$(".openPaperModal").removeAttr("data-intPkEleetOrEleeleI");
				$(".openPaperModal").removeAttr("data-boolIsEleetI");
				$(".openPaperModal").removeAttr("data-intPkProcessInWorkflow");
				$(".openPaperModal").removeAttr("data-intPkResourceI");

				let intPk = GetIntPkValue(eleElement);

				eleElement.find("#intnPkProcessInWorkflow").val();
				GetCalculationData(intPkProduct, strCalculationType, strHtmlSectionId,
					eleElement.find("#boolnIsWorkflow").val(), eleElement.find("#intJobId").val(),
					eleElement.find("#intnPkWorkflow").val(), eleElement.find("#hidebuttons").val(),
					intLastPkProcessInWorkflow);

				$(strHtmlSectionId).show();
				eleElement.parent().find("#switch2").removeClass("on");
				$(strHtmlSectionId + "-default").hide();
				$(".delete-calculation").removeAttr("disabled");

				//										//Enable and reset the select control on the form in case the calculation 
				//										//		were'nt be a default or by workflow.
				if (
					intPkProduct != null && intPkProduct != "" &&
					(eleElement.find("#intnPkWorkflow").val() == "" || eleElement.find("#intnPkWorkflow").val() == null)
				) {
					eleElement.find("select").css("pointer-events", "all");
					//eleElement.find("select").css("background", "white");

					eleElement.find("#intnPkResourceO").css("background", "#dddddd");
				}
				else {
					eleElement.find(".intPkProcessType").val(intPkProcessType);
					eleElement.find(".intnPkProcess").val(intnPkProcess);
					//eleElement.find("#intnPkResource").val(intnPkResource);
					eleElement.find("#intnPkResourceI").val(intnPkResource).change();
					eleElement.find("#intPkProcessInWorkflow").val(intLastPkProcessInWorkflow);

					eleElement.find("#intnPkResourceO").css("pointer-events", "All");
					eleElement.find("#intnPkResourceO").css("background", "transparent none repeat scroll 0 0");

					subProcessInputs(intLastPkProcessInWorkflow, intnPkResource, $("#strJobId").val(),
						intnPkEleetOrEleeleI, boolnIsEleetI);
				}
				eleElement.find("#intnPkResourceO").change();

				$.each(objIOTemp, function (key, value) {
					if (key == "intnPkResourceI") {
						$("#ResourceForm").find("#" + key).val(value).change()
					}
					else {
						$("#ResourceForm").find("#" + key).val(value)
					}
				})

                if (strBy == "processTime") {
                    eleElement.attr("action", "/Calculation/AddProcessTimeCalculation")
                }
                else {
                    eleElement.attr("action", "/Calculation/AddCalculation")
                }

				eleElement.find("#intPk").val("");
                $("#ResourceForm").find("#strUnitOLabel").html('-');
                $("#ResourceForm").find("#strUnitOLabel").prop("hidden", false);
                $("#ResourceForm").find("#spanUnitO").prop("hidden", true);
                $("#ResourceForm").find("#boolnByArea").html('');
                $("#ResourceForm").find("#boolnByArea").append(new Option('-', "false"));

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				conditionToApplyObject = null;
            } else {
                subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
            }
        },
        error: function (xhr, status) {
            subSendNotification("Something is wrong.", 400);
        }
    })
}