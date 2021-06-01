$(document).ready(function () {
    //------------------------------------------------------------------------------------------------------------------
    $("#printshopRulesModal").on("change", ".showFormPrintshop", function () {
        //debugger
        let formType = $(this).val();
        let modalId = "#printshopRulesModal";
        subShowHideForms(formType, modalId);
        console.info(formType);
    });

    $("#calendarModal").on("change", ".showFormResource", function () {
        //debugger
        let formType = $(this).val();
        let modalId = "#calendarModal";
        subShowHideForms(formType, modalId);
        console.info(formType);
    });
});

//----------------------------------------------------------------------------------------------------------------------
$(document).on("change", ".strEndHour", function () {
    subShowHideNextDay();
});

//----------------------------------------------------------------------------------------------------------------------
$(document).on("change", ".strEndMin", function () {
    subShowHideNextDay();
});

//----------------------------------------------------------------------------------------------------------------------
$(document).on("change", "select[name=strStartHour], select[name=strEndHour]",function () {
	let minSelectElement = $(this).parent().next().find("select");
	if (
		//													//If the selected option has a value, then change the value
		//													//		on the minutes select.
		$(this).val() != "" || $(this).val().length > 0
		)
	{
		minSelectElement.val("00");
	}
});

//----------------------------------------------------------------------------------------------------------------------
$(".resourceCalendarButton").on("click", function () {
    let intPkResource = $(this).attr("data-intPkResource");
    let strName = $(this).attr("data-strName");
    subUpdateRulesTable(intPkResource, false, null);
    $("#resourceRuleTittle").html(strName + " - Unavailability's Rules");
    $("#calendarModal").modal("show");
});

//----------------------------------------------------------------------------------------------------------------------
$(".printshopRulesButton").on("click", function () {
    let intPkResource = $(this).attr("data-intPkResource");
    let strPrintshopName = $(this).attr("data-strPrintshopName");
    if (strPrintshopName == null || strPrintshopName == "") {
        subSendNotification("No printshop selected", 400);
    }
    else {
        subUpdateRulesTable(intPkResource, false, null);
        $("#resourceRuleTittle").html("Resource's - Unavailability's Rules");
        $("#printshopRulesModalTitle").html("Printshop's Unavailability's Rules");
        $("#printshopRulesModal").modal("show");
    }
});

//------------------------------------------------------------------------------------------------------------------
$(document).on("click", ".employeeRules", function () {
    let intContactId = $(this).attr("data-contactid");
    let employee = $(this).attr("data-employee-name");
    subUpdateRulesTable(null, true, intContactId);
    $("#printshopRulesModalTitle").html(employee + " - Unavailability's Rules");
    $("#printshopRulesModal").modal("show");
});

//------------------------------------------------------------------------------------------------------------------
$(document).on("click", ".showMyRules", function (e) {
    e.preventDefault();
    subUpdateRulesTable(null, true, null);
    $("#printshopRulesModalTitle").html("My Unavailability's Rules");
    $("#printshopRulesModal").modal("show");
});

