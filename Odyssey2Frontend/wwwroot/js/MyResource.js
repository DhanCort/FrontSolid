let intPkProcess = 0;
let intPkType = null;
let strRes = null;
let arrAscendantPk = null;
let strValue = null;
let elementChecked = null;
let intPk = null;
let isInherited = false;
let intPkTypeSelected = null;
let objInherited = null;
let boolIsTheFirstTime = true;
let intPkTemplateOrResourceTemp = null;

$(document).ready(function () {
	let boolIsRoll = false;
	let intRollAttributeSectionId = null;

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".boolAreaSwitch", function () {
		let boolEnabled = $(this).children().children().hasClass("on");

		if (
			!boolEnabled
		) {
			$("#boolnAreaSwitch").addClass("on");
			$("#newCost").find("#strDimensionUnit").parent().show();
			$("#newCost").find("#strUnit").parent().hide();
		}
		else {
			$("#boolnAreaSwitch").removeClass("on");
			$("#newCost").find("#strDimensionUnit").parent().hide();
			$("#newCost").find("#strUnit").parent().show();
		}

		$("input[name=boolnArea]").val(!boolEnabled);
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#xjdfAttributesForm").ready(function () {
		let origin = Cookies.get("Origin");
		//let showUnitOfMeasurement = Cookies.get("showUnitOfMeasurement");

		//if (showUnitOfMeasurement == "true") {
		//    $(".showUnitResourceForm").removeAttr("hidden");
		//}
		//else if (showUnitOfMeasurement == "false") {
		//    $(".showUnitResourceForm").attr("hidden", true);
		//}

		//Cookies.remove("showUnitOfMeasurement");

		if (origin != undefined) {
			if (origin == "workflow") {
				let strTypeId = Cookies.get("strTypeId");
				let intPkProduct = Cookies.get("intPkProductWkflw");
				let strPrevUrl = document.referrer;
				$(".btnBackToScreen").attr("href", strPrevUrl);

				Cookies.remove("Origin");

				Cookies.remove("strTypeId");
				Cookies.remove("intPkProductWkflw");
			}
			else if (origin == "specificResource") {
				let path = Cookies.get("Path");

				if (path == undefined) {
					$(".btnBackToScreen").attr("href", "/PrintshopResourcesTemplate");
				}
				else {
					$(".btnBackToScreen").attr("href", "/PrintshopResourcesTemplate/GetTemplatesAndResources" + path);
				}
				Cookies.remove("Path");
			}
			else {
				$(".btnBackToScreen").attr("href", "/PrintshopResourcesTemplate");
			}
		}
		else if (origin == undefined) {
			$(".btnBackToScreen").attr("href", "/PrintshopResourcesTemplate");
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".resPath").ready(function () {
		//alert("kjfdvnjfvjvbkjv")
		//debugger
		Cookies.set("Origin", "specificResource");

		let boolIsPhysical = $("#boolIsPhysical").val();
		let boolDeviceToolOrCustom = $("#boolIsDeviceToolOrCustom").val();
		Cookies.set("showUnitOfMeasurement", boolIsPhysical);

		let path = $(".resBreadcrumb")[$(".resBreadcrumb").length - 1];
		//console.info(path)
		if (path != undefined) {
			let lastPkPath = path.attributes.value.value.split("|")[0];
			let boolIsType = path.attributes.value.value.split("|")[1];
			Cookies.set("Path", "?intPk=" + lastPkPath + "&boolIsType=" + boolIsType +
				"&boolIsDeviceToolOrCustom=" + boolDeviceToolOrCustom);
		}

		let element = $(".resBreadcrumb")[0];
		if (element != undefined) {
			intPkType = element.attributes.value.value.split("|")[0];
			strRes = element.attributes.value.value.split("|")[2];

			$("#addSpecificResource").attr("href", "/PrintshopResourcesTemplate/AddXJDFForm?intPkType=" +
				intPkType + "&strType=" + strRes + "&intPkResource=0&boolIsPhysical=" + boolIsPhysical +
				"&boolnIsChangeable=true" +
				"&boolIsDeviceToolOrCustom=" + boolDeviceToolOrCustom);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".template-radio", function () {
		//debugger
		intPkType = $(this).attr("value");
		strRes = $(this).attr('data-checkbox-text');
		elementChecked = $(this);
		let boolIsPhysical = $(this).attr("data-boolIsPhysical");

		if (boolIsPhysical.toLowerCase() == "true") {
			Cookies.set("showUnitOfMeasurement", "true");
		}
		else {
			Cookies.set("showUnitOfMeasurement", "false");
		}

		$("#resNextStep").attr("href", "/PrintshopResourcesTemplate/AddXJDFForm?intPkType=" +
			intPkType + "&strType=" + strRes + "&intPkResource=0&boolIsPhysical=" + boolIsPhysical +
			"&boolnIsChangeable=true");
		$("#resNextStep").removeAttr("hidden");
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#strResName").keyup(function () {
		let unitOfMeasurementElement = $("#strUnitResourceForm").attr("hidden");
		//debugger
		if (
			unitOfMeasurementElement == undefined
		) {
			if (
				$("#strResName").val() != "" &&
				($("#strUnitResourceForm").val() != "" || boolIsRoll)
			) {
				$("#saveResForm").show();
			}
			else {
				$("#saveResForm").hide();
			}
		}
		else {
			if (
				$("#strResName").val() != ""
			) {
				$("#saveResForm").show();
			}
			else {
				$("#saveResForm").hide();
			}
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#strUnitResourceForm").on("change keyup", function () {
		if (
			($("#strResName").val() != "") &&
			($("#strUnitResourceForm").val() != "" || boolIsRoll)
		) {
			$("#saveResForm").show();
			$(".unitsList").css("display", "none");
		}
		else {
			$("#saveResForm").hide();
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#resNextStepD").click(function () {
		//console.log(intResPk);
		//debugger
		if (intPkType != null) {
			var attributesForm = $("#attributesForm");
			//console.info(attributesForm)
			$("#addAscendantElements").find("#intnInheritedPk").empty();
			$("#addAscendantElements").find("#intPkResource").empty();
			$("#addAscendantElements").find("#intPkTemplate").empty();
			var childCount = 1;
			$("#newForm").show();
			$("#dynamicElements").empty();
			$("#resNextStep").hide();
			$("#mainChkResources").hide();
			$("#addAscendantElements").removeAttr("hidden");
			$("#res-modal-title").html(strRes);

			let intPkType = Cookies.get("intPkType");
			let strType = Cookies.get("strType");

			if (intPkType == undefined && strType == undefined) {
				$("#resPreviousStep").show();
				$("#resPreviousScreen").css("display", "none");
				$("#res-modal-title").removeAttr("hidden");
			}
			else {
				$("#resPreviousStep").hide();
				$("#resPreviousScreen").css("display", "block");
				$("#res-modal-title").removeAttr("hidden");
			}

			//debugger
			let intPkProductWkflw = Cookies.get("intPkProductWkflw");
			let strTypeId = Cookies.get("strTypeId");
			let queryUrl = "?intPk=" + intPkProductWkflw + "&strTypeId=" + strTypeId;

			if (intPkProductWkflw != undefined && strTypeId != undefined) {
				$("#resPreviousScreen").attr("href", "/Workflow" + queryUrl);
				$("#resPreviousStep").hide();
				$("#resPreviousScreen").css("display", "block");
				$("#res-modal-title").removeAttr("hidden");

				Cookies.remove("intPkProductWkflw");
				Cookies.remove("strTypeId");
			}

			$.ajax({
				type: "GET",
				url: "/PrintshopResourcesTemplate/GetTemplatesAndResourcesForDropdown",
				data: { "intPkType": intPkType },
				dataType: "html",
				success: function (response) {
					//debugger
					let json = JSON.parse(response);
					let darrTemplates = json.darrTemplates;
					let darrmyResourcesModel = json.darrmyResourcesModel;

					var selectList = $("#addAscendantElements").find("#intPkTemplate");
					$("#addAscendantElements").find("#intnInheritedPk").append(new Option("Pick one Template", ""));
					if (darrTemplates.length > 0) {
						selectList.append(new Option("Pick one Template", ""));
						for (var i = 0; i < darrTemplates.length; i++) {
							var obj = darrTemplates[i];
							option = document.createElement("option");
							option.value = obj.intPk;
							option.text = obj.strTypeId;
							selectList.append(new Option(option.text, option.value));
							$("#addAscendantElements").find("#intnInheritedPk").append(new Option(option.text, option.value));
						}
						$("#addAscendantElements").find("#intPkTemplate").removeAttr("disabled");
						//$("#addAscendantElements").find("#dropdownAttributes").removeAttr("disabled");
					}
					else {
						$("#addAscendantElements").find("#intPkTemplate").attr("disabled", "disabled");
						//$("#addAscendantElements").find("#dropdownAttributes").attr("disabled", "disabled");
					}

					selectList = $("#addAscendantElements").find("#intPkResource");
					if (darrmyResourcesModel.length > 0) {
						selectList.append(new Option("Pick one Resource", ""));
						for (var i = 0; i < darrmyResourcesModel.length; i++) {
							var obj = darrmyResourcesModel[i];
							option = document.createElement("option");
							option.value = obj.intPk;
							option.text = obj.strName;
							selectList.append(new Option(option.text, option.value));
						}
						$("#addAscendantElements").find("#intPkResource").removeAttr("disabled");
						//$("#addAscendantElements").find("#dropdownAttributes").removeAttr("disabled");
					}
					else {
						$("#addAscendantElements").find("#intPkResource").attr("disabled", "disabled");
						//$("#addAscendantElements").find("#dropdownAttributes").attr("disabled", "disabled");
					}
					$("#attributesForm").empty();
				}
			});

			//createForm(intResPk, childCount);
			//$("#dynamicElements").html(intResPk);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#resPreviousStep").click(function () {
		$("#newForm").hide();
		$("#resNextStep").show();
		$("#resPreviousStep").hide();
		$("#mainChkResources").show();
		$("#addAscendantElements").attr("hidden", "hidden");
		$("#strResName").val("");
		$("#saveResForm").hide();
		$("#res-modal-title").html("Select type of XJDF Resource");
		$("#resPreviousScreen").css("display", "block");
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#addAscendantElements").find(".dropdownForAttributes").change(function () {
		let strSelectId = $(this).attr("id")
		if (strSelectId == "intPkTemplate") {
			$(this).parent().parent().next().find("#intPkResource").val("");
		}
		else if (strSelectId == "intPkResource") {
			$(this).parent().parent().prev().find("#intPkTemplate").val("");
		}

		intPk = $(this).val();
		if (intPk != "") {
			$.ajax({
				type: "GET",
				url: "/PrintshopResourcesTemplate/GetAttributesAndValues",
				data: { "intPk": intPk },
				dataType: "html",
				success: function (response) {
					//debugger
					let json = JSON.parse(response);
					//console.info(json);
					var form = $("#addAscendantElements").find("#attributesForm");
					form.empty();
					form.append('<div class="custom-control custom-checkbox dropdown-item ml-2"><input type="checkbox" ' +
						'class="custom-control-input attributeCheck" id="AllAttributes" name="AllAttributes" ' +
						'value="All"><label class= "custom-control-label checkbox-label" for="AllAttributes">' +
						'Select All</label></div>');

					if (json.length > 0) {
						for (var i = 0; i < json.length; i++) {
							var obj = json[i];
							form.append('<div class="custom-control custom-checkbox dropdown-item ml-2">' +
								'<input type="checkbox" class="custom-control-input attributeCheck" id="attrChk_' + i +
								'" name="attrChk_' + i + '" value="' + obj.intPk + '" data-attr-chk="' + obj.intPk + '">' +
								'<label class= "custom-control-label checkbox-label" for="attrChk_' + i + '">' +
								obj.strName + ' <i class="fa fa-chevron-right aria-hidden="true"></i> ' + obj.strValue +
								'</label></div>');
						}
					}
				}
			});
		}
		else {
			var form = $("#addAscendantElements").find("#attributesForm").html('<div class="checkbox-label pl-3">' +
				'Nothing to show</div>');
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).find("#addAscendantElements").on("change", ".attributeCheck", function () {
		let intAttributePk = $(this).val();
		let divFormId = $(this).attr("data-attr-chk");
		//console.log("intPk === " + intPk)
		//debugger
		if (intAttributePk == "All") {
			if ($(this).prop("checked")) {
				let attributeCheck = $(document).find("#addAscendantElements").find(".attributeCheck").length;
				$(document).find("#addAscendantElements").find(".attributeCheck").each(function (index, value) {
					//debugger
					if (value.id != "") {
						let attrValue = $("#addAscendantElements").find("#" + value.id).val();
						let attrFormId = $("#addAscendantElements").find("#" + value.id).attr("data-attr-chk");
						let divForm = $("#dynamicElements").find("div#" + attrFormId);
						if (divForm.length == 0) {
							addElements(intPk, attrValue, attrFormId, true, false);
							$("#addAscendantElements").find("#" + value.id).prop('checked', true);
						}
						//console.log(intResourcePk + " === " + attrValue);
					}
				});
			}
			else {
				$("#dynamicElements").empty();
				$(document).find("#addAscendantElements").find(".attributeCheck").each(function (index, value) {
					if (value.id != "") {
						$("#addAscendantElements").find("#" + value.id).prop('checked', false);
					}
				});
			}
		}
		else {
			if ($(this).prop("checked")) {
				addElements(intPk, intAttributePk, divFormId, true, false);
			}
			else {
				$("#dynamicElements").find("div#" + divFormId).remove().prev().remove();
			}
			//console.log(intResourcePk + " --- " + intAttributePk);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#intnInheritedPk").change(function () {
		let intnInheritedPk = $(this).val();
		if (intnInheritedPk != "") {
			$("#strUnitResourceForm").prop("disabled", true);
			$("#strUnitResourceForm").val("")
			$(".unitsList").css("display", "none");

			if (unitInherited != null) {
				$("#strUnitResourceForm").val(unitInherited)
			}

			$("#boolIsDecimal").prop("disabled", true);
			$("#boolIsDecimal").prop("checked", boolIsDecimal);
		}
		else {
			$("#strUnitResourceForm").prop("disabled", false);
			if (unitInherited != null) {
				$("#strUnitResourceForm").val(unitInherited)
			}

			$("#boolIsDecimal").prop("disabled", false);
			$("#boolIsDecimal").prop("checked", boolIsDecimal);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".switchResForm").click(function (
	) {
		let boolIstemplate = $("#boolIsTemplate").attr("class") === "switch on";
		if (
			boolIstemplate
		) {
			$("#boolIsTemplate").removeClass("on");
		}
		else {
			$("#boolIsTemplate").addClass("on");
		}
	})

	//------------------------------------------------------------------------------------------------------------------
	$("#saveResForm").click(function (
		//                                                  //Add or edit a resource. 
		//                                                  //Construct the json to be sent to the backend service.
	) {
		var values = funGetArrayOfAttributes();
		var arrattr = values[0];
		var intEmptyField = values[1];

		if (
			//                                              //There is value for every attribute or ascendant.
			intEmptyField == 0
		) {
			let strUnit = $("#strUnitResourceForm").val();
			if (
				//                                          //Invalid unit.
				parseFloat(strUnit)
			) {
				subSendNotification("Unit of Measurement cannot start with a number.", 400);
			}
			else {
				//                                          //Get if it is a template.
				let boolIsTemplate = $("#boolIsTemplate").attr("class") === "switch on";

				//                                          //Get the pk in order to make an add or an edit action.
				let intPkResource = $("#intPkResource").val();

				//                                          //To easy code.
				let strUrl = null;
				var objResourceData = null;

				/*CASE*/
				if (
					//                                      //It is an add action.
					intPkResource == 0
				) {
					//                                      //Construct the object to be sent.
					objResourceData = {
						"intPkType": $("#intPkType").val(),
						"strResourceName": $("#strResName").val(),
						"strUnit": $("#strUnitResourceForm").val(),
						"boolnIsDecimal": $("#boolIsDecimal").is(":checked"),
						"intnPkInherited": $("#intnInheritedPk").val(),
						"boolIsTemplate": boolIsTemplate,
						"arrattr": arrattr,
						"inhe": objInherited
					};

					//                                      //Define the url.
					strUrl = "/PrintshopResourcesTemplate/Add";

					funResourceIsAddable(strUrl, objResourceData);
				}
				else if (
					intPkResource > 0
				) {
					//                                      //Construct the object to be sent.
					objResourceData = {
						"intPkType": $("#intPkType").val(),
						"intPkResource": intPkResource,
						"strResourceName": $("#strResName").val(),
						"strUnit": $("#strUnitResourceForm").val(),
						"boolnIsDecimal": $("#boolIsDecimal").is(":checked"),
						"arrattr": arrattr,
						"inhe": objInherited
					};

					//                                      //Define the url.
					strUrl = "/PrintshopResourcesTemplate/Edit";

					//                                      //Edit the resource.
					funResourceIsAddable(strUrl, objResourceData);
				}
				/*END-CASE*/
			}
		}
		else {
			subSendNotification("Some fileds are empty.", 400);
		}
	});

	//---------------------------------------------------------------------------------------------------------------------
	$("#newForm").click(function () {
		//debugger
		let intPkType = $("#intPkType").val();

		let intElementId = 1;
		if (
			$("#dynamicElements").children("div").length >= 1
		) {
			intElementId = parseInt($("#dynamicElements").children("div").last().attr("id")) + 1;
		}
		createForm(intPkType, 1, "", intElementId, null, true, false);

		$("#dynamicElements").animate({
			scrollTop: $('#dynamicElements')[0].scrollHeight
		}, 1000);
	});

	//---------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".child-select-element", function () {
		//
		if ($(this).val() != "") {
			let intCurrentAttributeSection = $(this).closest(".card-form").attr("id");
			var form = $(this).closest("form");
			var childCount = countAndDeleteChildElements(form, $(this).attr("id"));
			var intPk = $(this).val().split("|")[0];
			var boolIsAttribute = $(this).val().split("|")[1];

			subValidateIfAttributeIsRoll($(this), intCurrentAttributeSection);

			$.ajax({
				type: "POST",
				url: "/Calculation/GetInfoList",
				data: { 'intPk': intPk, 'boolIsAttribute': boolIsAttribute },
				dataType: "html",
				async: false,
				success: function (response) {
					//debugger
					//
					if (typeof response == 'undefined' || response == 'undefined') {
						var input = document.createElement("input");
						input.id = "child_" + childCount;
						input.className = "input form-control input-with-dropdowns child-dynamic last-element";
						input.style.cssText = "width:500px;";
						form.append(input);

						if (strValue != "") {
							form.find("#" + input.id).val(strValue);
						}

						if (isInherited) {
							form.find("#child_" + childCount).prop("disabled", true);
						}

						strValue = "";
					}
					else if (response != "finish") {
						form.append('<span class="select child-dynamic" id="spanselect_' + childCount + '" style="width:500px"></span>');
						var spanForSelect = form.find("#spanselect_" + childCount);
						var selectList = document.createElement("select");
						selectList.id = "child_" + childCount;
						selectList.className = "child-select-element";

						var json = JSON.parse(response);

						var option = document.createElement("option");
						option.value = "";
						option.text = "Pick one";
						selectList.appendChild(option);
						let controltype = null;
						for (var i = 0; i < json.length; i++) {
							var obj = json[i];
							option = document.createElement("option");
							if (typeof obj === "string") {
								option.value = obj;
								option.text = obj;
								selectList.appendChild(option);
								controltype = "string";
							}
							else {
								option.value = obj.intPk + "|" + obj.boolIsAttribute;
								option.text = obj.strName;
								selectList.appendChild(option);
							}
						}

						spanForSelect.append(selectList);

						if (controltype == "string") {
							form.find("#" + "child_" + childCount).addClass("last-element");
						}
						//debugger
						if (arrAscendantPk != null && arrAscendantPk.length > 0) {
							for (var i = 1; i < arrAscendantPk.length; i++) {
								let valSelected = arrAscendantPk[i];
								if (valSelected != "") {
									form.find("#child_" + childCount + " option").each(function () {
										//debugger
										//
										if (this.value == valSelected + "|true") {
											form.find("#child_" + childCount).val(valSelected + "|true").change();
										}
										else if (this.value == valSelected + "|false") {
											form.find("#child_" + childCount).val(valSelected + "|false").change();
										}
									});
								}
							}
						}
						//debugger
						let variable = form.find("#child_" + childCount);
						if (strValue != "" && variable.hasClass("last-element")) {
							variable.val(strValue).change();
							if (isInherited) {
								form.find("#child_" + childCount).prop("disabled", true);
							}
							strValue = "";
						}
					}

					$("#dynamicElements").animate({
						scrollTop: $('#dynamicElements')[0].scrollHeight
					}, 1000);
				}
			});
		}
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function subValidateIfAttributeIsRoll(
		selectElement,
		intCurrentAttributeSection
	) {
		if (
			selectElement.val() == "Roll" && !boolIsRoll
		) {
			boolIsRoll = true;
			intRollAttributeSectionId = intCurrentAttributeSection;

			$("#strUnitResourceForm").prop("disabled", true);
			$("#strUnitResourceForm").removeClass("showUnits");
			$("#strUnitResourceForm").val("");

			$(".closeUnitDropdown").click();
			$("#strUnitResourceForm").parent().next().css("display", "block");
		}
		else if (
			boolIsRoll &&
			intCurrentAttributeSection == intRollAttributeSectionId
		) {
			boolIsRoll = false;
			$("#strUnitResourceForm").prop("disabled", false);
			$("#strUnitResourceForm").addClass("showUnits");
			$("#strUnitResourceForm").parent().next().css("display", "none");
		}

		$("#strUnitResourceForm").change();
	}

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".removeResourceForm", function () {
		let intCurrentAttributeSection = $(this).closest(".card-form").attr("id");
		let parentDiv = $(this).closest("div").parent().parent();
		let cardId = $(this).attr("data-res-card");
		let previous = parentDiv.prev();

		subValidateIfAttributeIsRoll($(this), intCurrentAttributeSection);

		parentDiv.fadeOut("slow", function () {
			this.remove();
			previous.remove();
		});

		$(document).find("#addAscendantElements").find(".attributeCheck").each(function (index, value) {
			//debugger
			if (value.id != "") {
				let dataAttrChk = $("#addAscendantElements").find("#" + value.id).attr("data-attr-chk");
				if (dataAttrChk == cardId) {
					$("#addAscendantElements").find("#" + value.id).prop('checked', false);
				}
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnResetToParentValue", function () {
		//debugger
		let button = $(this);
		let intValuePk = $(this).parent().parent().find(".chkInherit").val()
		let boolIsCost = $(this).attr("data-booliscost");
		let boolIsAvailability = $(this).attr("data-boolisavailability");
		let boolIsUnit = $(this).attr("data-boolIsUnit");

		$.ajax({
			type: "GET",
			url: "/PrintshopResourcesTemplate/GetValue",
			data: {
				"intValuePk": intValuePk,
				"boolIsCost": boolIsCost,
				"boolIsAvailability": boolIsAvailability,
				"boolIsUnit": boolIsUnit
			},
			dataType: "html",
			success: function (response) {
				let json = JSON.parse(response)

				if (json.intStatus == 200) {
					if (json.objResponse.unitinhe != null) {
						$("#unitinhejson").find("#strValue").val(json.objResponse.unitinhe.strValue)
						$("#unitinhejson").find("#boolIsDecimal").prop("checked", json.objResponse.unitinhe.boolnIsDecimal)
						//$("#unitinhejson").find("#boolnIsChangeable").prop('checked', json.objResponse.unitinhe.boolnIsChangeable)
						//$("#unitinhejson").find("#boolnIsInherited").prop('checked', json.objResponse.unitinhe.boolnIsInherited)

						$("#addXJDFForm").find("#strUnitResourceForm").val(json.objResponse.unitinhe.strValue)
					}
					else if (json.objResponse.costinhe != null) {
						$("#costinhejson").find("#numnCost").val(json.objResponse.costinhe.numnCost);
						$("#costinhejson").find("#numnQuantity").val(json.objResponse.costinhe.numnQuantity);
						$("#costinhejson").find("#numnMin").val(json.objResponse.costinhe.numnMin);
						$("#costinhejson").find("#numnBlock").val(json.objResponse.costinhe.numnBlock);
						$("#costinhejson").find("#numnHourlyRate").val(json.objResponse.costinhe.numnHourlyRate);
						$("#costinhejson").find("#intnPkAccount").val(json.objResponse.costinhe.intnPkAccount);
						//$("#costinhejson").find("#boolnIsChangeable").prop('checked', json.objResponse.costinhe.boolnIsChangeable)
						//$("#costinhejson").find("#boolnIsInherited").prop('checked', json.objResponse.costinhe.boolnIsInherited)

						if (
							(json.objResponse.costinhe.boolnArea != null) &&
							(json.objResponse.costinhe.boolnArea != undefined) &&
							(json.objResponse.costinhe.boolnArea != "")
						) {
							$("input[name=boolnArea]").val(json.objResponse.costinhe.boolnArea);

							if (
								json.objResponse.costinhe.boolnArea
							) {
								$("#boolnAreaSwitch").addClass("on");
							}
							else {
								$("#boolnAreaSwitch").removeClass("on");
							}
						}
					}
					else if (json.objResponse.avainhe != null) {
						$("#avainhejson").find("#boolnIsCalendar").prop('checked', json.objResponse.avainhe.boolnIsCalendar)
						$("#avainhejson").find("#boolnIsAvailable").prop('checked', json.objResponse.avainhe.boolnIsAvailable)

						if (json.objResponse.avainhe.boolnIsCalendar) {
							$("#avainhejson").find("#boolnIsCalendar").prop('checked', true)
						}
						else {
							$("#avainhejson").find("#boolnIsAvailable").prop('checked', true)
						}
						//$("#avainhejson").find("#boolnIsChangeable").prop('checked', json.objResponse.avainhe.boolnIsChangeable)
						//$("#avainhejson").find("#boolnIsInherited").prop('checked', json.objResponse.avainhe.boolnIsInherited)
					}
					else if (json.objResponse.attr != null) {
						let element = button.parent().parent().parent().parent().prev().find(".last-element");
						if (element.is("input")) {
							element.val(json.objResponse.attr.strValue);
						}
						else if (element.is("select")) {
							element.val(json.objResponse.attr.strValue).change();
						}
					}
				}
				else {
					subSendNotification(json.strUserMessage, json.intStatus);
				}
			}
		});
		//console.info(intValuePk)
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".chkChange", function () {
		let check = $(this);
		//console.info(check);
		if ($(this).prop("checked")) {
			let element = check.parent().parent().parent().parent()
				.prev().find("input.last-element, select.last-element").prop("disabled", false);
		}
		else {
			//debugger
			let element = check.parent().parent().parent().parent()
				.prev().find("input.last-element, select.last-element").prop("disabled", true);
			let btnReset = check.parent().parent().next().find(".btnResetToParentValue").click();
			//console.info(btnReset)
		}

		//console.info(element);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".chkChangeInherit", function () {
		//debugger
		let check = $(this);
		let form = check.parent().parent().parent().parent().parent().parent().parent();

		if ($(this).prop("checked")) {
			let element = check.parent().parent().parent().parent().parent().parent().parent().parent()
				.find(".changeableElement").prop("disabled", false);

			form.find("#boolAreaSwitchDiv").addClass("boolAreaSwitch");
			form.find("#boolAreaSwitchDiv").children().removeClass("disabled");

			if (form[0].id == "unitinhejson") {
				$("#addXJDFForm").find("#strUnitResourceForm").prop("disabled", false);
				$("#addXJDFForm").find("#boolIsDecimal").prop("disabled", false);
			}
		}
		else {
			//debugger
			let element = check.parent().parent().parent().parent().parent().parent().parent().parent()
				.find(".changeableElement").prop("disabled", true);
			let btnReset = check.parent().parent().parent().next().find(".btnResetToParentValue").click();

			form.find("#boolAreaSwitchDiv").removeClass("boolAreaSwitch");
			form.find("#boolAreaSwitchDiv").children().addClass("disabled");

			if (form[0].id == "unitinhejson") {
				$("#addXJDFForm").find("#strUnitResourceForm").prop("disabled", true);
				$("#addXJDFForm").find("#boolIsDecimal").prop("disabled", true);
			}
			//console.info(btnReset)
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#addResource").click(function (e) {
		//debugger
		e.preventDefault();
		let boolIsPhysical = $(this).attr("data-boolIsPhysical");
		$(location).attr("href", "/PrintshopResourcesTemplate/AddXJDF?boolIsPhysical=" + boolIsPhysical);
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#physical-pill, #notPhysical-pill").click(function () {
		let arrstrId = $(this).attr("id").split('-');
		let boolIsPhysical = false;

		$("#resource-btn-custom-modal").prop("hidden", true);
		if (arrstrId[0] == "physical") {
			boolIsPhysical = true;
			$("#resource-btn-custom-modal").prop("hidden", false);
		}

		$("#addResource").attr("data-boolIsPhysical", boolIsPhysical);

		$.ajax({
			type: "GET",
			url: "/PrintshopResourcesTemplate/GetPrintshopTypes",
			data: {
				"boolIsPhysical": boolIsPhysical
			},
			beforeSend: function () {
				$("#" + arrstrId[0]).html('<div class="col-sm-12 text-center"><i class="fa fa-spinner fa-pulse fa-3x ' +
					'fa-fw"></i><span class="sr-only" >Loading...</span ></div>');
			},
			success: function (objResponse) {
				if (
					objResponse.constructor.name === "Object"
				) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
				else {
					$("#" + arrstrId[0]).html(objResponse);
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".closeUnitDropdown", function () {
		$(".unitsList").css("display", "none");
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".showUnits").ready(function () {
		//$(".unitsList").css("width", "100% !important");
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".showUnits", function () {
		let unitsList = $(this).next();
		if (unitsList.css('display') != 'block') {
			unitsList.css("display", "block");

			$.ajax({
				type: "GET",
				url: "/PrintShopResourcesTemplate/GetUnitsMeasurement",
				success: function (objResponse) {
					if (objResponse.intStatus == 200) {
						unitsList.html("");
						unitsList.append('<div class="text-right pr-1 mb-0 closeUnitDropdown cursor-pointer"><i ' +
							'class="fa fa-times"></i></div>');
						$.each(objResponse.objResponse, function (index, value) {
							unitsList.append('<div class="display_box" style="color: #58585b; border-radius:0px;" ' +
								'data-unit-value="' + value + '">' + value + '</div>');
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
		} else {
			unitsList.css("display", "none");
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("keyup", ".showUnits", function () {
		//let unitsList = $(this).next();
		//unitsList.css("display", "block");
		$("#addXJDFForm").find("#strUnitResourceForm").val($(this).val())
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", "#boolIsDecimalInhe", function () {
		let boolIsDecimal = $(this).is(":checked");
		$("#addXJDFForm").find("#boolIsDecimal").prop("checked", boolIsDecimal);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".addCost", function (event) {
		event.preventDefault();
		arrdataResource = $(this).attr("data-intPk-strName").split("|");
		let intEstimationId = $(this).data("intestimationid");
		let boolDeviceToolOrCustom = $(this).attr("data-boolIsDeviceToolOrCustom");

		$.when(
			$.ajax({
				type: "GET",
				url: "/Calculation/GetAllAccounts",
				success: function (response) {
					var selectList = $('#costModal').find("#intnPkAccount");
					selectList.html("");
					selectList.append(new Option("Pick one", ""));
					if (response.length > 0) {
						for (var i = 0; i < response.length; i++) {
							var obj = response[i];
							option = document.createElement("option");
							option.value = obj.intPk;
							option.text = obj.strName;
							selectList.append(new Option(option.text, option.value));
						}
					}
				}
			})
		).then(function () {
			$.ajax({
				type: "GET",
				url: "/PrintshopResourcesTemplate/GetCostData",
				data: { "intPkResource": arrdataResource[0] },
				dataType: "html",
				async: false,
				beforeSend: function () {
					$("#newCost").find("#strDimensionUnit").parent().hide();
					$("#newCost").find("#strUnit").parent().show();
					$("#boolnAreaSwitch").removeClass("on");
					$("#costModalAreaSwitch").hide();
					$("#newCost").find("input[name=boolnArea]").val("");
				},
				success: function (response) {
					//debugger
					let json = JSON.parse(response);
					if (json.intStatus == 200) {
						$("#intPkResourceCost").val(json.objResponse.intPkResource);
						$("#strUnit").html(json.objResponse.strUnit);
						$("#strDimensionUnit").html(json.objResponse.strDimensionUnit + "<sup>2</sup>");
						$("#numQuantity").val(json.objResponse.numnQuantity);
						let numnCost = json.objResponse.numnCost;
						if (
							numnCost != null
						) {
							if (
								(numnCost + "").indexOf(".") >= 0
							) {
								let arrstrCost = (numnCost + "").split(".");
								if (
									arrstrCost[1].length == 1
								) {
									numnCost = Number(numnCost).toFixed(2);
								}
							}
						}
						$("#numCost").val(numnCost);
						$("#numnMin").val(json.objResponse.numnMin);
						$("#numnBlock").val(json.objResponse.numnBlock);
						$(".cost-title").html(arrdataResource[1]);
						$("#newCost").removeAttr("hidden");

						if (arrdataResource[2] == "False") {
							$(".isChangeable").prop("disabled", true);
						}

						if (
							boolDeviceToolOrCustom == "False"
						) {
							$("#numnHourlyRate").parent().parent().attr("hidden", true);
						}
						else {
							$("#numnHourlyRate").parent().parent().removeAttr("hidden");
							$("#numnHourlyRate").val(json.objResponse.numnHourlyRate);
						}

						$("#newCost").find("input[name=intEstimationId]").val(intEstimationId);

						if (
							json.objResponse.intnPkAccount != null
						) {
							$('#costModal').find("#intnPkAccount").val(json.objResponse.intnPkAccount)
						}

						if (
							(json.objResponse.boolPaper) &&
							(json.objResponse.strDimensionUnit != null &&
								json.objResponse.strDimensionUnit != "")
						) {
							$("#costModalAreaSwitch").show();
							$("#newCost").find("input[name=boolnArea]").val(false);

							if (
								json.objResponse.boolnArea
							) {
								$("#boolnAreaSwitch").addClass("on");
								$("#newCost").find("#strDimensionUnit").parent().show();
								$("#newCost").find("#strUnit").parent().hide();
							}

							if (
								(json.objResponse.boolnArea != null) &&
								(json.objResponse.boolnArea != undefined) &&
								(json.objResponse.boolnArea != "")
							) {
								$("#newCost").find("input[name=boolnArea]").val(json.objResponse.boolnArea);
							}
						}

						$('#costModal').modal('show');
					}
					else {
						subSendNotification(json.strUserMessage, json.intStatus);
					}
				}
			})
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#newCost").submit(function (e) {
		e.preventDefault();
		let numnMin = $("#costModal").find("#newCost").find("#numnMin").val();
		let numnBlock = $("#costModal").find("#newCost").find("#numnBlock").val();
		let boolIsEstimate = $("#costModal").find("#newCost").find("input[name=boolIsEstimate]").val();
		let intEstimationId = $("#costModal").find("#newCost").find("input[name=intEstimationId]").val();

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
					funSetCost(boolIsEstimate, intEstimationId);

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
					funSetCost(boolIsEstimate, intEstimationId);

					$("#confirmation-modal").modal('hide');
				});

				$("#modal-btn-no").bind("click", function () {
					$("#confirmation-modal").modal('hide');
				});
			}
			else {
				funSetCost(boolIsEstimate, intEstimationId);
			}
		}
		else {
			funSetCost(boolIsEstimate, intEstimationId);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".availability").click(function (event) {
		event.preventDefault();
		let intPkResource = $(this).data("intpkresource");
		let boolIsCalendar = $(this).data("booliscalendar");
		let boolnIsAvailable = $(this).data("boolnisavailable");

		subResourceAvailability(intPkResource, boolIsCalendar, boolnIsAvailable, true);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".switchAvailability").click(function () {
		let intPkResource = $(this).data("intpkresource");
		let boolnIsAvailable = !($("#resource-switch-" + intPkResource).attr("class") === "switch on");
		let strPrintshopId = $(this).data("printshopid");

		subResourceAvailability(intPkResource, false, boolnIsAvailable, false, strPrintshopId);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".addResourceTime", function (event) {
		event.preventDefault();
		arrdataResource = $(this).attr("data-intPk-strName").split("|");
		let intEstimationId = $(this).data("intestimationid");
		$("#newResourceTimeForm")[0].reset();
		$("#newResourceTimeForm").find("#lbl-unit-time-form").text(arrdataResource[2]);
		$("#newResourceTimeForm").find(".saveTime").prop("hidden", false);
		$("#newResourceTimeForm").find(".updateTime").prop("hidden", true);

		$.ajax({
			type: "GET",
			url: "/PrintshopResourcesTemplate/GetThicknessUnits",
			success: function (response) {
				var selectList = $('#timeModal').find("#strThicknessUnit");
				selectList.html("");
				selectList.append(new Option("Pick one", ""));
				if (response.length > 0) {
					for (var i = 0; i < response.length; i++) {
						var obj = response[i];
						option = document.createElement("option");
						option.value = obj;
						option.text = obj;
						selectList.append(new Option(option.text, option.value));
					}
				}
			}
		});
		funGetTimes(arrdataResource[0], arrdataResource[1], intEstimationId)
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnDeleteTime", function (event) {
		event.preventDefault();
		let intPkTime = $(this).attr("id");

		let tableElement = $(this).closest('table');
		let tbodyElement = $(this).closest('tbody');
		let totalRows = $('tr', $(tableElement).find('tbody')).length - 1;

		$.ajax({
			type: "GET",
			url: "/PrintshopResourcesTemplate/DeleteTime",
			data: {
				"intPkTime": intPkTime
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					$("#rowTime_" + intPkTime).remove();

					if (totalRows == 0) {

						tbodyElement.append('<tr class="tr-calculation-row"><td colspan="15">This section contains' +
							' no records.</td></tr>');
					}
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnEditTime", function (event) {
		event.preventDefault();
		let intPkTime = $(this).attr("id");

		$.ajax({
			type: "GET",
			url: "/PrintshopResourcesTemplate/GetTimeData",
			data: {
				"intPkTime": intPkTime
			},
			success: function (response) {
				if (
					response.intStatus == 200
				) {
					$("#newResourceTimeForm").find("input[name=intPkTime]").val(response.objResponse.intPkTime);
					$("#newResourceTimeForm").find("input[name=numQuantity]").val(response.objResponse.numQuantity);
					$("#newResourceTimeForm").find("#lbl-unit-time-form").text(response.objResponse.strUnit);
					$("#newResourceTimeForm").find("select[name=intHours]").val(response.objResponse.intHours);
					$("#newResourceTimeForm").find("select[name=intMinutes]").val(response.objResponse.intMinutes);
					$("#newResourceTimeForm").find("select[name=intSeconds]").val(response.objResponse.intSeconds);
					$("#newResourceTimeForm").find("input[name=numnMinThickness]").val(response.objResponse.numnMinThickness);
					$("#newResourceTimeForm").find("input[name=numnMaxThickness]").val(response.objResponse.numnMaxThickness);
					$("#newResourceTimeForm").find("select[name=strThicknessUnit]").val(response.objResponse.strThicknessUnit);

					$("#newResourceTimeForm").find(".saveTime").prop("hidden", true);
					$("#newResourceTimeForm").find(".updateTime").prop("hidden", false);

					$(".btnEditTime").prop("disabled", true);
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#newResourceTimeForm").submit(function (event) {
		event.preventDefault();
		let boolIsEstimate = $("#timeModal").find("#newResourceTimeForm").find("input[name=boolIsEstimate]").val();
		let intEstimationId = $("#timeModal").find("#newResourceTimeForm").find("input[name=intEstimationId]").val();
		let intPkResource = $("#timeModal").find("#newResourceTimeForm").find("input[name=intPkResource]").val();
		let strResourceName = $("#timeModal").find(".time-title").text();
		let intPkTime = $("#timeModal").find("#newResourceTimeForm").find("input[name=intPkTime]").val();

		let strUrl = "/PrintshopResourcesTemplate/AddTime";
		if (
			intPkTime != "" && intPkTime > 0
		) {
			strUrl = "/PrintshopResourcesTemplate/UpdateTime"
		}

		$.ajax({
			type: "POST",
			url: strUrl,
			data: $(this).serialize(),
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {

					if (
						intEstimationId != ""
					) {
						getEstimate(
							$("#strJobId").val(),
							$("#intPkWorkflow").val(),
							intEstimationId,
							null,
							null,
							$("#collapse_" + intEstimationId).find(".card-body")
						);
						$("#newResourceTimeForm")[0].reset();
						$("#newResourceTimeForm").find(".saveTime").prop("hidden", false);
						$("#newResourceTimeForm").find(".updateTime").prop("hidden", true);
						$('#timeModal').modal('hide');
					} else {
						funGetTimes(intPkResource, strResourceName, intEstimationId);
						$("#newResourceTimeForm")[0].reset();
						$("#newResourceTimeForm").find(".saveTime").prop("hidden", false);
						$("#newResourceTimeForm").find(".updateTime").prop("hidden", true);
					}

					$("#timeModal").find("#newResourceTimeForm").find("input[name=intPkTime]").val("");
					$(".btnEditTime").prop("disabled", false);
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".intnPkInheritedValue", function () {
		let changeable_element = $(this).parent().parent().next().find("#boolnIsChangeable");
		if ($(this).is(":checked")) {
			changeable_element.prop('checked', false);
			changeable_element.change();
		}
		else {
			changeable_element.prop('checked', true);
			changeable_element.change();
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#inheritedBtnModal", function () {
		let intPkTemplateOrResource = $("#intPkResource").val() == 0 ?
			$("#intnInheritedPk").val() : $("#intPkResource").val();

		let intPkTemplate = $("#intnInheritedPk").val();

		if (intPkTemplate == "") {
			$("#intnInheritedPk").focus();
		}
		else {
			if (intPkTemplateOrResource != intPkTemplateOrResourceTemp) {
				$.when(
					$.ajax({
						type: "GET",
						url: "/Calculation/GetAllAccounts",
						success: function (response) {
							var selectList = $('#inheritedModal').find("#intnPkAccount");
							selectList.html("");
							selectList.append(new Option("Pick one", ""));
							if (response.length > 0) {
								for (var i = 0; i < response.length; i++) {
									var obj = response[i];
									option = document.createElement("option");
									option.value = obj.intPk;
									option.text = obj.strName;
									selectList.append(new Option(option.text, option.value));
								}
							}
						}
					})
				).then(function () {
					$.ajax({
						type: "POST",
						url: "/PrintshopResourcesTemplate/GetInheritanceData",
						data: { "intPkTemplateOrResource": intPkTemplateOrResource },
						success: function (objResponse) {
							let json = objResponse;
							if (
								json.intStatus == 200
							) {
								let numnCost = json.objResponse.costinhe.numnCost;
								if (
									numnCost != null
								) {
									if (
										(numnCost + "").indexOf(".") >= 0
									) {
										let arrstrCost = (numnCost + "").split(".");
										if (
											arrstrCost[1].length == 1
										) {
											numnCost = Number(numnCost).toFixed(2);
										}
									}
								}
								$("#costinhejson").find("#numnCost").val(numnCost);
								$("#costinhejson").find("#numnQuantity").val(json.objResponse.costinhe.numnQuantity);
								$("#costinhejson").find("#numnMin").val(json.objResponse.costinhe.numnMin);
								$("#costinhejson").find("#numnBlock").val(json.objResponse.costinhe.numnBlock);
								$('#inheritedModal').find("#intnPkAccount").val(json.objResponse.costinhe.intnPkAccount);
								$("#costinhejson").find("#boolnIsInheritedCost").val(intPkTemplate);
								$("#costinhejson").find("#numnHourlyRate").val(json.objResponse.costinhe.numnHourlyRate);

								$("#unitinhejson").find("#strValue").val(json.objResponse.unitinhe.strValue);
								$("#unitinhejson").find("#boolIsDecimalInhe").prop("checked",
									json.objResponse.unitinhe.boolnIsDecimal);
								$("#unitinhejson").find("#boolnIsInheritedUnit").val(intPkTemplate);

								$("#addXJDFForm").find("#strUnitResourceForm").prop("disabled", true);
								$("#addXJDFForm").find("#strUnitResourceForm").next().css("display", "none");
								$("#addXJDFForm").find("#strUnitResourceForm").val(json.objResponse.unitinhe.strValue);
								$("#addXJDFForm").find("#boolIsDecimal").prop("checked",
									json.objResponse.unitinhe.boolnIsDecimal);

								if ($("#strResName").val() != "" && $("#strUnitResourceForm").val() != "") {
									$("#saveResForm").show();
								}

								if (json.objResponse.boolIsDeviceToolOrCustom) {
									if (json.objResponse.avainhe.boolnIsCalendar) {
										$("#avainhejson").find("#boolnIsCalendar").prop('checked', true);
									}
									else {
										$("#avainhejson").find("#boolnIsAvailable").prop('checked', true);
									}
									$("#avainhejson").find("#boolnIsInheritedAvailability").val(intPkTemplate)
									$("#costinhejson").find("#numnHourlyRate").parent().parent().removeAttr("hidden");
								}
								else {
									$("#inheritAvailability").hide();
									$("#costinhejson").find("#numnHourlyRate").parent().parent().attr("hidden", true);
								}

								$(".chkChangeInherit").parent().parent().parent().parent().parent().parent().parent()
									.find(".changeableElement").prop("disabled", true);

								if ($("#intPkResource").val() != 0) {
									$("#costinhejson").find("#boolnIsChangeableCost").prop('checked', json.objResponse.costinhe.boolnIsChangeable)
									$("#costinhejson").find("#boolnIsInheritedCost").prop('checked', json.objResponse.costinhe.boolnIsInherited)
									if (json.objResponse.costinhe.boolnIsChangeable) {
										$("#costinhejson").find(".changeableElement").prop("disabled", false);
									}

									$("#unitinhejson").find("#boolnIsChangeableUnit").prop('checked', json.objResponse.unitinhe.boolnIsChangeable)
									$("#unitinhejson").find("#boolnIsInheritedUnit").prop('checked', json.objResponse.unitinhe.boolnIsInherited)
									if (json.objResponse.unitinhe.boolnIsChangeable) {
										$("#unitinhejson").find(".changeableElement").prop("disabled", false);
										$("#addXJDFForm").find("#strUnitResourceForm").prop("disabled", false);
									}

									$("#avainhejson").find("#boolnIsChangeableAvailability").prop('checked', json.objResponse.avainhe.boolnIsChangeable)
									$("#avainhejson").find("#boolnIsInheritedAvailability").prop('checked', json.objResponse.avainhe.boolnIsInherited)
									if (json.objResponse.avainhe.boolnIsChangeable) {
										$("#avainhejson").find(".changeableElement").prop("disabled", false);
									}
								}

								$("#costModalAreaSwitch").hide();
								if (
									(json.objResponse.costinhe.boolnArea != null) &&
									(json.objResponse.costinhe.boolnArea != undefined)
								) {
									$("#costModalAreaSwitch").show();
									$("#costinhejson").find("input[name=boolnArea]").val(json.objResponse.costinhe.boolnArea);

									if (
										json.objResponse.costinhe.boolnArea
									) {
										$("#boolnAreaSwitch").addClass("on");
									}

									$("#boolnAreaSwitch").parent().addClass("disabled");
									if (json.objResponse.costinhe.boolnIsChangeable) {
										$("#boolnAreaSwitch").parent().removeClass("disabled");
										$("#boolAreaSwitchDiv").addClass("boolAreaSwitch");
									}
								}

								intPkTemplateOrResourceTemp = intPkTemplateOrResource;

								$("#inheritedModal").modal("show");
							}

							subSendNotification(json.strUserMessage, objResponse.intStatus);
						},
						error: function () {
							subSendNotification("Something is wrong.", 400);
						}
					});
				});
			}
			else {
				$("#inheritedModal").modal("show");
			}
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#inheritedModal").on('shown.bs.modal', function () {
		$(this).unbind()
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".saveInheritedData", function () {
		let numnMin = $("#costinhejson").find("#numnMin").val();
		let numnBlock = $("#costinhejson").find("[name='numnBlock']").val();

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
					funSaveInheritanceData(numnBlock, numnBlock);;
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
					funSaveInheritanceData(numMinFinal, numnBlock);
					$("#confirmation-modal").modal('hide');
				});

				$("#modal-btn-no").bind("click", function () {
					$("#confirmation-modal").modal('hide');
				});
			}
			else {
				funSaveInheritanceData(numnMin, numnBlock);
			}
		}
		else {
			funSaveInheritanceData(numnMin, numnBlock);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
});

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function addElements(intResourcePk, intAttributePk, divFormId, boolIsInherited, boolIsForEdit) {
	let json = null;
	let intPkType = $("#intPkType").val();
	//debugger
	$.when(
		$.ajax({
			type: "GET",
			url: "/PrintshopResourcesTemplate/GetAscendantsPkAndValue",
			data: { "intResourcePk": intResourcePk, "intAttributePk": intAttributePk },
			dataType: "html",
			async: false,
			success: function (response) {
				//debugger
				json = JSON.parse(response);
				//console.info(json)
			}
		})
	).then(function () {
		arrAscendantPk = json.arrAscendantPk;
		strValue = json.strValue;
		createForm(intPkType, 1, json.arrAscendantPk[0], divFormId, null, false, boolIsInherited, json.intValuePk, false);
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function createForm(intResPk, childCount, valSelected, divFormId, intValuePk, boolIsNewForm, boolIsInherited,
	intnPkValueInherited, boolChangeable, boolIsBlocked) {
	$.ajax({
		type: "POST",
		url: "/Calculation/GetAttributeList",
		data: { 'intPk': intResPk },
		dataType: "html",
		async: false,
		success: function (response) {
			var json = JSON.parse(response);
			var countId = null
			if (divFormId != "") {
				$("#dynamicElements").append('<br/><div class="card-form p-3 border" id="' + divFormId + '">' +
					'</div>');
				countId = divFormId;
			}
			else {
				$("#dynamicElements").append('<br/><div class="card-form p-3 border" id="' + childCount + '">' +
					'</div>');
				countId = childCount;
			}

			var parentDiv = $("#dynamicElements").children("div").last();
			parentDiv.append('<div class="row"></div>');
			var parentRow = parentDiv.children("div");
			parentRow.append('<div class="col-sm-8 ascendantForm child-dynamic" id="select_' + countId + '"></div>');
			parentRow.append('<div class="col-sm-3 configForm" id="toggle_' + countId + '"></div>');
			parentRow.append('<div class="col-sm-1" id="times_' + countId + '"></div>');

			var position = parentDiv.position();

			parentDiv.find("#select_" + countId).append('<form class="form-horizontal" id="fromRes"></form>');

			let chkintnInheritedValuePk = null;
			let chkboolChangeable = null;
			let btnReset = null;
			if (boolIsInherited) {
				chkintnInheritedValuePk = '<div class="custom-control custom-checkbox dropdown-item ml-2">' +
					'<input type="checkbox" class="custom-control-input chkInherit" id="intnPkInheritedValue_' +
					intnPkValueInherited + '" name="intnPkInheritedValue_' + intnPkValueInherited + '" value="' +
					intnPkValueInherited + '" checked>' + '<label class= "custom-control-label checkbox-label"' +
					' for="intnPkInheritedValue_' + intnPkValueInherited + '">' + 'Inherited' + '</label></div>';

				if (boolChangeable) {
					chkboolChangeable = '<div class="custom-control custom-checkbox dropdown-item ml-2">' +
						'<input type="checkbox" class="custom-control-input chkChange" id="boolChangeable_' +
						intnPkValueInherited + '" name="boolChangeable_' + intnPkValueInherited + '" value="" checked>' +
						'<label class= "custom-control-label checkbox-label" for="boolChangeable_' +
						intnPkValueInherited + '">' + 'Changeable' + '</label></div>';
				}
				else {
					chkboolChangeable = '<div class="custom-control custom-checkbox dropdown-item ml-2">' +
						'<input type="checkbox" class="custom-control-input chkChange" id="boolChangeable_' +
						intnPkValueInherited + '" name="boolChangeable_' + intnPkValueInherited + '" value="">' +
						'<label class= "custom-control-label checkbox-label" for="boolChangeable_' +
						intnPkValueInherited + '">' + 'Changeable' + '</label></div>';
				}

				btnReset = '<div class="form-group dropdown-item">' +
					'<button type="button" data-booliscost="false" data-boolisavailability="false" data-boolIsUnit="false" ' +
					'class="btn btn-secondary btn-sm col-sm-12 btnResetToParentValue">Reset</button>' +
					'</div>';
			}
			else {
				boolChangeable = true;
				chkintnInheritedValuePk = "";
				chkboolChangeable = '<div class="custom-control custom-checkbox dropdown-item ml-2">' +
					'<input type="checkbox" class="custom-control-input chkChange" id="boolChangeable_' +
					intnPkValueInherited + '" name="boolChangeable_' + intnPkValueInherited + '" value="" checked disabled>' +
					'<label class= "custom-control-label checkbox-label" for="boolChangeable_' +
					intnPkValueInherited + '">' + 'Changeable' + '</label></div>'
				btnReset = "";
			}

			parentDiv.find("#toggle_" + countId).append('<div class="dropdown">' +
				'<button class="btn btn-info btn-sm dropdown-toggle text-left" type="button" ' +
				'id="dropdownConfigurartions" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
				'<i class="fa fa-cog" aria-hidden="true"></i> Configuration' +
				'</button><div class= "dropdown-menu" aria-labelledby="dropdownConfigurartions">' +
				chkintnInheritedValuePk +
				chkboolChangeable +
				btnReset +
				'</div>' +
				'</div>');

			parentDiv.find("#times_" + countId).append('<button type="button" class="btn btn-danger btn-sm removeResourceForm"' +
				'data-res-card="' + countId + '"><i class="fa fa-trash-o" aria-hidden="true"></i></button>');

			var parentForm = parentDiv.find("#select_" + countId).children("form").last();
			parentForm.append('<input type="hidden" name="intnPkValueToDeleteToAddANewOne" value="' + intValuePk + '"/>');
			parentForm.append('<span class="select child-dynamic" id="spanselect_' + childCount + '" style="width:500px"></span>');
			var spanForSelect = parentForm.find("#spanselect_" + childCount);

			var selectList = document.createElement("select");
			selectList.id = "child_" + childCount;
			selectList.className = "child-select-element";
			var option = document.createElement("option");
			option.value = "";
			option.text = "Pick one";
			selectList.appendChild(option);

			for (var i = 0; i < json.length; i++) {
				var obj = json[i];
				option = document.createElement("option");
				option.value = obj.intPk + "|" + obj.boolIsAttribute;
				option.text = obj.strName;
				selectList.appendChild(option);
			}

			spanForSelect.append(selectList);

			if (valSelected != "") {
				parentForm.find("#child_" + childCount + " option").each(function () {

					if (this.value == valSelected + "|true") {
						(parentForm.find("#child_" + childCount)).val(valSelected + "|true").change();
					}
					else if (this.value == valSelected + "|false") {
						(parentForm.find("#child_" + childCount)).val(valSelected + "|false").change();
					}

					if (boolChangeable) {
						isInherited = false;
					}
					else {
						isInherited = boolIsInherited;
					}
				});
			}
			isInherited = boolIsInherited;

			if (
				(boolIsBlocked != undefined && boolIsBlocked == true) || !boolChangeable
			) {
				parentDiv.find("#select_" + countId).children("form").find(".child-dynamic").prop("disabled", true);
				parentDiv.find("#select_" + countId).children("form").find("select").prop("disabled", true);

				if (
					boolIsBlocked
				) {
					parentDiv.find("#toggle_" + countId).find("#dropdownConfigurartions").prop("disabled", true);
					parentDiv.find("#times_" + countId).find(".removeResourceForm").prop("disabled", true);
				}
			}
			else {
				parentDiv.find("#select_" + countId).children("form").find(".child-dynamic").prop("disabled", false);
				parentDiv.find("#select_" + countId).children("form").find("select").prop("disabled", false);

				parentDiv.find("#toggle_" + countId).find("#dropdownConfigurartions").prop("disabled", false);

				parentDiv.find("#times_" + countId).find(".removeResourceForm").prop("disabled", false);
			}
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function countAndDeleteChildElements(form, currentId) {
	//
	var childCountSelect = form.children("span").length;
	var childCountInput = form.children("input").length;
	var childCount = parseInt(childCountSelect) + parseInt(childCountInput) + 1;
	var intId = currentId.split("_");
	var elements = form.find(".child-dynamic").length;
	if (elements > 0) {
		form.find(".child-dynamic").each(function (index, value) {
			//
			var currentvalue = value.id;
			var currentId = currentvalue.split("_");
			if (currentId[1] > intId[1]) {
				form.find("#" + value.id).remove();
				childCount = childCount - 1;
			}
		});
	}
	return childCount;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subResourceAvailability(intPkResource_I, boolIsCalendar_I, boolnIsAvailable_I, boolReloadPage_I,
	strPrintshopId_I) {
	$.ajax({
		type: "POST",
		url: "/PrintshopResourcesTemplate/Availability",
		data: {
			"intPkResource": intPkResource_I,
			"boolIsCalendar": boolIsCalendar_I,
			"boolnIsAvailable": boolnIsAvailable_I
		},
		success: function (objResponse) {
			if (
				objResponse.intStatus == 200
			) {
				if (objResponse.boolSendNotification) {
					var connectionId = sessionStorage.getItem('conectionId');
					connection.invoke("SendToAll", connectionId, strPrintshopId_I,
						objResponse.strNotificationMessage);
				}

				if (objResponse.boolReduceNotifications) {
					var connectionId = sessionStorage.getItem('conectionId');
					connection.invoke("ReduceToAll", strPrintshopId_I);
				}

				if (
					boolnIsAvailable_I
				) {
					$("#resource-switch-" + intPkResource_I).addClass("on");
				}
				else {
					$("#resource-switch-" + intPkResource_I).removeClass("on");
				}

				if (
					boolReloadPage_I
				) {
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

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funSaveInheritanceData(numnMin, numnBlock) {
	let strUnit = $("#unitinhejson").find("#strValue").val();

	if (parseFloat(strUnit)) {
		subSendNotification("Unit of measurement is invalid", 400);
	}
	else {
		$("#costinhejson").find("#numnMin").val(numnMin);
		$("#costinhejson").find("[name='numnBlock']").val(numnBlock);

		let unitinhejson = {
			"strValue": $("#unitinhejson").find("#strValue").val(),
			"boolnIsDecimal": $("#unitinhejson").find("#boolIsDecimalInhe").is(":checked"),
			"boolnIsChangeable": $("#unitinhejson").find("#boolnIsChangeableUnit").is(":checked"),
			"boolnIsInherited": $("#unitinhejson").find("#boolnIsInheritedUnit").is(":checked")
		};

		let costinhejson = {
			"numnCost": $("#costinhejson").find("#numnCost").val(),
			"numnQuantity": $("#costinhejson").find("#numnQuantity").val(),
			"numnMin": $("#costinhejson").find("#numnMin").val(),
			"numnBlock": $("#costinhejson").find("[name='numnBlock']").val(),
			"boolnIsChangeable": $("#costinhejson").find("#boolnIsChangeableCost").is(":checked"),
			"boolnIsInherited": $("#costinhejson").find("#boolnIsInheritedCost").is(":checked"),
			"intnPkAccount": $("#costinhejson").find("#intnPkAccount").val(),
			"numnHourlyRate": $("#costinhejson").find("#numnHourlyRate").val(),
			"boolnArea": $("#costinhejson").find("input[name=boolnArea]").val(),
		};

		let avainhejson = {
			"boolnIsCalendar": $("#avainhejson").find("#boolnIsCalendar").is(":checked"),
			"boolnIsAvailable": $("#avainhejson").find("#boolnIsAvailable").is(":checked"),
			"boolnIsChangeable": $("#avainhejson").find("#boolnIsChangeableAvailability").is(":checked"),
			"boolnIsInherited": $("#avainhejson").find("#boolnIsInheritedAvailability").is(":checked")
		};

		objInherited = {
			"unit": unitinhejson,
			"cost": costinhejson,
			"avai": avainhejson
		};

		//console.info(objInherited)
		$("#inheritedModal").modal("hide");
	}
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funSetCost(boolIsEstimate, intEstimationId) {
	let formData = $("#newCost").serialize();
	console.info(formData);

	$.ajax({
		type: "POST",
		url: "/PrintshopResourcesTemplate/AddCost",
		data: formData,
		dataType: "html",
		success: function (response) {
			let json = JSON.parse(response);
			if (
				json.intStatus == 200
			) {
				if (
					boolIsEstimate != null && boolIsEstimate == "True"
				) {
					getEstimate(
						$("#strJobId").val(),
						$("#intPkWorkflow").val(),
						intEstimationId,
						null,
						null,
						$("#collapse_" + intEstimationId).find(".card-body")
					);
				}

				$('#costModal').modal('hide');
				subSendNotification(json.strUserMessage, json.intStatus);
			}
			else {
				subSendNotification(json.strUserMessage, json.intStatus);
			}

		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funGetArrayOfAttributes(
	//                                                  //Get all the attributes added by the user and 
) {
	var arrattr = [];
	var intEmptyField = 0;

	//                                                  //Go trough all the attribute forms added by the user.
	$("#dynamicElements").find(".card-form").each(function (index, value) {

		var div = $(this);
		div.children("div.row").each(function (index, value) {

			//                                          //Initialize the elements of the object.
			var strAscendant = "";
			var strValue = "";
			var intnPkInheritedValue = null;
			var boolIsChangeable = null;
			var intnPkValueToDeleteToAddANewOne = null;

			var row = $(this);
			row.children("div.ascendantForm").each(function (index, value) {

				var childDiv = $(this);
				childDiv.children("form").each(function (index, value) {

					var form = $(this);
					intnPkValueToDeleteToAddANewOne = form.find("input[name=intnPkValueToDeleteToAddANewOne]").val();

					//                                  //Go trough every input/dropdown of the attribute form.
					form.find(".child-dynamic").each(function (index, value) {
						let strNumberId = value.id.split("_")[1];
						//                              //To easy code.
						var tempElement = form.find("#child_" + strNumberId);
						var strVal = form.find("#child_" + strNumberId).val().split("|")[0];

						if (
							//                          //It is the value section.
							tempElement.hasClass("last-element")
						) {
							if (
								//                      //Value is not empty.
								strVal != ""
							) {
								//                      //Assign it.
								strValue = strVal;
							}
							else {
								//                      //There is an attribute without value assigned.
								intEmptyField = intEmptyField + 1;
							}
						}
						else {
							//                          //It is an ascendant.
							if (
								//                      //Ascendant is not empty.
								strVal != ""
							) {
								//                      //Add the ascendant to the string.
								strAscendant = strAscendant + "|" + strVal;
							}
							else {
								//                      //There is an attribute without value assigned.
								intEmptyField = intEmptyField + 1;
							}
						}
					});
				});
			});

			//                                          //Go trough config section.
			row.children("div.configForm").each(function (index, value) {

				var childDiv = $(this);
				if (
					//                                  //It is inherited.
					childDiv.find(".chkInherit").is(":checked")
				) {
					//                                  //Get the value of the inheritance.
					intnPkInheritedValue = childDiv.find(".chkInherit").val();
				}
				else {
					intnPkInheritedValue = null;
				}

				if (
					//                                  //It is changeable.
					childDiv.find(".chkChange").is(":checked")
				) {
					//                                  //Save the changeable config.
					boolIsChangeable = childDiv.find(".chkChange").is(":checked");
				}
				else {
					boolIsChangeable = false;
				}
			});

			//                                          //Delete the last eparator char "|".
			strAscendant = strAscendant.substring(1);

			//                                          //Construct the attribute object.
			var attr = {
				"strAscendant": strAscendant,
				"strValue": strValue,
				"intnPkInheritedValue": intnPkInheritedValue,
				"intnInheritedValuePk": intnPkInheritedValue,
				"boolChangeable": boolIsChangeable,
				"intnPkValueToDeleteToAddANewOne": intnPkValueToDeleteToAddANewOne
			};

			//                                          //Add the attr to the array.
			arrattr.push(attr);
		});
	});

	return [arrattr, intEmptyField]
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funResourceIsAddable(
	//													//Function to add or delete resource. If it is successfull then
	//                                                  //      go to the My Resources screen at the resource root.

	//                                                  //Url to go to the controller, it could be for add or edit 
	//                                                  //      method.
	strUrl,
	//                                                  //Json/object with the resource data to be sent to the backend.
	objResourceData
) {
	$.ajax({
		type: "POST",
		url: "/PrintshopResourcesTemplate/IsAddable",
		data:
		{
			"intPkType": objResourceData.intPkType,
			"arrattr": objResourceData.arrattr
		},
		success: function (jsonResponse) {
			if (
				//                                      //The resource could be added or edited.
				jsonResponse.intStatus == 200
			) {
				if (
					//                                  //The resource is addable.
					jsonResponse.objResponse == true
				) {
					//                                  //Add resource.
					funAddOrEditResource(strUrl, objResourceData);
				}
				else {
					//                                  //Modal dialog first step.
					$("#confirmation-modal").modal('show');
					$("#myModalBody").html("<b>" + jsonResponse.strUserMessage + "</b>");

					$(".btnYesNo").css("display", "none");
					$(".btnOk").css("display", "block");

					$("#modal-btn-ok").unbind();

					//                                  //Hide the modal when ok is clicked.
					$("#modal-btn-ok").bind("click", function () {
						$("#confirmation-modal").modal('hide');
					});
				}
			}
			else {
				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
			}
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funAddOrEditResource(
	//													//Function to add or delete resource. If it is successfull then
	//                                                  //      go to the My Resources screen at the resource root.

	//                                                  //Url to go to the controller, it could be for add or edit 
	//                                                  //      method.
	strUrl,
	//                                                  //Json/object with the resource data to be sent to the backend.
	objResourceData
) {
	$.ajax({
		type: "POST",
		url: strUrl,
		data: objResourceData,
		success: function (jsonResponse) {
			if (
				//                                      //The resource could be added or edited.
				jsonResponse.intStatus == 200
			) {
				//                                      //Clean the cookie.
				Cookies.remove("showUnitOfMeasurement");

				//                                      //Set the path with the information returned by the backend.
				let path = "?intPk=" + jsonResponse.objResponse.intPk + "&boolIsType=" +
					jsonResponse.objResponse.boolIsType;

				//                                      //Go to the screen of My Resources at the resource root.
				$(location).attr("href", "/PrintshopResourcesTemplate/GetTemplatesAndResources" + path);
			}
			else {
				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
			}
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function funGetTimes(
	intPkResource,
	strResourceName,
	intEstimationId
) {
	$.ajax({
		type: "GET",
		url: "/PrintshopResourcesTemplate/GetTimes",
		data: {
			"intPkResource": intPkResource
		},
		success: function (response) {
			$("#ResourceTimeTable").html(response);
			$("#newResourceTimeForm").find("input[name=intPkResource]").val(intPkResource)
			$(".time-title").html(strResourceName);
			$("#newResourceTimeForm").find("input[name=intEstimationId]").val(intEstimationId);
			if (
				intEstimationId != ""
			) {
				$("#newResourceTimeForm").find("input[name=boolIsEstimate]").val("True");
			} else {
				$("#newResourceTimeForm").find("input[name=boolIsEstimate]").val("False");
			}

			$('#timeModal').modal('show');
		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
		}
	});
}
//----------------------------------------------------------------------------------------------------------------------
