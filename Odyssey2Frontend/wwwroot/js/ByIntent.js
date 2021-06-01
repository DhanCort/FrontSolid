$(document).ready(function () {
	$(".strAscendantElements").change(function () {
		//
		let dynamicElementSection = $(this).parent().parent().next().find("#dynamicElements");
		let formSection = $(this).parent().parent().parent();
		var childCount = deleteElements(dynamicElementSection);
		var intPkIntent = $(this).val()

        if (intPkIntent != "") {
            $.ajax({
                type: "POST",
                url: "/Calculation/GetAttributeList",
                data: { 'intPk': intPkIntent },
                dataType: "html",
                success: function (response) {
                    //
                    var json = JSON.parse(response);

                    var selectList = document.createElement("select");
                    selectList.id = "child_" + childCount;
					selectList.className = "form-control child-element child-dynamic";
					selectList.setAttribute("required", "true");
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

                    dynamicElementSection.append(selectList);
                    if (arrintPkSelectedvalue != null) {
                        formSection.find("#child_" + childCount + " option").each(function () {
                            //
                            if (this.value == arrintPkSelectedvalue[childCount] + "|true") {
                                formSection.find("#child_" + childCount).val(arrintPkSelectedvalue[childCount] + "|true").change();
                            }
                            else if (this.value == arrintPkSelectedvalue[childCount] + "|false") {
                                formSection.find("#child_" + childCount).val(arrintPkSelectedvalue[childCount] + "|false").change();
                            }
                        });
                    }
                }
            });
        }
    });

	$("#accordion3").on("change", ".child-element", function () {
		//
		let dynamicElementSection = $(this).parent();
		let formElement = $(this).parent().parent().parent();
        let value = $(this).val();
        if (value != "" && value != null) {
            var childCount = deleteChildElements($(this).attr("id"), formElement, dynamicElementSection);

            var intPk = $(this).val().split("|")[0];
            var boolIsAttribute = $(this).val().split("|")[1];
            $.ajax({
                type: "POST",
                url: "/Calculation/GetInfoList",
                data: { 'intPk': intPk, 'boolIsAttribute': boolIsAttribute },
                dataType: "html",
                success: function (response) {
                    //debugger
                    if (typeof response == 'undefined' || response == 'undefined') {
                        var input = document.createElement("input");
                        input.id = "child_" + childCount;
						input.className = "input form-control child-dynamic last-element";
						input.setAttribute("required", "true");
                        dynamicElementSection.append(input);
                        formElement.find("#child_" + childCount).val(strSelectedValue);
                    }
                    else if (response != "finish") {
                        var selectList = document.createElement("select");
                        selectList.id = "child_" + childCount;
						selectList.className = "form-control child-element child-dynamic";
						selectList.setAttribute("required", "true");
                        dynamicElementSection.append(selectList);

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
                                controltype = "int";
                            }
                        }

                        if (controltype == "int") {
                            if (arrintPkSelectedvalue != null) {
                                //formElement.find("#child_" + childCount).val(arrintPkSelectedvalue[childCount]).change();

                                formElement.find("#child_" + childCount + " option").each(function () {
                                    //
                                    if (this.value == arrintPkSelectedvalue[childCount] + "|true") {
                                        formElement.find("#child_" + childCount).val(arrintPkSelectedvalue[childCount] + "|true").change();
                                    }
                                    else if (this.value == arrintPkSelectedvalue[childCount] + "|false") {
                                        formElement.find("#child_" + childCount).val(arrintPkSelectedvalue[childCount] + "|false").change();
                                    }
                                });
                            }
                        }
                        else if (controltype == "string") {
                            formElement.find("#child_" + childCount).val(strSelectedValue);
                        }
                    }
                }
            });
        }
        else {
            deleteChildElements($(this).attr("id"), formElement, dynamicElementSection);
        }
    });

    //$("#calculationForm").find("#saveCalculation").click(function () {
	$(".calculation-form-intent").submit(function (e) {
		e.preventDefault();
        let elementForm = $(this);
        let emptyField = 0;
        //
		let intPk = elementForm.find("#intPk").val();
		let intPkProduct = elementForm.find("#intPkProduct").val();
		var strAscendantElements = elementForm.find("#strAscendantElements").val();

		var elements = elementForm.find(".child-dynamic").length - 1;
        var strXJDFValue = elementForm.find(".child-dynamic").last().val();
        if (strXJDFValue == "") {
            emptyField = emptyField + 1;
        }

        if (elements > 0) {
            elementForm.find(".child-dynamic").each(function (index, value) {
                var val = $("#" + value.id).val().split("|")[0];
                if (val == "" || val == null) {
                    emptyField = emptyField + 1;
                }
                else {
                    if (!val.match("[a-z]") && index != elements) {
                        strAscendantElements = strAscendantElements + "|" + val;
                    }
                }
            });
        }
        else {
            emptyField = emptyField + 1;
        }

        console.log(strAscendantElements)
        if (emptyField == 0) {
            var minValue = elementForm.find("#intnMinAmount").val();
            var maxValue = elementForm.find("#intnMaxAmount").val();
            var numCostValue = elementForm.find("#numnCost").val();
            var strConditionToApply = elementForm.find("#strConditionToApply").val();
            //var orderFormValue = $("#calculationForm").find("#strOrderFormValue").val();

            //var attributeValue = $("#calculationForm").find("#intnPkOrderFormAttribute").val();

            var boolIsEnable = elementForm.find('input[name=boolIsEnable]:checked', '#calculationForm').val();

            var strCalculationType = elementForm.find("#strCalculationType").val();

            var strDescription = elementForm.find("#strDescription").val();

            //													//For per quantity
            var intnTime = elementForm.find("#intnTime").val();
			var numnQuantity = elementForm.find("#numnQuantity").val();
			var boolnIsBlock = elementForm.find('input[name=boolnIsBlock]:checked', '#calculationForm').val();

            var obj = {
                "intPk": intPk,
                "intnPkProduct": intPkProduct,
                "intnMinAmount": minValue,
                "intnMaxAmount": maxValue,
                "numnCost": numCostValue,
                //"strOrderFormValue": orderFormValue,
                "strValue": strXJDFValue,
                "strAscendantElements": strAscendantElements,
                "strDescription": strDescription,
                //"intnPkOrderFormAttribute": attributeValue,
                "boolIsEnable": boolIsEnable,
                "strCalculationType": strCalculationType,
                "strConditionToApply": strConditionToApply,
                "intnTime": intnTime,
                "numnQuantity": numnQuantity,
                "boolnIsBlock": boolnIsBlock,
				"boolnIsByIntent": true,
				"strBy": elementForm.find("#strBy").val(),
				"numnMin": elementForm.find("#numnMin").val(),
				"numnMin": elementForm.find("#numnMin").val(),
			}

            $.ajax({
                type: "POST",
                url: elementForm.attr("action"),
                data: obj,
				success: function (response) {
					var objResponse = response;
					if (!(response.constructor.name === "Object")) {
						objResponse = JSON.parse(response);
					}

					if (
						objResponse.intStatus == 200
						)
					{
						elementForm.find(".delete-condition-to-apply").hide();
						elementForm.find(".openConditionToApplyModal").html("<b>Conditions to apply</b>");

						elementForm.find("#strAscendantElements").val("");
						elementForm.find("#strConditionToApply").val("");
						elementForm[0].reset();
						elementForm.find("#translatedCondition").hide();
						deleteElements(elementForm.find("#dynamicElements"));
						let strCalculationType = elementForm.data("strcalculationtype");
						let strHtmlSectionId = GetHtmlSection("intent", strCalculationType);

						elementForm.attr("action", "/Calculation/AddCalculation");
						elementForm.find(".btn-info").html("Add");

						GetCalculationData(intPkProduct, strCalculationType, strHtmlSectionId, false);
						strSelectedValue = null;
						arrintPkSelectedvalue = null;
						intPkSelectedResource = null;

						$(".delete-calculation").removeAttr("disabled");
					}

					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
                },
				error: function (xhr, status) {
					subSendNotification("Something is wrong.", 400);
                }
            });
        }
        else {
            //alert("Some fields are empty");
			elementForm.find("#calculationAlert").html('<br/><div class="alert alert-danger text-center"><strong>Invalid data.</strong></div>');
			elementForm.find("#calculationAlert").removeAttr("hidden");
			elementForm.find("#calculationAlert").fadeIn();
			elementForm.find("#calculationAlert").delay(3000).fadeOut("slow");
        }
    });
});

function deleteElements(dynamicElementSection) {
	dynamicElementSection.empty();
    childCount = 1;
    return childCount;
}

function deleteChildElements(currentId, formElement, dynamicElementSection) {
    //debugger
	var childCountSelect = dynamicElementSection.children("select").length;
    var childCountInput = dynamicElementSection.children("input").length;
    var childCount = parseInt(childCountSelect) + parseInt(childCountInput) + 1;
    var intId = currentId.split("_");
	var elements = formElement.find(".child-dynamic").length;
    if (elements > 0) {
        formElement.find(".child-dynamic").each(function (index, value) {
            //debugger
            var currentvalue = value.id;
            var currentId = currentvalue.split("_");
            if (currentId[1] > intId[1]) {
                formElement.find("#" + value.id).fadeOut("fast", function () {
                    formElement.find("#" + value.id).remove();
                }
                );
                childCount = childCount - 1;
            }
        });
    }
    return childCount;
}