//----------------------------------------------------------------------------------------------------------------------
$(document).on("submit", ".ruleForm", function (event) {
    event.preventDefault();
    let showForm;
    let modalId;
    //let data = $(this).serialize();

    let intnPkResource = $(this).find("input[name=intnPkResource]").val();
    let boolIsEmployee = $(this).find("input[name=boolIsEmployee]").val();
    let intnContactId = $(this).find("input[name=intnContactId]").val();

    if ((intnPkResource == 0 || intnPkResource == null) && (boolIsEmployee && (intnContactId != null || intnContactId != ""))) {
        showForm = ".showFormPrintshop";
        modalId = "#printshopRulesModalBody";
    }
    else {
        showForm = ".showFormResource";
        modalId = "#calendarModalBody";
    }
    let strFrecuency = $(showForm).val();
    let strStartDate = $(this).find("input[name=strStartDate]").val();
    let strEndDate = $(this).find("input[name=strEndDate]").val();
    let strStartHour = $(this).find("select[name=strStartHour]").val();
    let strStartMin = $(this).find("select[name=strStartMin]").val();
    let strEndHour = $(this).find("select[name=strEndHour]").val();
    let strEndMin = $(this).find("select[name=strEndMin]").val();
    let strRangeStartDate = $(this).find("input[name=strRangeStartDate]").val();
    let strRangeStartHour = $(this).find("select[name=strRangeStartHour]").val();
    let strRangeStartMin = $(this).find("select[name=strRangeStartMin]").val();
    let strRangeEndDate = $(this).find("input[name=strRangeEndDate]").val();
    let strRangeEndHour = $(this).find("select[name=strRangeEndHour]").val();
    let strRangeEndMin = $(this).find("select[name=strRangeEndMin]").val();

    let strRangeStartTime;
    let strRangeEndTime;

    if (strRangeStartDate != null && strRangeStartDate!="") {
        strRangeStartTime = strRangeStartHour + ":" + strRangeStartMin + ":00";
    }
    else {
        strRangeStartTime = null;
    }
    if (strRangeEndDate != null && strRangeEndDate!="") {
        strRangeEndTime = strRangeEndHour + ":" + strRangeEndMin + ":00";
    }
    else {
        strRangeEndTime = null;
    }

    strStartHour = strStartHour + ":" + strStartMin + ":00";
    strEndHour = strEndHour + ":" + strEndMin + ":00";

    
    let arrintDays= new Array();
    let strDay;

    if (strFrecuency == "once" || strFrecuency == "daily") {
        arrintDays = null;
        strDay = null;
    }
    else if (strFrecuency == "weekly") {
        //debugger;
        $(modalId + ' .chkDay').each(function () {
            if ($(this).is(":checked")) {
                arrintDays.push(1);
            }
            else {
                arrintDays.push(0);
            }
        });
        strDay = null;
    }
    else if (strFrecuency == "monthly") {
        $(modalId + ' .dayMonth').each(function () {
            if ($(this).is(":checked")) {
                arrintDays.push($(this).val());
            }
        });
        strDay = null;
    }
    else if (strFrecuency == "annually") {
        debugger;
        let strMonth = $(this).find("select[name=strMonth]").val();
        if (strMonth<10) {
            strMonth = "0" + strMonth;
        }
        arrintDays = null;
        strDay = $("#strDay").val();
        strDay = strMonth + strDay;
    }

    let data={
        "intnPkResource": intnPkResource,
        "strFrecuency": strFrecuency,
        "strStartDate": strStartDate,
        "strEndDate": strEndDate,
        "strStartTime": strStartHour,
        "strEndTime": strEndHour,
        "strRangeStartDate": strRangeStartDate,
        "strRangeStartTime": strRangeStartTime,
        "strRangeEndDate": strRangeEndDate,
        "strRangeEndTime": strRangeEndTime,
        "arrintDays": arrintDays,
        "strDay": strDay,
        "intnContactId": intnContactId,
        "boolIsEmployee": JSON.parse(boolIsEmployee)
    }

    console.info(data)

    $.ajax({
        type: "POST",
        url: "/Rule/RuleIsAddable",
        data: data,
        success: function (objResponse) {
            if (objResponse.intStatus == 200) {
                if (objResponse.objResponse == true) {
                    subAddRule(data, intnPkResource, boolIsEmployee, intnContactId);
                }
				else {
					$(".btnYesNo").css("display", "block");
					$(".btnOk").css("display", "none");
					$("#confirmation-modal").modal('show');
					$("#myModalBody").html("<span class='font-bold'>" + objResponse.strUserMessage + "<br /> Add anyway?</span>");

					$("#modal-btn-yes").bind("click", function () {
                        subAddRule(data, intnPkResource, boolIsEmployee, intnContactId);
						$("#confirmation-modal").modal('hide');
					});
                }
            }
            else {
                subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
            }
        }
    });
});

