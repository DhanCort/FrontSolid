function deleteElements(strIntent) {
	$("#" + strIntent + "_IntentAttributeList").empty();

	childCount = 1;

	return childCount;
}

function getAttributes(strIntent) {
	var childCount = deleteElements(strIntent);

	var intPk = $("#" + strIntent + "_IntentList").val();
	$.ajax({
		type: "POST",
		url: "/Calculation/GetIntentAttributeList",
		data: { 'intPk': intPk, 'strIntent': strIntent },
		dataType: "html",
		success: function (response) {
			var selectList = document.createElement("select");
			selectList.id = strIntent + "element_" + childCount;
			selectList.className = "form-control intent-select " + strIntent + "_Class";
			selectList.onchange = function () { getValues(strIntent, strIntent + "element_" + childCount); }
			$("#" + strIntent + "_IntentAttributeList").append(selectList);

			var json = JSON.parse(response);

			var option = document.createElement("option");
			option.value = "";
			option.text = "Pick one";
			selectList.appendChild(option);

			for (var i = 0; i < json.length; i++) {
				var obj = json[i];
				option = document.createElement("option");
				option.value = obj.intPk;
				option.text = obj.strName;
				selectList.appendChild(option);
			}
			$("#" + strIntent + "_IntentAttributeList").fadeIn();
		}
	});
}

function getValues(strIntent, selectId) {
	var childCount = deleteSubElements(strIntent, selectId);

	var intPk = $("#" + selectId).val();

	$.ajax({
		type: "POST",
		url: "/Calculation/GetInfoList",
		data: { 'intPk': intPk },
		dataType: "html",
        success: function (response) {
            if (typeof response == 'undefined' || response == 'undefined') {
				var input = document.createElement("input");
				input.id = strIntent + "element_" + childCount;
				input.className = "input form-control intent-select " + strIntent + "_Class";
				$("#" + strIntent + "_IntentAttributeList").append(input);
				$("#" + strIntent + "_IntentAttributeList").fadeIn();
			}
			else if (response != "finish") {
				var selectList = document.createElement("select");
				selectList.id = strIntent + "element_" + childCount;
				selectList.className = "form-control intent-select " + strIntent + "_Class";
				selectList.onchange = function () { getValues(strIntent, strIntent + "element_" + childCount); }
				$("#" + strIntent + "_IntentAttributeList").append(selectList);

				var json = JSON.parse(response);

				var option = document.createElement("option");
				option.value = "";
				option.text = "Pick one";
				selectList.appendChild(option);

				for (var i = 0; i < json.length; i++) {
					var obj = json[i];
					option = document.createElement("option");
					if (typeof obj === "string") {
						option.value = obj;
						option.text = obj;
					}
					else {
						option.value = obj.intPk;
						option.text = obj.strName;
					}
					selectList.appendChild(option);
				}
				$("#" + strIntent + "_IntentAttributeList").fadeIn();
			}
		}
	});
}

function deleteSubElements(strIntent, selectId) {
	var childCountSelect = $("#" + strIntent + "_IntentAttributeList").children("select").length;
	var childCountInput = $("#" + strIntent + "_IntentAttributeList").children("input").length;
	var childCount = parseInt(childCountSelect) + parseInt(childCountInput) + 1;
	selectId = selectId.replace(strIntent, "");
	var intId = selectId.split("_");
	var elements = $("." + strIntent + "_Class").length;
	if (elements > 0) {
		$("." + strIntent + "_Class").each(function (index, value) {
			var currentvalue = value.id.replace(strIntent, "");
			var currentId = currentvalue.split("_");
			if (currentId[1] > intId[1]) {
				$("#" + value.id).fadeOut("fast", function () {
					$("#" + value.id).remove();
				}
				);
				childCount = childCount - 1;
			}
		});
	}

	return childCount;
}

function saveSpecifications(strIntent) {
    $("#attr-" + strIntent + "-table").html("<center><img src='https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif' width='85' height='75'></center>");

	let intPkProduct = $("#intPkProduct").val();
	var strAscendantElements = $("#" + strIntent + "_IntentList").val();
	var elements = $("." + strIntent + "_Class").length;
	var lastElement = $("." + strIntent + "_Class")[$("." + strIntent + "_Class").length - 1];
	var strXJDFValue = $("#" + lastElement.id).val();
	if (elements > 0) {
		$("." + strIntent + "_Class").each(function (index, value) {
			var className = $("#" + value.id).attr("class");
			if (!className.includes("input")) {
				var val = $("#" + value.id).val();
				if (!val.match("[a-z]")) {
					strAscendantElements = strAscendantElements + "|" + val;
				}
			}
        });

        console.log(strAscendantElements)

		var productValue = $("#" + strIntent + "_Product").val();
		var minValue = $("#" + strIntent + "_Min").val();
		var maxValue = $("#" + strIntent + "_Max").val();
		var numCostValue = $("#" + strIntent + "_PerUnit").val();
		var orderFormValue = $("#" + strIntent + "_OrderFormValue").val();

		var attributeValue = $("#" + strIntent + "_Attribute").val();
		var printshopValue = $("#" + strIntent + "_Printshop").val();

		var obj = {
			"intPkProduct": productValue,
			"intnMinAmount": minValue,
			"intnMaxAmount": maxValue,
			"numCost": numCostValue,
			"strOrderFormValue": orderFormValue,
			"strXJDFValue": strXJDFValue,
			"strAscendantElements": strAscendantElements,
			"strDescription": "",
			"intnPkAttribute": attributeValue,
			"strPrintshopId": printshopValue
		}

		console.info(obj)

		$.ajax({
			type: "POST",
			url: "/Calculation/AddBySpectCalculation",
            data: obj,
			success: function (response) {
				GetCalculationData(intPkProduct, attributeValue, strIntent);
			}
		});
	}
}

//------------------------------------------------------------------------------------------------------------------
$(".spect-calculations").click(function (event) {
	let boolAriaExpanded = $(this).attr("aria-expanded");
	if (boolAriaExpanded == "false") {
		let elementClasses = $(this).attr("class").split(" ");
		let intPkProduct = $("#intPkProduct").val();
		let arrProperties = elementClasses[0].split("_");
		let strAttribute = arrProperties[0];
		let intPkAttribute = arrProperties[arrProperties.length - 1];

		GetCalculationData(intPkProduct, intPkAttribute, elementClasses[0])
	}
});

//------------------------------------------------------------------------------------------------------------------
//														//SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function GetCalculationData(intPkProduct, intPkAttribute, strAttribute) {
	$.ajax({
		type: "GET",
		url: "/Calculation/subGetBySpectCalculation",
		data:
		{
			'intPkProduct': intPkProduct,
			'intPkAttribute': intPkAttribute,
		},
		dataType: "html",
		success: function (response) {
			//											//Show the table.
			$("#attr-" + strAttribute +"-table").html(response);
		}
	});
}
