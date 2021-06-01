var strConditionToApply = "";
var strUserConditionToApply = "";
var strConditionTranslated = "";
//let element = null;
var prevOrderAttribute = "";

//----------------------------------------------------------------------------------------------------------------------
$(document).ready(function () {
	$(document).on("change", ".select-condition", function () {
		let boolSetCondition = JSON.parse($("#boolSetCondition").val().toLowerCase());

		//
		$(".conditions-body").empty();
		let value = $(this).val();
		var elementId = $(this).attr("id");
		if (value != 0 && value != null) {
			if (strConditionToApply != "" && elementId != "select-condition") {
				if (value == "1") {
					strConditionToApply = createstrConditionToApply(elementId, strConditionToApply, "<^==}>", "operator");
					createElement(strConditionToApply);
				}
				else if (value == "2") {
					strConditionToApply = createstrConditionToApply(elementId, strConditionToApply, "<^!=}>", "operator");
					createElement(strConditionToApply);
				}
				else if (value == "3") {
					strConditionToApply = createstrConditionToApply(elementId, strConditionToApply, "<*AND*>", "operator");
					createElement(strConditionToApply);
				}
				else if (value == "4") {
					strConditionToApply = createstrConditionToApply(elementId, strConditionToApply, "<*OR*>", "operator");
					createElement(strConditionToApply);
				}
			}
			else {
				if (value == "1") {
					strConditionToApply = "<^==}>";
					createElement(strConditionToApply);
				}
				else if (value == "2") {
					strConditionToApply = "<^!=}>";
					createElement(strConditionToApply);
				}
				else if (value == "3") {
					strConditionToApply = "<*AND*>";
					createElement(strConditionToApply);

				}
				else if (value == "4") {
					strConditionToApply = "<*OR*>";
					createElement(strConditionToApply);
				}

			}
			strUserConditionToApply = cleanString(strConditionToApply);
			strConditionTranslated = translateConditionsToApply(elementId, strConditionToApply, "");

			if (
				boolSetCondition
			) {
				$("#conditionToApply").find("#strConditionToApply").val(strUserConditionToApply);
			}
			else {
				element.prev().val(strUserConditionToApply);
			}

			let boolConditionAnd = $("#switchConditionToApply").attr("Class") === "switch on";
			$("#boolConditionAnd").find("input").val(boolConditionAnd);
			element.closest("form").find("#boolConditionAnd").find("input").val(boolConditionAnd);

			element.closest("div").next().find("#translatedCondition").removeAttr("hidden").css("display",
				"block").html("<strong>" + replaceParenthesis(strConditionTranslated) + "</strong>");
			let strCleaned = replaceParenthesis(strConditionTranslated);
			$("#currentStrConditionsToApply").html("<strong>" + strCleaned + "</strong>");
			$(this).parent().remove();
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".orderFormValue", function () {
		let boolSetCondition = JSON.parse($("#boolSetCondition").val().toLowerCase());

		//
		let value = $(this).val();
		if (value != "Pick") {
			var elementId = $(this).attr("id");
			strConditionToApply = createstrConditionToApply(elementId, strConditionToApply, value, "value");
			strConditionTranslated = translateConditionsToApply(elementId, strConditionTranslated, value);

			if (
				boolSetCondition
			) {
				$("#conditionToApply").find("#strConditionToApply").val(strUserConditionToApply);
			}
			else {
				element.prev().val(strUserConditionToApply);
			}

			console.info("orderFormValue: " + strUserConditionToApply)
		}

		element.closest("div").next().find("#translatedCondition").removeAttr("hidden").css("display", "block").html("<strong>" + replaceParenthesis(removePipes(cleanString(strConditionTranslated))) + "</strong>")
		let strCleaned = replaceParenthesis(removePipes(cleanString(strConditionTranslated)));
		$("#currentStrConditionsToApply").html("<strong>" + strCleaned + "</strong>");
	});

	////------------------------------------------------------------------------------------------------------------------
	//$(document).on("click", ".openConditionToApplyModal", function () {
	//	element = $(this);
	//	let boolIsLink = $(this).data("boolislink");
	//	let boolSetCondition = $(this).data("boolsetcondition");
	//	let intnPkIn = $(this).data("intpkin");
	//	let intnPkOut = $(this).data("intpkout");

	//	var intnPkProduct = $("#intnPkProduct").val();
	//	$.ajax({
	//		type: "GET",
	//		url: "/Calculation/ConditionToApply",
	//		data: {
	//			"intPk": intnPkProduct,
	//			"boolIsLink": boolIsLink,
	//			"boolSetCondition": boolSetCondition
	//		},
	//		dataType: "html",
	//		beforeSend: function () {
	//			//$("#conditionToApply").html("<div class='col-sm-12 text-center'><img src='https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif' width='85' height='75'></div>")
	//			$("#conditionToApply").html('<div class="col-sm-12 text-center"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only"> Loading...</span ></div>');
	//		},
	//		success: function (response) {
	//			$("#conditionToApply").html(response);

	//			if (
	//				boolSetCondition != undefined &&
	//				(JSON.parse(boolSetCondition.toLowerCase()))
	//			) {
	//				$("#conditionToApply").find("#intnPkIn").val(intnPkIn);
	//				$("#conditionToApply").find("#intnPkOut").val(intnPkOut);
	//			}
	//		}
	//	});
	//});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".orderForm", function () {
		//
		let intPkAttribute = $(this).val();
		let strAttribute = $("#" + $(this).attr("id") + " option:selected").text();
		let boolSetCondition = JSON.parse($("#boolSetCondition").val().toLowerCase());

		if (intPkAttribute != "Pick") {

			var elementId = $(this).attr("id");
			strConditionToApply = createstrConditionToApply(elementId, strConditionToApply, intPkAttribute, "order");
			strConditionTranslated = translateConditionsToApply(elementId, strConditionTranslated, strAttribute);

			if (
				boolSetCondition
			) {
				$("#conditionToApply").find("#strConditionToApply").val(strUserConditionToApply);
			}
			else {
				element.prev().val(strUserConditionToApply);
			}
			console.info("orderForm: " + strUserConditionToApply)

			var arrstr = $(this).attr("id").split("_");
			elementId = $(this).attr("id").replace("condSelect_" + arrstr[1], "condValueSelect_" + (parseInt(arrstr[1]) + 1));
			$("#" + elementId).html("")
			$.ajax({
				type: "GET",
				url: "/Calculation/GetValuesForAnAttribute",
				data:
				{
					'intPkAttribute': intPkAttribute
				},
				dataType: "html",
				success: function (strResponse) {
					let objResponse = JSON.parse(strResponse);
					if (
						objResponse.intStatus == 200
					) {
						$("<option/>").val("Pick").text("Pick one").appendTo("#" + elementId);
						$.each(objResponse.objResponse, function () {
							$("<option/>").val(this.value).text(this.text).appendTo("#" + elementId);
						});
						strOrderFormValue = null;
						var selectedValue = selectValueFromAttribute("#" + elementId, strConditionToApply);
						if (selectedValue != "") {
							var elementSelectId = $("#" + elementId);
							elementSelectId.val(selectedValue).change();
						}
					}
					else {
						subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					}
				}
			})
		}

		element.closest("div").next().find("#translatedCondition").removeAttr("hidden").css("display", "block").html("<strong>" + replaceParenthesis(removePipes(cleanString(strConditionTranslated))) + "</strong>")
		let strCleaned = replaceParenthesis(removePipes(cleanString(strConditionTranslated)));
		$("#currentStrConditionsToApply").html("<strong>" + strCleaned + "</strong>");
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("focusout", "#inferiorLimitInputConditionToApply, #superiorLimitInputConditionToApply", function () {
		let boolSetCondition = JSON.parse($("#boolSetCondition").val().toLowerCase());
		if (
			!boolSetCondition
		) {
			if (
				(($("#inferiorLimitInputConditionToApply").val().length > 0) &&
					($("#inferiorLimitInputConditionToApply").val() > 0)) ||
				(($("#superiorLimitInputConditionToApply").val().length > 0) &&
					($("#superiorLimitInputConditionToApply").val() > 0))
			) {
				$("#numnInferiorLimitSection, #numnSuperiorLimitSection").removeAttr("hidden");

				if (
					$(this).attr("id") == "superiorLimitInputConditionToApply"
				) {
					$("#numnSuperiorLimitSection").find("input").val($(this).val());
					let boolConditionAnd = $("#switchConditionToApply").attr("Class") === "switch on";
					$("#boolConditionAnd").find("input").val(boolConditionAnd);
					element.closest("form").find("#intnMaxAmount").val($(this).val());
					element.closest("form").find("#boolConditionAnd").find("input").val(boolConditionAnd);
				}
				else {
					$("#numnInferiorLimitSection").find("input").val($(this).val());
					let boolConditionAnd = $("#switchConditionToApply").attr("Class") === "switch on";
					$("#boolConditionAnd").find("input").val(boolConditionAnd);
					element.closest("form").find("#intnMinAmount").val($(this).val());
					element.closest("form").find("#boolConditionAnd").find("input").val(boolConditionAnd);
				}
			}
			else {
				$("#numnInferiorLimitSection, #numnSuperiorLimitSection").attr("hidden", true);
			}
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".switchConditionToApply", function () {
		let boolConditionAnd = $("#switchConditionToApply").attr("Class") === "switch on";
		element.closest("form").find("#intnMaxAmount").val($(this).val());
		element.closest("form").find("#boolConditionAnd").find("input").val(boolConditionAnd);
	});
})

//----------------------------------------------------------------------------------------------------------------------
//															//SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function setConditionsToList(controlId) {
	$.ajax({
		type: "GET",
		url: "/Calculation/GetConditionList",
		dataType: "html",
		success: function (response) {
			let darr = JSON.parse(response);
			$.each(darr, function () {
				$("<option/>").val(this.intId).text(this.strCondition).appendTo(controlId);
			});
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getAttributes(controlId, strConditionToApply) {
	$.ajax({
		type: "GET",
		url: "/Calculation/GetAttributeList",
		dataType: "html",
		success: function (response) {
			let darr = JSON.parse(response);
			$("<option/>").val("Pick").text("Pick one").appendTo(controlId);
			$.each(darr, function () {
				$("<option/>").val(this.intPk).text(this.strCustomName).appendTo(controlId);
			});
			console.log(controlId)
			selectAttribute(controlId, strConditionToApply)
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function selectAttribute(controlId, strConditionToApply) {
	//
	var arrstr = controlId.split("_");
	var charLocation = arrstr[1];
	var count = 0;
	var position = 0;
	var subString = "";
	for (var i = 0; i < strConditionToApply.length; i++) {
		position = position + 1;
		var char = strConditionToApply.charAt(i);
		if (char == "^") {
			count = count + 1;
			if (count == charLocation) {
				var charTemp = strConditionToApply.charAt(i + 1);
				var countTemp = 0;
				var subStringTemp = "";
				while (charTemp != "=" && charTemp != "!") {
					countTemp = countTemp + 1;
					charTemp = strConditionToApply.charAt(i + countTemp);
					subStringTemp = subStringTemp + charTemp;
				}
				subString = subStringTemp.slice(0, -1);
				if (subString == "") {
					subString = "Pick";
				}
			}
		}
		else if (char == "}") {
			count = count + 1;
		}
		else if (char == "*") {
			count = count + 1;
		}
	}
	var elementSelectId = $(controlId);
	elementSelectId.val(subString).change();
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function selectValueFromAttribute(elementId, strConditionToApply) {
	var arrstr = elementId.split("_");
	var charLocation = arrstr[1];
	var count = 0;
	var position = 0;
	var valueSelected = "";
	for (var i = 0; i < strConditionToApply.length; i++) {
		position = position + 1;
		var char = strConditionToApply.charAt(i);
		if (char == "}") {
			count = count + 1;
			if (count == charLocation) {
				var charTemp = strConditionToApply.charAt(i + 1);
				var countTemp = 0;
				let openParenthesis = false;
				while (charTemp != ">") {
					countTemp = countTemp + 1;
					charTemp = strConditionToApply.charAt(i + countTemp);
					valueSelected = valueSelected + charTemp;
				}

				valueSelected = valueSelected.slice(0, -1);
			}
		}
		else if (char == "^") {
			count = count + 1;
		}
		else if (char == "*") {
			count = count + 1;
		}
	}

	return valueSelected;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
String.prototype.replaceAt = function (index, char) {
	var a = this.split("");
	a[index] = char;
	return a.join("");
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function createstrConditionToApply(elementId, currentString, inputString, type) {
	//
	var arrstr = elementId.split("_");
	var position = 0;
	var count = 0;
	var countAttr = 0;
	var newString = "";

	for (var i = 0; i < currentString.length; i++) {
		position = position + 1;
		var char = currentString.charAt(i);
		if (char == "*") {
			count = count + 1;
			if (count == arrstr[1] && type == "operator") {
				newString = currentString.replaceAt(position - 1, inputString);
			}
		}
		else if (char == "^") {
			count = count + 1;
			if (count == arrstr[1] && type == "order") {
				var charTemp = currentString.charAt(i + 1);
				if (charTemp == "=" || charTemp == "!") {
					newString = currentString.replaceAt(position - 1, "^" + inputString);
				}
				else {
					var subString = currentString;
					var countTemp = 0;
					var positionTemp = position;
					while (charTemp != "=" && charTemp != "!") {
						countTemp = countTemp + 1;
						charTemp = currentString.charAt(i + (countTemp + 1));
						subString = subString.replaceAt(positionTemp, '');
					}
					newString = subString.replaceAt(position - 1, "^" + inputString);
				}
			}
		}
		else if (char == "}") {
			count = count + 1;
			if (count == arrstr[1] && type == "value") {
				var charTemp = currentString.charAt(i + 1);
				if (charTemp == ">") {
					newString = currentString.replaceAt(position - 1, "}" + inputString);
				}
				else {
					var subString = currentString;
					var countTemp = 0;
					var positionTemp = position;
					while (charTemp != ">") {
						countTemp = countTemp + 1;
						charTemp = currentString.charAt(i + (countTemp + 1));
						subString = subString.replaceAt(positionTemp, '');
					}
					newString = subString.replaceAt(position - 1, "}" + inputString);
				}
			}
		}
	}
	strUserConditionToApply = cleanString(newString);
	return newString;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function createElement(strConditionToApply) {
	var childElements = deleteConditionalElements();
	for (var i = 0; i < strConditionToApply.length; i++) {
		var char = strConditionToApply.charAt(i);
		if (char == "<") {
			$(".conditions-body").append("(");
		}
		else if (char == "*" && (strConditionToApply.charAt(i + 1) != "^")) {
			childElements = childElements + 1;
			$(".conditions-body").append(" <span class='select'><select class='select-condition operator' " +
				"id='condSelect_" + childElements + "'></select></span> ");
			setConditionsToList("#condSelect_" + childElements);
		}
		else if (
			//												//It is an A from AND operator.
			((char == "A") && ((i + 2 < strConditionToApply.length) &&
			(strConditionToApply.charAt(i + 1) == "N") && (strConditionToApply.charAt(i + 2) == "D"))) ||
			//												//It is an N from AND operator.
			((char == "N") && ((i + 1 < strConditionToApply.length) && (i - 1 > 0) && 
			(strConditionToApply.charAt(i + 1) == "D") && (strConditionToApply.charAt(i - 1) == "A"))) ||
			//												//It is an D from AND operator.
			((char == "D") && ((i - 2 > 0) && (strConditionToApply.charAt(i - 1) == "N") &&
			(strConditionToApply.charAt(i - 2) == "A"))) ||
			//												//It is an O from OR operator.
			((char == "O") && (i + 1 < strConditionToApply.length) &&
			(strConditionToApply.charAt(i + 1) == "R")) ||
			//												//It is an R from OR operator.
			((char == "R") && (i - 1 > 0) && (strConditionToApply.charAt(i - 1) == "O")) ||
			(char == "=") || (char == "!")
		) {
			$(".conditions-body").append("<b>" + char + "</b>");
		}
		else if (char == ">") {
			$(".conditions-body").append(")");
		}
		else if (char == "^") {
			childElements = childElements + 1;
			$(".conditions-body").append(" <span class='select'><select class='attribute-Order-Form orderForm' " +
				"id='condSelect_" + childElements + "'></select></span> ");
			getAttributes("#condSelect_" + childElements, strConditionToApply);
		}
		else if (char == "}") {
			childElements = childElements + 1;
			$(".conditions-body").append(" <span class='select'><select class='orderFormValue' id='condValueSelect_" +
				childElements + "'></select></span>");
		}
	}
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function deleteConditionalElements() {
	var childElementsCount = $(".conditions-body").children("select").length;
	return childElementsCount;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function translateConditionsToApply(elementId, currentString, strAttribute) {
	//
	var arrstr = elementId.split("_");
	var position = 0;
	var count = 0;
	var countAttr = 0;
	var strTranslated = "";

	if (strAttribute != "") {
		for (var i = 0; i < currentString.length; i++) {
			position = position + 1;
			var char = currentString.charAt(i);
			if (char == "*") {
				count = count + 1;
			}
			else if (char == "^") {
				count = count + 1;
				if (count == arrstr[1]) {
					var charTemp = currentString.charAt(i + 1);
					var subString = currentString;
					var countTemp = 0;
					var positionTemp = position;
					while (charTemp != "=" && charTemp != "!") {
						countTemp = countTemp + 1;
						charTemp = currentString.charAt(i + (countTemp + 1));
						subString = subString.replaceAt(positionTemp, '');
					}
					strTranslated = subString.replaceAt(position - 1, "^" + strAttribute);
				}
			}
			else if (char == "}") {
				count = count + 1;
				if (count == arrstr[1]) {
					var charTemp = currentString.charAt(i + 1);
					if (charTemp == ">") {
						strTranslated = currentString.replaceAt(position - 1, "}" + strAttribute);
					}
					else {
						var subString = currentString;
						var countTemp = 0;
						var positionTemp = position;
						while (charTemp != ">") {
							countTemp = countTemp + 1;
							charTemp = currentString.charAt(i + (countTemp + 1));
							subString = subString.replaceAt(positionTemp, '');
						}
						strTranslated = subString.replaceAt(position - 1, "}" + strAttribute);
					}
				}
			}
		}
	}
	else {
		strTranslated = currentString;
	}
	strConditionTranslated = strTranslated;
	return strTranslated;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function cleanString(currentString) {
	//
	var arrstr = currentString.split('');
	var position = 0;
	var repeat = 0;

	for (var i = 0; i < arrstr.length; i++) {
		var char = arrstr[i];
		if (char == "^" || char == "}") {
			arrstr[i] = "";
		}
		else if (char == "*" && arrstr[i - 1] == "<") {
			arrstr[i] = "|";
		}
		else if (char == "*" && arrstr[i + 1] == ">") {
			arrstr[i] = "|";
		}
		else if (char == "=" && arrstr[i - 1] == "|!") {
			repeat = repeat + 1;
			arrstr[i] = "=|";
		}
		else if (char == "=" && arrstr[i + 1] == "=") {
			repeat = repeat + 1;
			arrstr[i] = "|=";
		}
		else if (char == "=") {
			repeat = repeat + 1;
			if (repeat == 1) {
				arrstr[i] = "|=";
			}
			else {
				arrstr[i] = "=|";
				repeat = 0;
			}
		}
		else if (char == "!") {
			arrstr[i] = "|!";
		}
		else if (char == "A" && arrstr[i - 1] == ">") {
			arrstr[i] = "|A";
		}
		else if (char == "O" && arrstr[i - 1] == ">") {
			arrstr[i] = "|O";
		}
		else if (char == "D" && arrstr[i + 1] == ">") {
			arrstr[i] = "D|";
		}
		else if (char == "D" && arrstr[i + 1] == "<") {
			arrstr[i] = "D|";
		}
		else if (char == "R" && arrstr[i + 1] == ">") {
			arrstr[i] = "R|";
		}
		else if (char == "R" && arrstr[i + 1] == "<") {
			arrstr[i] = "R|";
		}
	}

	cleanedString = arrstr.join('');
	return cleanedString.substring(1).slice(0, -1);
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function removePipes(strConditionTranslated_I) {
	//
	var arrstr = strConditionTranslated_I.split('');

	for (var i = 0; i < arrstr.length; i++) {
		var char = arrstr[i];
		if (char == "|") {
			arrstr[i] = "";
		}
	}

	strConditionTranslated_I = arrstr.join('');
	return strConditionTranslated_I;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function replaceParenthesis(strConditionTranslated_I) {
	var arrstr = strConditionTranslated_I.split('');

	for (var i = 0; i < arrstr.length; i++) {
		var char = arrstr[i];
		if (char == "<") {
			arrstr[i] = "(";
		}
		else if (char == ">") {
			arrstr[i] = ")";
		}
	}

	strConditionTranslated_I = arrstr.join('');
	return strConditionTranslated_I;
}