//----------------------------------------------------------------------------------------------------------------------
$(document).on("click", "#deleteRuleButton", function () {
    let intPkResource = $(this).attr("data-intPkResource");
    let intPkRule = $(this).attr("data-intPkRule");
    let boolIsEmployee = $(this).data("boolisemployee");

    let data = {
        "intPkResource":intPkResource,
        "intPkRule": intPkRule
    }

    $.ajax({
        type: "POST",
        url: "/Rule/DeleteRule",
        data: data,
		success: function (objResponse) {
			if (objResponse.intStatus == 200) {
                subUpdateRulesTable(intPkResource, boolIsEmployee);
			}

			subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
		}
    });

});



//----------------------------------------------------------------------------------------------------------------------
//                                                          //SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subAddRule(
    //                                                      //This method adds a rule for a resource
    
    //                                                      //Rule Form data
    data,
    //                                                      //Resource PK
    intnPkResource,
    boolIsEmployee,
    intnContactId
) {
    $.ajax({
        type: "POST",
        url: "/Rule/AddRule",
        data: data,
        success: function (objResponse) {
            if (objResponse.intStatus == 200) {
                subUpdateRulesTable(intnPkResource, boolIsEmployee, intnContactId);
            }
            subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subUpdateRulesTable(intnPkResource, boolIsEmployee, intnContactId) {
    let modalId;
    let showForm;
    $("#printshopRulesModalBody").html("");
    $("#calendarModalBody").html("");
    $.ajax({
        type: "GET",
        url: "/Rule/GetRulesList",
        data: {
            "intnPkResource": intnPkResource,
            "boolIsEmployee": boolIsEmployee,
            "intnContactId": intnContactId
        },
        dataType: "html",
        success: function (objResponse) {
            //debugger;
            if ((intnPkResource == 0 || intnPkResource == null) && (boolIsEmployee && (intnContactId != null || intnContactId != ""))) {
                $("#printshopRulesModalBody").html(objResponse);
                modalId = "#printshopRulesModalBody";
                showForm = ".showFormPrintshop";
            }
            else if ((intnPkResource == 0 || intnPkResource == null || intnPkResource == "") && (!boolIsEmployee && (intnContactId == null || intnContactId == ""))) {
                $("#printshopRulesModalBody").html(objResponse);
                modalId = "#printshopRulesModalBody";
                showForm = ".showFormPrintshop";
            }
            else {
                $("#calendarModalBody").html(objResponse);
                modalId = "#calendarModalBody";
                showForm = ".showFormResource";
            }
            let formType = $(showForm).val();
            subShowHideForms(formType, modalId);
            console.info(formType + " " + modalId);
        },
        error: function () {
            subSendNotification("Something is wrong", 400);
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subShowHideForms(formType, modalId) {
    if (formType != "") {
        $(modalId+" form.formShow").each(function (index, value) {
            //debugger
            //console.info(value)
            let formClass = value.className.split(" ")[0];
            $(this).removeClass(formClass + " formShow ruleForm");
            $(this).addClass(formClass + " formHidden ruleForm");
        });
        $(modalId+" form.formHidden").each(function (index, value) {
            //debugger
            //console.info(value)
            if ($(this).hasClass("formShow")) {
                $(this).removeClass(formClass + " formShow ruleForm");
                $(this).addClass(formClass + " formHidden ruleForm");
            }
            let formClass = value.className.split(" ")[0];
            if (formClass == formType) {
                $(this).removeClass(formClass + " formHidden ruleForm");
                $(this).addClass(formClass + " formShow ruleForm");
            }
            else {
                $(this).addClass(formClass + " formHidden ruleForm");
            }
        });
    }
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subShowHideNextDay() {
    let showForm = $(".showForm").val();
    if (showForm != "once") {
        let strEndHour = $(".formShow").find(".strEndHour").val();
        let strEndMin = $(".formShow").find(".strEndMin").val();
        if (strEndHour == "00" && strEndMin == "00") {
            $(".formShow").find(".labelNextDay").css("display", "block");
        }
        else {
            $(".formShow").find(".labelNextDay").css("display", "none");
        }
    }
}