let arrdataResource = null;

$(document).ready(function () {
    //------------------------------------------------------------------------------------------------------------------
    $("#ResourceForm").find("#a").change(function () {
        $("#ResourceForm").find("#intnPkResource option").remove();
        $("#ResourceForm").find("#intnPkResourceElement option").remove();
        var intnPkProcess = $(this).val();
        var url = "";
        var data;

        if (intnPkProcess != "") {
            if (intnPkProcess == "All") {
                url = "../PrintshopTemplate/GetPrintshopTypeOfResources";
                data = { 'strResOrPro': "Resource" }
            }
            else if (intnPkProcess != "All") {
                url = "../PrintshopTemplate/GetProcessTypeOfResources";
                data = { 'intPk': intnPkProcess }
            }

            deleteResourceElements()

            $.ajax({
                type: "GET",
                url: url,
                data: data,
                dataType: "html",
                success: function (response) {
                    var json = JSON.parse(response);
                    var selectList = $("#ResourceForm").find("#intnPkResource");
                    selectList.append(new Option("Pick one", "Pick one", true));
                    selectList.append(new Option("All", "All"));

                    if (json.length > 0) {
                        for (var i = 0; i < json.length; i++) {
                            var obj = json[i];
                            option = document.createElement("option");
                            option.value = obj.intPk;
                            option.text = obj.strTypeId;
                            selectList.append(new Option(option.text, option.value));
                        }
                    }
                    else {
                        selectList.val("All");
                    }

                    if (intPkSelectedResource != "" && intPkSelectedResource != null) {
                        selectList.val(intPkSelectedResource);
                    }
                }
            });
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $("#ResourceForm").find("#intnPkResourceI").change(function () {
        let intnPkResourceI = $("#ResourceForm").find("#intnPkResourceI").val();
        let dropdownOption = $(this).find('option:selected');

        let strUnit = dropdownOption.data("strunit") != undefined ? dropdownOption.data("strunit") : "-";
        let numQuantity = dropdownOption.data("numquantity") != undefined ? dropdownOption.data("numquantity") : "-";
        let numCost = dropdownOption.data("numcost") != undefined ? dropdownOption.data("numcost") : "-";
        let numnMin = dropdownOption.data("numnmin") != undefined ? dropdownOption.data("numnmin") : "-";
        let boolIsBlock = dropdownOption.data("boolisblock") != undefined ? dropdownOption.data("boolisblock") : "-";

        $("#ResourceForm").find("#strUnitILabel").html(strUnit);
        $("#ResourceForm").find("#strUnitI").val(strUnit);
        $("#ResourceForm").find("#numnQuantity").html(numQuantity);
        $("#ResourceForm").find("#numnCost").html(numCost);
        $("#ResourceForm").find("#numnMin").html(numnMin);

        if (
            boolIsBlock == true || boolIsBlock == false
        ) {
            boolIsBlock = boolIsBlock == true ? "Yes" : "No";
        }
        else {
            boolIsBlock = "-"
        }
        $("#ResourceForm").find("#boolnIsBlock").html(boolIsBlock);

        $("#ResourceForm").find("#intnPkResourceI").val(intnPkResourceI);

        //													//Hide the option that is the same than the resource.
        $("#ResourceForm").find("#intnPkResourceO option").removeAttr("hidden");
        $("#ResourceForm").find("#intnPkResourceO option[value=" + intnPkResourceI + "]").attr("hidden", true);
    })

    //------------------------------------------------------------------------------------------------------------------
    $("#ResourceForm").find("#intnPkResourceO").change(function () {
        let intnPkCalculation = $("#ResourceForm").find("#intPk").val();
        let intnPkResourceO = $("#ResourceForm").find("#intnPkResourceO").val();
        let boolIspaper = $("#ResourceForm").find("#boolIsPaper").val();
        $("#frmPaper").find(".calculateCuts").val("")

        if (intnPkResourceO != "") {
            let dropdownOption = $(this).find('option:selected');

            console.info($(this).val())

            let strUnit = dropdownOption.data("strunit") != undefined ? dropdownOption.data("strunit") : null;
            let strAreaUnit = dropdownOption.data("strareaunit") != undefined ? dropdownOption.data("strareaunit") : null;
            let intnPkEleetOrEleele = dropdownOption.data("intnpkeleetoreleele");
            let boolnIsEleet = dropdownOption.data("booliseleet");
            let boolIsComponent = JSON.parse(dropdownOption.attr("data-boolIsComponent").toLowerCase());
            let boolIsMedia = JSON.parse(dropdownOption.attr("data-boolIsMedia").toLowerCase());
            let boolIsRoll = JSON.parse(dropdownOption.attr("data-boolisroll").toLowerCase());
            let boolSize = JSON.parse(dropdownOption.attr("data-boolSize").toLowerCase());

            if (
                strAreaUnit != null && strAreaUnit != "null" && intnPkCalculation == "0"
            ) {
                $("#ResourceForm").find("#strUnitOLabel").prop("hidden", true);
                $("#ResourceForm").find("#spanUnitO").prop("hidden", false);

                $("#ResourceForm").find("#boolnByArea").html("");
                $("#ResourceForm").find("#boolnByArea").append(new Option(strUnit, "false"));
                $("#ResourceForm").find("#boolnByArea").append(new Option(strAreaUnit, "true"));
            }
            else if (
                intnPkCalculation == "0"
                ) {
                $("#ResourceForm").find("#strUnitOLabel").prop("hidden", false);
                $("#ResourceForm").find("#spanUnitO").prop("hidden", true);

                $("#ResourceForm").find("#strUnitOLabel").html(strUnit);
                $("#ResourceForm").find("#boolnByArea").html("");
                $("#ResourceForm").find("#boolnByArea").append(new Option(strUnit, "false"));
            }

            $("#ResourceForm").find("#intnPkEleetOrEleeleO").val(intnPkEleetOrEleele);
            $("#ResourceForm").find("#boolnIsEleetO").val(boolnIsEleet);

            if (boolIsComponent) {
                $("#ResourceForm").find(".openPaperModal").prop('disabled', false);
            }
            else {
                $("#ResourceForm").find(".openPaperModal").prop('disabled', true);
            }

            if (
                (boolIsComponent || boolIsMedia) && !boolIsRoll
            ) {
                $("#ResourceForm").find(".chkNeededPerUnit").prop('disabled', false);
            } else {
                $("#ResourceForm").find(".chkNeededPerUnit").prop('disabled', true);
            }

            if (
                boolSize && (boolIspaper == "true")
            ) {
                $("#ResourceForm").find("#numnNeeded").val('');
                $("#ResourceForm").find("#numnPerUnits").val('');
                $("#ResourceForm").find("#numnNeeded").addClass('readonly');
                $("#ResourceForm").find("#numnPerUnits").addClass('readonly');
                $("#ResourceForm").find("#numnNeeded").prop('readonly', true);
                $("#ResourceForm").find("#numnPerUnits").prop('readonly', true);
            } else {
                $("#ResourceForm").find("#numnNeeded").removeClass('readonly');
                $("#ResourceForm").find("#numnPerUnits").removeClass('readonly');
                $("#ResourceForm").find("#numnNeeded").prop('readonly', false);
                $("#ResourceForm").find("#numnPerUnits").prop('readonly', false);
            }
        }
        else {
            $("#ResourceForm").find(".openPaperModal").prop('disabled', true);
            $("#ResourceForm").find(".chkNeededPerUnit").prop('disabled', true);
            $("#ResourceForm").find("#numnNeeded").prop('readonly', false);
            $("#ResourceForm").find("#numnPerUnits").prop('readonly', false);
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(".btnResource").click(function () {
        var intPk = $(this).find("#intPkResource").val()
        console.log(intPk)
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".addResourceDefaultCalculation", function () {

        let elemetn = $(this);
        arrdataResource = $(this).prev().val().split("|");

        $("#intnPkProcessDiv").prop("hidden", true);
        $("#intnPkResourceElement").prop("disabled", true);
        $("#intnPkResource").prop("disabled", true);
        $("#intnPkResourceElementDiv").removeClass("col-sm-4");
        $("#intnPkResourceElementDiv").addClass("col-sm-6");

        if (arrdataResource[0] != "All") {
            $("#intnPkResourceElementDiv").prop("hidden", true);

            $("#intnPkResourceDiv").removeClass("col-sm-4");
            $("#intnPkResourceDiv").removeClass("col-sm-6");
            $("#intnPkResourceDiv").addClass("col-sm-12");

            intPkSelectedResource = arrdataResource[0];
            $("#intnPkProcess").val("All").change();
            $("#intnPkResource").val(arrdataResource[0]);
        }
        else {
            intPkSelectedResourceElement = arrdataResource[1];
            $("#intnPkResourceElementDiv").prop("hidden", false);

            $("#intnPkResourceDiv").removeClass("col-sm-4");
            $("#intnPkResourceDiv").removeClass("col-sm-12");
            $("#intnPkResourceDiv").addClass("col-sm-6");

            $("#intnPkResource").trigger("change");
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".deleteResource", function () {
        let elemetn = $(this);
        let intPkResource = $(this).data("intpkresource");

        $.ajax({
            type: "POST",
            url: "/PrintshopResourcesTemplate/IsDispensable",
            data:
            {
                "intPk": intPkResource
            },
            success: function (response) {
                let jsonResponse = response;
                if ((response.intStatus == 200) || (response.intStatus == 401)) {
                    deleteResource(intPkResource);
                }
                else if (response.intStatus == 402) {
                    $(".btnYesNo").css("display", "block");
                    $(".btnOk").css("display", "none");
                    $("#confirmation-modal").modal('show');
                    $("#myModalBody").html("<span class='font-bold'>" + jsonResponse.strUserMessage + "</span>" +
                        "<br/> Delete anyway?")

                    $("#modal-btn-yes").bind("click", function () {
                        deleteResource(intPkResource);
                        $("#confirmation-modal").modal('hide');
                    });
                }
                else {
                    subSendNotification(response.strUserMessage, response.intStatus);
                }
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    //$('#confirmation-modal').on('hidden.bs.modal', function () {
    //	
    //});

    //------------------------------------------------------------------------------------------------------------------
    //$("#modal-btn-yes").on("click", function () {
    //	deleteResource(arrintPkResource[1]);
    //	$("#confirmation-modal").modal('hide');
    //});

    //------------------------------------------------------------------------------------------------------------------
    $("#modal-btn-no").on("click", function () {
        console.log("Canceled");
        $("#confirmation-modal").modal('hide');
    });

    //------------------------------------------------------------------------------------------------------------------
    $("#modal-btn-ok").on("click", function (e) {
        $('#confirmation-modal').unbind("hidden.bs.modal");
        $("#confirmation-modal").modal('hide');
        location.reload();
    });

    //------------------------------------------------------------------------------------------------------------------
    $("#groupButton").click(function () {
        $("#groupButton").toggle();
        $("#doneButton").toggle();
        $("#ungroupButton").toggle();

        $(".group-checkbox").toggle();
    });

    //------------------------------------------------------------------------------------------------------------------
    $("#doneButton").click(function () {
        $("#groupButton").toggle();
        $("#doneButton").toggle();
        let intPkProduct = $("#intnPkProduct").val();

        let arrintPk = [];
        $(".group-checkbox").toggle();
        $(".group-checkbox").each(function (index, value) {
            if ($(this).is(":checked")) {
                arrintPk.push(Number(value.value));
                $(this).prop("checked", false);
            }
        });

        if (arrintPk.length > 0) {
            $.ajax({
                type: "POST",
                url: "/Calculation/Group",
                data:
                {
                    "arrintPk": arrintPk,
                    "intnPkProduct": intPkProduct
                },
                success: function (objResponse) {
                    if (objResponse.intStatus == 200) {
                        setGroupSelect(objResponse.objResponse);

                        let elementClasses = $("#ResourceForm").attr("class").split(" ");
                        let strActionName = elementClasses[elementClasses.length - 1];
                        let strHtmlSectionId = GetHtmlSection("resource", strActionName);
                        GetCalculationData($("#ResourceForm").find("#intnPkProduct").val(), strActionName, strHtmlSectionId);
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

        $("#ungroupButton").toggle();
    });

    //------------------------------------------------------------------------------------------------------------------
    $("#ungroupButton, #cancelUngroup").click(function () {

        $("#ungroupButton").toggle();
        $("#ungroupForm").toggle();

        $("#groupButton").toggle();
    });

    //------------------------------------------------------------------------------------------------------------------
    $("#ungroupCalculations").click(function () {

        let intGroupId = $("#selectlistGroup").val();
        let intPkProduct = $("#intnPkProduct").val();

        if (intGroupId != null && intGroupId > 0) {
            $.ajax({
                type: "POST",
                url: "/Calculation/Ungroup",
                data:
                {
                    "intGroupId": intGroupId,
                    "intPkProduct": intPkProduct
                },
                success: function (response) {
                    setGroupSelect(response);

                    let elementClasses = $("#ResourceForm").attr("class").split(" ");
                    let strActionName = elementClasses[elementClasses.length - 1];
                    let strHtmlSectionId = GetHtmlSection("resource", strActionName);
                    GetCalculationData($("#ResourceForm").find("#intnPkProduct").val(), strActionName, strHtmlSectionId);
                }
            });
        }

        $("#ungroupButton").toggle();
        $("#ungroupForm").toggle();

        $("#groupButton").toggle();
    });

    //------------------------------------------------------------------------------------------------------------------
    $(".addResourceTemplate").click(function () {
        let strType = $(this).val();

        $("#addXJDFResourceSection, #addCustomResourceSection, #resNextStep, #saveCustomResource").attr("hidden");

        if (strType == "xjdf") {
            $("#addXJDFResourceSection, #resNextStep").removeAttr("hidden");
        }
        else {
            $.ajax({
                type: "GET",
                url: "/PrintshopResourcesTemplate/AddCustomResourceTemplate",
                success: function (response) {
                    $("#addCustomResourceSection").html(response);
                    $("#addCustomResourceSection").removeAttr("hidden");
                }
            });
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", "#addNewCustomResourceAttr", function () {
        let intChildElements = $("#dinamicCustomResourceAttributes").children("form").length + 1;

        let intTopPixels = (100 * intChildElements) + 15;

        $("#dinamicCustomResourceAttributes").append('<form class="border p-3" id="customResourceAttribute-' +
            intChildElements + '"> ' +
            '<div class="form-group row"><div class="col-sm-5"><label class="input-label">Attribute Name</label >' +
            '<input name="strCustomAttrName" class="form-control input-with-dropdowns" /></div>' +
            '<div class="col-sm-5"><label class="input-label">Value</label>' +
            '<input name="strCustomValue" class="form-control input-with-dropdowns" /></div>' +
            '<div class="col-sm-2 text-right p-1"><br /><button type="button" class="btn btn-danger btn-sm' +
            ' removeResourceForm" data-res-card="1">' +
            '<i class="fa fa-trash-o" aria-hidden="true" ></i></button ></div > ' +
            '</div >' +
            '</form > <br />');

        $("#dinamicCustomResourceAttributes").animate({
            scrollTop: $('#dinamicCustomResourceAttributes')[0].scrollHeight
        }, 1000);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("keyup", "#strResourceName, #strUnitCustomResource", function () {
        if ($("#strResourceName").val().length > 0 && $("#strUnitCustomResource").val().length > 0) {
            $("#saveCustomResource").removeAttr("hidden");
        }
        else {
            $("#saveCustomResource").attr("hidden", "true");
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", "#strUnitCustomResource", function () {
        if ($("#strResourceName").val().length > 0 && $("#strUnitCustomResource").val().length > 0) {
            $("#saveCustomResource").removeAttr("hidden");
        }
        else {
            $("#saveCustomResource").attr("hidden", "true");
        }
    });

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#saveCustomResource", function () {
		let formChildElements = $("#dinamicCustomResourceAttributes").children("form");
		let strResourceName = $("#strResourceName").val();
		let strUnit = $("#strUnitCustomResource").val();
		let boolIsDecimal = $("#boolIsDecimal").is(":checked");
		let boolAllFormsIsCompleted = true;
		let arrstrAttribute = [];
		let arrstrValue = [];

        $.each(formChildElements, function (index, value) {
            if ($(value[0]).val().length == 0 || $(value[1]).val().length == 0) {
                boolAllFormsIsCompleted = false;
            }
            else {
                arrstrAttribute.push($(value[0]).val());
                arrstrValue.push($(value[1]).val())
            }
        });

		let object = {
			"strResourceName": strResourceName,
			"strUnit": strUnit,
			"boolnIsDecimal": boolIsDecimal,
			"arrstrAttribute": arrstrAttribute,
			"arrstrValue": arrstrValue
		};

        $.ajax({
            type: "POST",
            url: "/PrintshopResourcesTemplate/AddCustomResource",
            data: object,
            dataType: "html",
            success: function (strResponse) {
                let objResponse = JSON.parse(strResponse);
                if (objResponse.intStatus == 200) {
                    $('#xjdfTemplateModal').modal('toggle');
                }
                else {
                    subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
                }
            },
            error: function () {
                subSendNotification("Something is wrong", 400);
            }
        });

    });

    //------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------
//															//SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function deleteResourceElements() {
    $("#ResourceForm").find("#dynamicElements").empty();
    childCount = 1;
    return childCount;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function deleteResourceChildElements(currentId) {
    var childCountSelect = $("#ResourceForm").find("#dynamicElements").children("select").length;
    var childCountInput = $("#ResourceForm").find("#dynamicElements").children("input").length;
    var childCount = parseInt(childCountSelect) + parseInt(childCountInput) + 1;
    var intId = currentId.split("_");
    var elements = $("#ResourceForm").find(".child-dynamic").length;
    if (elements > 0) {
        $("#ResourceForm").find(".child-dynamic").each(function (index, value) {
            var currentvalue = value.id;
            var currentId = currentvalue.split("_");
            if (currentId[1] > intId[1]) {
                $("#ResourceForm").find("#" + value.id).fadeOut("fast", function () {
                    $("#ResourceForm").find("#" + value.id).remove();
                }
                );
                childCount = childCount - 1;
            }
        });
    }
    return childCount;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function setGroupSelect(darroption) {
    $("#selectlistGroup").html("");

    $("#selectlistGroup").append(new Option("Pick one", null));
    $.each(darroption, function (index, value) {
        $("#selectlistGroup").append(new Option(value.text, value.value));
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - -
function deleteResource(intPk) {
    //
    $.ajax({
        type: "POST",
        url: "/PrintshopResourcesTemplate/Delete",
        data:
        {
            "intPk": intPk
        },
        success: function (response) {
            console.info(response);
            let json = response;
            if (json.intStatus == 200) {
                location.reload();
            }
            else {
                subSendNotification(json.intStatus, json.strUserMessage);
            }

            console.info(json)
        }
    });
}