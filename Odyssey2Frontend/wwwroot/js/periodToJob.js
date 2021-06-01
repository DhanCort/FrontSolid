let htmlResponse = null;
let currentSunday = null;
let arrstrDay = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
let arrstrShortDay = new Array("sun", "mon", "tues", "wed", "thurs", "fri", "sat");

$(document).ready(function () {
    $(document).tooltip({ selector: '[data-toggle=tooltip]' });
    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".modalToSetPeriodToJobProcess", function () {
        $("#jobCalendarBody").html("");
        $("#jobProcessesCalculationBody").html("");

        let data_to_GetCalendar = $(this).attr("data-to-GetCalendar").split("|");
        let boolIsInformative = $(this).data("boolisinformative");
        let sunday = moment().day("Sunday").format("YYYY-MM-DD");

        $("#refreshJobPeriod").attr("data-to-GetCalendar", data_to_GetCalendar[0]
            + "|" + data_to_GetCalendar[1] + "|" + currentSunday)
        $("#jobPrevWeek").attr("data-to-GetCalendar", data_to_GetCalendar[0]
            + "|" + data_to_GetCalendar[1])
        $("#jobNextWeek").attr("data-to-GetCalendar", data_to_GetCalendar[0]
            + "|" + data_to_GetCalendar[1])
        $("#goToJobDateNow").attr("data-to-GetCalendar", data_to_GetCalendar[0]
            + "|" + data_to_GetCalendar[1])

        $.when(
            subGetCalendar(data_to_GetCalendar, sunday, boolIsInformative)
        ).then(function () {
            $("#setPeriodToJobProcessModal").modal("show");

            currentSunday = sunday;
            if (boolIsInformative != "True") {
                boolReloadSite = true;
                getProcessesAndCalculationsWithPeriods(data_to_GetCalendar, sunday);
            }
        });

        //$('#setPeriodToJobProcessModal').show('show', function () {
        //    //setFormatToCalendar();
        //    //$(document).find("#refreshJobPeriod").click();
        //    subGetCalendar(data_to_GetCalendar, sunday);
        //    getProcessesAndCalculationsWithPeriods(data_to_GetCalendar, sunday);
        //});
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on('shown.bs.collapse', ".collapse-get-job-process-calculation", function (e) {
        let collapsableSection = $(this).children("div");
        let intPk = $(this).data("intpk");
        let intJobId = $(this).data("intjobid");

        $.ajax({
            type: "GET",
            url: "/JobPeriod/GetPeriodsFromOneProcess",
            data: {
                "intPk": intPk,
                "intJobId": intJobId
            },
            beforeSend: function () {
                collapsableSection.html('<div class="text-center"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');
            },
            success: function (objResponse) {
                if (typeof (objResponse) == "object") {
                    subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
                }
                else {
                    collapsableSection.html(objResponse);
                }
            },
            error: function () {
                subSendNotification("Something wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on('hidden.bs.collapse', ".collapse-get-job-process-calculation", function (e) {
        let collapsableSection = $(this).children("div");
        collapsableSection.html("");
    })

    //------------------------------------------------------------------------------------------------------------------
    $('#setPeriodToJobProcessModal').on('hide.bs.modal', function (e) {
        //setFormatToCalendar();
        if (boolReloadSite) {
            boolReloadSite = false;
            location.reload();
        }
    })

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", "#refreshJobPeriod", function () {
        let data_to_GetCalendar = $(this).attr("data-to-GetCalendar").split("|");
        let boolIsInformative = $(this).data("boolisinformative");
        $.when(
            subGetCalendar(data_to_GetCalendar, currentSunday, boolIsInformative)
        ).then(function () {
            if (boolIsInformative != "True") {
                getProcessesAndCalculationsWithPeriods(data_to_GetCalendar, currentSunday)
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", "#jobPrevWeek", function () {
        let data_to_GetCalendar = $(this).attr("data-to-GetCalendar").split("|");
        let boolIsInformative = $(this).data("boolisinformative");

        let previousSunday = moment(currentSunday, "YYYY-MM-DD").subtract(1, 'weeks').
            startOf('week').format('YYYY-MM-DD');

        $.when(
            subGetCalendar(data_to_GetCalendar, previousSunday, boolIsInformative)
        ).then(function () {
            if (boolIsInformative != "True") {
                getProcessesAndCalculationsWithPeriods(data_to_GetCalendar, previousSunday)
            }
        });
        currentSunday = previousSunday;
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", "#jobNextWeek", function () {
        let data_to_GetCalendar = $(this).attr("data-to-GetCalendar").split("|");
        let boolIsInformative = $(this).data("boolisinformative");
        var nextSunday = moment(currentSunday, "YYYY-MM-DD").add(1, 'week').day(0).format('YYYY-MM-DD');

        $.when(
            subGetCalendar(data_to_GetCalendar, nextSunday, boolIsInformative)
        ).then(function () {
            if (boolIsInformative != "True") {
                getProcessesAndCalculationsWithPeriods(data_to_GetCalendar, nextSunday);
            }
        });
        currentSunday = nextSunday;
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", "#goToJobDateNow", function () {
        let data_to_GetCalendar = $(this).attr("data-to-GetCalendar").split("|");
        let boolIsInformative = $(this).data("boolisinformative");
        let sunday = moment().day("Sunday").format("YYYY-MM-DD");

        $.when(
            subGetCalendar(data_to_GetCalendar, sunday, boolIsInformative)
        ).then(function () {
            if (boolIsInformative != "True") {
                getProcessesAndCalculationsWithPeriods(data_to_GetCalendar, sunday);
            }
        });
        currentSunday = sunday;
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".getSuggestedEndTime", function () {
        let intPkCalculation = $(this).attr("data-intPkCalculation");
        //console.info(intPkCalculation);
        let intJobId = $("#intJobId").val();
        let intPkProcessInWorkflow = $("#intPkProcessInWorkflow_" + intPkCalculation).val();

        let strStartDate = $("#strStartDateJob_" + intPkCalculation).val().split(" ")[0];

        let strStartTime = $("#strStartDateJob_" + intPkCalculation).val().split(" ")[1] + ":00";

        let period = {
            "intJobId": intJobId,
            "intPkProcessInWorkflow": intPkProcessInWorkflow,
            "intPkCalculation": intPkCalculation,
            "strStartDate": strStartDate,
            "strStartTime": strStartTime
        }

        $.ajax({
            type: "POST",
            url: "/JobPeriod/GetEndOfPeriod",
            data: period,
            success: function (objResponse) {
                if (objResponse.intStatus == 200) {
                    //console.info(objResponse.objResponse);
                    let strEndTime = objResponse.objResponse.strEndTime.substring(0, objResponse.objResponse.strEndTime.length - 3)
                    $("#strEndDateJob_" + intPkCalculation).val(objResponse.objResponse.strEndDate + " " + strEndTime);

                }
                else {
                    subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
                }
            },
            error: function () {
                subSendNotification("Something wrong", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".setProcessPeriod", function () {
        let divElement = $(this).parent();
        let intPkCalculation = $(this).attr("data-intPkCalculation");
        let data_toRefreshCalendar = $(this).attr("data-toRefreshCalendar").split("|");
        //console.info(intPkCalculation);
        let intPkPeriod = $("#intPkPeriod_" + intPkCalculation).val();
        let strPassword = null;
        let intJobId = $("#intJobId").val();
        let intPkProcessInWorkflow = $("#intPkProcessInWorkflow_" + intPkCalculation).val();

        let strStartDate = $("#strStartDateJob_" + intPkCalculation).val().split(" ")[0];
        let strStartTime = $("#strStartDateJob_" + intPkCalculation).val().split(" ")[1] + ":00";

        let strEndDate = $("#strEndDateJob_" + intPkCalculation).val().split(" ")[0];
        let strEndTime = $("#strEndDateJob_" + intPkCalculation).val().split(" ")[1] + ":00";

        let intnContactId = $("#strEmployee_" + intPkCalculation).val();

        let intMinsBeforeDelete = $("#intMinsBeforeDelete_" + intPkCalculation).val();

        let intPkCalculationOriginal = intPkCalculation;
        if (
            intPkCalculation.split("_").length > 1
        ) {
            intPkCalculationOriginal = intPkCalculation.split("_")[0];
            intJobId = intPkCalculation.split("_")[1]
        }

        let period = {
            "intnPkPeriod": intPkPeriod,
            "strPassword": strPassword,
            "intJobId": intJobId,
            "intPkProcessInWorkflow": intPkProcessInWorkflow,
            "intPkCalculation": intPkCalculationOriginal,
            "strStartDate": strStartDate,
            "strStartTime": strStartTime,
            "strEndDate": strEndDate,
            "strEndTime": strEndTime,
            "intnContactId": intnContactId,
            "intMinsBeforeDelete": intMinsBeforeDelete,
            "intPeriodId": intPkCalculation
        }

        console.info(period);

        $.ajax({
            type: "POST",
            url: "/ProcessPeriod/PeriodIsAddable",
            data: period,
            success: function (objResponse) {
                if (objResponse.intStatus == 200) {
                    let strPasswordInput = "<input type='password' placeholder='Special Password' class='input-with-dropdowns form-control mt-2' id ='strConfirmPassword' />";
                    if (objResponse.objResponse.boolIsAddableAboutPeriods == true &&
                        objResponse.objResponse.boolIsAddableAboutRules == true &&
                        objResponse.objResponse.boolIsAddableAboutEmployeesPeriods == true) {

                        subSetProcessPeriod(period, data_toRefreshCalendar, divElement, false);
                    }
                    else if (objResponse.objResponse.boolIsAddableAboutPeriods == true &&
                        objResponse.objResponse.boolIsAddableAboutRules == false &&
                        objResponse.objResponse.boolIsAddableAboutEmployeesPeriods == false) {

                        subConfirmAddPeriod(objResponse, period, strPasswordInput, data_toRefreshCalendar, divElement, false);
                    }
                    else if (objResponse.objResponse.boolIsAddableAboutPeriods == false &&
                        objResponse.objResponse.boolIsAddableAboutRules == true &&
                        objResponse.objResponse.boolIsAddableAboutEmployeesPeriods == false) {
                        strPasswordInput = "";
                        subConfirmAddPeriod(objResponse, period, strPasswordInput, data_toRefreshCalendar, divElement, true);
                    }
                    else if (objResponse.objResponse.boolIsAddableAboutPeriods == false &&
                        objResponse.objResponse.boolIsAddableAboutRules == false &&
                        objResponse.objResponse.boolIsAddableAboutEmployeesPeriods == false) {
                        subConfirmAddPeriod(objResponse, period, strPasswordInput, data_toRefreshCalendar, divElement, true);
                    }
                    else {
                        $("#confirmation-modal").modal('show');
                        $("#myModalBody").html("<b>" + objResponse.strUserMessage + "</b>" +
                            "<br/> Add anyway?")

                        $("#modal-btn-yes").unbind();
                        $("#modal-btn-yes").css('display', '');

                        $("#modal-btn-no").unbind();
                        $("#modal-btn-no").css('display', '');

                        $("#modal-btn-yes").bind("click", function () {
                            subSetProcessPeriod(period, data_toRefreshCalendar, divElement);
                            $("#confirmation-modal").modal('hide');
                        });

                        $("#modal-btn-no").bind("click", function () {
                            $("#confirmation-modal").modal('hide');
                            subResetForm(objResponse.objResponse.period, intPkCalculation);
                            //getProcessesAndCalculationsWithPeriods(data_toRefreshCalendar, data_toRefreshCalendar[2])
                        });
                    }
                }
                else {
                    subSendNotification(objResponse.strUserMessage, objResponse.intStatus);

                    if (objResponse.objResponse != null) {
                        subResetForm(objResponse.objResponse, intPkCalculation);
                    }
                }
            },
            error: function () {
                subSendNotification("Something wrong", 400);
            }
        });

    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".deleteJobPeriod", function () {
        let btnElement = $(this);
        let intPkPeriod = $(this).val();
        let intPkCalculation = $(this).attr("data-intPkCalculation");
        let data_toRefreshCalendar = $(this).attr("data-toRefreshCalendar").split("|");

        $.ajax({
            type: "POST",
            url: "/JobPeriod/DeletePeriod",
            data: {
                "intPkPeriod": intPkPeriod
            },
            success: function (objResponse) {
                console.info(objResponse);
                if (objResponse.intStatus == 200) {
                    $("#estimateDateLabel-" + data_toRefreshCalendar[0]).html("Estimated Date: " +
                        objResponse.objResponse.strEstimatedDate);
                    btnElement.parent().parent().find("#strStartDateJob_" + intPkCalculation).val("");
                    btnElement.parent().parent().find("#strEndDateJob_" + intPkCalculation).val("");
                    btnElement.parent().parent().find("#intMinsBeforeDelete_" + intPkCalculation).val("");
                    btnElement.parent().parent().find("select").val("00");
                    btnElement.parent().parent().find("#intPkPeriod_" + intPkCalculation).val("");
                    btnElement.remove();

                    subGetCalendar(data_toRefreshCalendar, data_toRefreshCalendar[2]);
                }

                subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("mousemove", ".layoutTooltip", function () {
        let style = $(this).parent().parent().nextAll(".divTooltip").attr("style");
        let position = $(this).parent().parent().parent().outerWidth() * -1;

        var x = event.pageX - $(this).offset().left;
        var y = event.pageY - $(this).offset().top;

        let intSumWidth = 0;
        $(this).prevAll(".layoutTooltip").each(function (index, value) {
            if (!$(this).hasClass("divTooltip")) {
                intSumWidth = intSumWidth + $("#" + value.id).outerWidth();
            }
        });

        x = x + parseFloat($(this).attr("data-position")) + intSumWidth + 20//+ ($(this).outerWidth() / 3);
        //console.info(x)

        let intSumHeight = 0;
        $(this).parent().parent().prevAll(".processToDrawingRow").each(function (index, value) {
            if (!$(this).hasClass("divTooltip")) {
                intSumHeight = intSumHeight - $("#" + value.id).outerHeight();
            }
        });

        ////let x = parseFloat($(this).attr("data-position")) + intSumWidth //+ ($(this).outerWidth() / 3);
        y = intSumHeight + y - ($(this).outerHeight());

        let parent = $(this).parent().parent().parent().outerWidth();
        let divTooltip = $(this).parent().parent().nextAll(".divTooltip").outerWidth();

        let limite = parent - divTooltip;

        if (x > limite) {
            x = x - $(this).parent().parent().nextAll(".divTooltip").outerWidth();
            $(this).parent().parent().nextAll(".divTooltip").css("border-radius", "15px 0px 15px 15px");
        }
        else {
            $(this).parent().parent().nextAll(".divTooltip").css("border-radius", "0px 15px 15px 15px");
        }

        $(this).parent().parent().nextAll(".divTooltip").html($(this).attr("data-strName"))
        $(this).parent().parent().nextAll(".divTooltip").css("left", x + "px");
        $(this).parent().parent().nextAll(".divTooltip").css("top", y + "px");
        $(this).parent().parent().nextAll(".divTooltip").css("visibility", "visible");
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("mouseout", ".layoutTooltip", function () {
        $(this).parent().parent().nextAll(".divTooltip").css("visibility", "hidden");
        $(this).parent().parent().nextAll(".arrow-down").css("visibility", "hidden");

        //$(this).parent().parent().prevAll(".divTooltip").css("opacity", 0);
        //$(this).parent().parent().prevAll(".arrow-down").css("opacity", 0);

        //$(this).parent().parent().prevAll(".divTooltip").css("left", "0px");
        //$(this).parent().parent().prevAll(".arrow-down").css("left", "0px");
        //$(this).prevAll(".divTooltip").css("left", 0);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".resetProcessPeriod", function () {
        let intPkCalculation = $(this).data("intpkcalculation");
        let intPkPeriod = $(this).parent().find("#intPkPeriod_" + intPkCalculation).val();

        let intPkCalculationOriginal = intPkCalculation;
        //if (
        //    intPkCalculation.split("_").length > 1
        //) {
        //    intPkCalculationOriginal = intPkCalculation.split("_")[0];
        //}

        if ((intPkCalculationOriginal != "" && intPkCalculationOriginal > 0 && intPkCalculationOriginal != null) &&
            (intPkPeriod != "" && intPkPeriod > 0 && intPkPeriod != null)) {
            $.ajax({
                type: "GET",
                url: "/Period/GetPeriod",
                data: {
                    "intPkPeriod": intPkPeriod
                },
                success: function (objResponse) {
                    if (
                        objResponse.intStatus == 200
                    ) {
                        subResetForm(objResponse.objResponse, intPkCalculation);
                    }
                    else {
                        subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
                    }
                },
                error: function () {
                    subSendNotification("Something wrong.", 400);
                }
            });
        }
        else {
            subResetForm(null, intPkCalculation);
        }
    });

    //------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------
//                                                          //SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subGetCalendar(data_to_GetCalendar, strSunday, boolIsInformative) {
    if (boolIsInformative == "True") {
        $.when(
            $.ajax({
                type: "GET",
                url: "/JobPeriod/GetCalendar",
                data: {
                    "intJobId": data_to_GetCalendar[0],
                    "intPkWorkflow": data_to_GetCalendar[1],
                    "strSunday": strSunday,
                    "boolIsInformative": boolIsInformative
                },
                success: function (response) {
                    htmlResponse = response;
                }
            })
        ).then(function () {
            $("#jobCalendarBody").html(htmlResponse);

            $("#refreshJobPeriod").attr("data-to-GetCalendar", data_to_GetCalendar[0]
                + "|" + data_to_GetCalendar[1] + "|" + strSunday)
            $("#jobPrevWeek").attr("data-to-GetCalendar", data_to_GetCalendar[0]
                + "|" + data_to_GetCalendar[1])
            $("#jobNextWeek").attr("data-to-GetCalendar", data_to_GetCalendar[0]
                + "|" + data_to_GetCalendar[1])
            $("#goToJobDateNow").attr("data-to-GetCalendar", data_to_GetCalendar[0]
                + "|" + data_to_GetCalendar[1])

            $(".job-calendar-container").fadeIn("slow");

            $.when(
                setWeek(strSunday),
                setJobCalendarMonth(strSunday)
            ).then(function () {
                setFormatToCalendar();
            });
        });
    }
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getProcessesAndCalculationsWithPeriods(data_to_GetCalendar, strSunday) {
    $.when(
        $.ajax({
            type: "GET",
            url: "/JobPeriod/GetProcessesAndCalculationsWithPeriods",
            data: {
                "intJobId": data_to_GetCalendar[0],
                "intPkWorkflow": data_to_GetCalendar[1],
                "strSunday": strSunday
            },
            success: function (response) {
                htmlResponse = response;
            }
        })
    ).then(function () {
        $("#jobProcessesCalculationBody").html(htmlResponse);

        $(".jobDatePicker").each(function () {
            $(this).datetimepicker({
                format: "YYYY-MM-DD HH:mm"
            });
        });

        getEmployeesForResource();

        $("#accordion").fadeIn("fast");
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getEmployeesForResource() {
    $.ajax({
        type: "POST",
        url: "/Period/GetEmployees",
        success: function (response) {
            let arrEmployee = response.objResponse;
            let select = $(".selectEmployee");

            select.each(function (index, value) {
                $(this).html("");

                option = document.createElement("option");
                option.value = "";
                option.text = "-";
                $(this).append(new Option(option.text, option.value));

                let data_intnContactId = $(this).attr("data-intnContactId");
                for (var i = 0; i < arrEmployee.length; i++) {
                    var obj = arrEmployee[i];
                    option = document.createElement("option");
                    option.value = obj.intContactId;
                    option.text = obj.strFirstName + " " + obj.strLastName;
                    $(this).append(new Option(option.text, option.value));
                }
                $(this).val(data_intnContactId).change();
            });
            //objResponse = response;
        }
    })
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function setWeek(sunday) {
    //debugger
    let weekArray = moment.weekdays();
    let strDate = null;

    let job_day_week_inline_item = $("#divOfWeekDate").find(".job-day-week-inline-item").toArray()

    for (var i = 0; i < 7; i++) {
        let date = moment(sunday, "YYYY-MM-DD").day(weekArray[i]);
        let day = date.date() < 10 ? "0" + date.date() : date.date();
        let month = date.month();
        month = moment(month + 1, "M").format("MM");
        let year = date.year();
        year = moment(year, "YYYY").format("YYYY");
        strDate = year + "-" + month + "-" + day;

        $("#" + job_day_week_inline_item[i].id).attr("data-strDay", arrstrShortDay[i]);
        $("#" + job_day_week_inline_item[i].id).attr("data-strDate", strDate);
        $("#" + job_day_week_inline_item[i].id).html(arrstrDay[i] + " " + day);
    }
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function setJobCalendarMonth(currentDate) {
    //debugger
    var firstday = moment(currentDate, "YYYY-MM-DD").day("Sunday").month();
    var lastday = moment(currentDate, "YYYY-MM-DD").day("Saturday").month();

    var yearFirstday = moment(currentDate, "YYYY-MM-DD").day("Sunday").year();
    var yearLastday = moment(currentDate, "YYYY-MM-DD").day("Saturday").year();

    let arrMonth = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September",
        "October", "November", "December");
    if (arrMonth[firstday] != arrMonth[lastday]) {
        $(".divMonth").html(arrMonth[firstday] + " " + yearFirstday + " - " + arrMonth[lastday] + " " + yearLastday);
    }
    else {
        $(".divMonth").html(arrMonth[firstday] + " " + yearFirstday);
    }
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subConfirmAddPeriod(objResponse, period, strPasswordInput,
    data_toRefreshCalendar, divElement, boolRefreshCalculations) {
    $(".btnYesNo").css("display", "block");
    $(".btnOk").css("display", "none");
    $("#confirmation-modal").modal('show');
    $("#myModalBody").html(
        "<span class='font-bold'>" + objResponse.strUserMessage + "<br /> Set anyway?</span><br />" + strPasswordInput
    );

    $("#modal-btn-yes").unbind();
    $("#modal-btn-no").unbind();
    $("#modal-btn-yes").bind("click", function () {
        period.strPassword = $("#strConfirmPassword").val();
        subSetProcessPeriod(period, data_toRefreshCalendar, divElement, boolRefreshCalculations);
        $("#confirmation-modal").modal('hide');
    });
    $("#modal-btn-no").bind("click", function () {
        $("#confirmation-modal").modal('hide');
        subResetForm(objResponse.objResponse.period, period.intPeriodId);
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subSetProcessPeriod(period, data_toRefreshCalendar, divElement, boolRefreshCalculations) {
    $.ajax({
        type: "POST",
        url: "/ProcessPeriod/SetPeriod",
        data: period,
        success: function (objResponse) {
            if (objResponse.intStatus == 200) {
                $("#estimateDateLabel-" + period.intJobId).html("Estimated Date: " +
                    objResponse.objResponse.strEstimatedDate);

                if (
                    //										//If the the intnPkPeriod equals 0, then the period it's a
                    //										//		new one, so add the delete button.
                    period.intnPkPeriod == ""
                ) {
                    //										//Set the value for intnPkPeriod.
                    divElement.find("#intPkPeriod_" + period.intPeriodId).val(objResponse.objResponse.intnPkPeriod);

                    //									//Append the delete button to the section.
                    divElement.append('<button class="btn btn-sm btn-danger deleteJobPeriod" value="' +
                        objResponse.objResponse.intnPkPeriod + '" data-intpkcalculation="' + period.intPeriodId
                        + '" ' + 'data-torefreshcalendar="' + data_toRefreshCalendar.join('|') +
                        '"><i class="fa fa-trash"' + ' aria-hidden="true"></i></button >');
                }

                $.when(
                    subGetCalendar(data_toRefreshCalendar, data_toRefreshCalendar[2])
                ).then(function () {
                    if (boolRefreshCalculations) {
                        getProcessesAndCalculationsWithPeriods(data_toRefreshCalendar, data_toRefreshCalendar[2])
                    }
                });
            }
            else if (objResponse.objResponse != null) {
                subResetForm(objResponse.objResponse, period.intPeriodId);
            }

            subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
        },
        error: function () {
            subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function setFormatToCalendar() {
    subSetFormatToRules();
    subSetFormatToProcess();
    subSetFormatToPeriods();
    subSetInitialStyles();
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subSetInitialStyles() {
    //let left = $(".divTooltip").prev().outerWidth();
    //$(".divTooltip").removeAttr("style");
    //$(".divTooltip").attr("style", "left: -" + left + "px;");

    $("#processToDrawing").find(".processToDrawingRow").each(function (index, value) {
        let sumLayoutRulesWidth = 0;
        $(this).find(".layoutRules").each(function (index, value) {
            sumLayoutRulesWidth = sumLayoutRulesWidth + $(this).outerWidth();
        });

        let sumLayoutProcessWidth = 0;
        $(this).find(".layoutProcess").each(function (index, value) {
            let style = $(this).attr("style");
            style = style + "left: -" + sumLayoutRulesWidth + "px; ";

            $(this).removeAttr("style");
            $(this).attr("style", style);

            if ($(this).width() > 0) {
                sumLayoutProcessWidth = sumLayoutProcessWidth + $(this).width();
            }
        });

        $(this).find(".layoutPeriods").each(function (index, value) {
            let style = $(this).attr("style");

            let sumRulesAndProcess = sumLayoutProcessWidth + sumLayoutRulesWidth + $(this).width();

            let processToDrawing = $(this).parent().parent().width();

            if (sumRulesAndProcess > processToDrawing) {
                let processToDrawingHeight = $(this).prev(".layoutProcess").outerHeight();
                style = style + "top: -" + processToDrawingHeight + "px; ";
                style = style + "left:0px; ";
            }
            else {
                style = style + "left: -" + (sumRulesAndProcess - $(this).width()) + "px; ";
            }

            $(this).removeAttr("style");
            $(this).attr("style", style);
        });
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subSetFormatToProcess() {
    //                                                      //To iterate all levels
    $("#processToDrawing").find(".processToDrawingRow").each(function (index, value) {
        //                                                  //To iterate all process by level
        $(this).find(".layoutProcess").find(".container-of-process").each(function (index, value) {
            //                                              //To get the initial style
            //                                              // when this method calculate the width and postition,
            //                                              // this method will create a string to concatenate
            //                                              // to the initial style.
            let style = $(this).attr("style");

            //                                              //To get all data of the process
            let data_startDate = $("#" + value.id).attr("data-startDate")
            let data_endDate = $("#" + value.id).attr("data-endDate")
            let data_startTime = $("#" + value.id).attr("data-startTime")
            let data_endTime = $("#" + value.id).attr("data-endTime")

            //                                              // To get the initial hour where the process is starting
            let startHour = parseInt(data_startTime.split(":")[0])

            //                                              // To get the ending hour where the process is ending
            let endHour = parseInt(data_endTime.split(":")[0])

            //                                              //To get day of week in base of start date and end date
            //                                              // Example: "sun"
            let strStartDay = $("#divOfWeekDate").find("[data-strDate='" + data_startDate + "']").attr("data-strDay");
            let strEndDay = $("#divOfWeekDate").find("[data-strDate='" + data_endDate + "']").attr("data-strDay");

            let boolStartIsPreviousWeek = false;
            let boolEndIsNextWeek = false;
            if (strStartDay == undefined) {
                let sunday = moment(currentSunday, "YYYY-MM-DD").day("Sunday").format("YYYY-MM-DD");
                strStartDay = $("#divOfWeekDate").find("[data-strDate='" + sunday + "']").attr("data-strDay");
                startHour = 0;
                boolStartIsPreviousWeek = true;
            }
            if (strEndDay == undefined) {
                let saturday = moment(currentSunday, "YYYY-MM-DD").day("Saturday").format("YYYY-MM-DD");
                strEndDay = $("#divOfWeekDate").find("[data-strDate='" + saturday + "']").attr("data-strDay");
                endHour = 23;
                boolEndIsNextWeek = true;
            }

            //                                              //To get div of week in base of string start date and 
            //                                              //  string end date
            //                                              //Example: All hours of the monday
            let divOfStartDay = $(".divOfDay[data-strDay='" + strStartDay + "']");
            let divOfEndDay = $(".divOfDay[data-strDay='" + strEndDay + "']");


            //if (startHour > 0) {
            //    startHour = startHour - 1;
            //}
            //else {
            //    startHour = 0;
            //}
            //if (endHour > 0) {
            //    endHour = endHour - 1;
            //}
            //else {
            //    endHour = 0;
            //}

            //                                              // To get the specific start hour div
            let divOfStartHour = divOfStartDay.find("[data-hour='" + startHour + "']");

            //let x = divOfStartHour.prev().length == 0 ? 0 : divOfStartHour.prev().position().left;

            let x = 0;

            if (divOfStartHour.prev().length > 0) {
                x = divOfStartHour.prev().position().left;
            }
            else {
                if (divOfStartHour.parent().parent().prev().length > 0) {
                    x = divOfStartHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().position().left;
                    x = x + divOfStartHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().outerWidth();
                }
            }

            //                                              // To get the specific end hour div
            let divOfEndHour = divOfEndDay.find("[data-hour='" + endHour + "']");

            //                                              //To get the position of the end div
            let y = 0;

            if (divOfEndHour.prev().length > 0) {
                y = divOfEndHour.prev().position().left;
            }
            else {
                if (divOfEndHour.parent().parent().prev().length > 0) {
                    y = divOfEndHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().position().left;
                    y = y + divOfEndHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().outerWidth();
                }
            }


            //                                              //If the start time have miunutes
            if (parseInt(data_startTime.split(":")[1]) != undefined) {

                //                                          //Calculate the minutes width
                let minutes = boolStartIsPreviousWeek == true ? (0 * parseFloat(divOfStartHour.width())) / 60 :
                    (parseInt(data_startTime.split(":")[1]) * parseFloat(divOfStartHour.width())) / 60;

                //                                          //Add the result to the divOfStartHour position
                x = x + minutes;
            }

            //                                              //If the end time have miunutes
            if (parseInt(data_endTime.split(":")[1]) != undefined) {

                //                                          //Calculate the minutes width
                let minutes = boolEndIsNextWeek == true ? (60 * parseFloat(divOfEndHour.outerWidth())) / 60 :
                    (parseInt(data_endTime.split(":")[1]) * parseFloat(divOfEndHour.outerWidth())) / 60;

                //                                          //Add the result to the divOfStartHour position
                y = y + minutes;
            }

            //                                              //Calculate the final width
            let realWidth = y - x;

            //                                              //Create the style string to div's that represents the
            //                                              //  "process"
            style = style + "width: " + realWidth + "px; ";

            //                                              //Remove the current style
            $(this).removeAttr("style");

            //                                              //Set the new style
            $(this).attr("style", style);

            let initialPosition = 0;
            $(this).prevAll().each(function (index, value) {
                initialPosition = initialPosition + $("#" + value.id).outerWidth();
            });

            initialPosition = initialPosition * (-1);

            style = style + "left: " + initialPosition + "px; ";

            $(this).removeAttr("style");
            $(this).attr("style", style);

            x = initialPosition + x;

            style = style + "left: " + x + "px; ";

            $(this).removeAttr("style");
            $(this).attr("style", style);

            $(this).attr("data-position", x);
        });
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subSetFormatToRules() {
    //                                                      //To iterate all levels
    $("#processToDrawing").find(".processToDrawingRow").each(function (index, value) {
        //                                                  //To iterate all process by level
        $(this).find(".layoutRules").find(".rule-container-of-process").each(function (index, value) {
            //                                              //To get the initial style
            //                                              // when this method calculate the width and postition,
            //                                              // this method will create a string to concatenate
            //                                              // to the initial style.
            let style = $(this).attr("style");

            //                                              //To get all data of the process
            let data_startDate = $("#" + value.id).attr("data-startDate")
            let data_endDate = $("#" + value.id).attr("data-endDate")
            let data_startTime = $("#" + value.id).attr("data-startTime")
            let data_endTime = $("#" + value.id).attr("data-endTime")
            let data_boolIsTheFirstPeriod = $("#" + value.id).attr("data-boolIsTheFirstPeriod")
            let data_boolIsTheLastPeriod = $("#" + value.id).attr("data-boolIsTheLastPeriod")

            //                                              // To get the initial hour where the process is starting
            let startHour = parseInt(data_startTime.split(":")[0])

            //                                              // To get the ending hour where the process is ending
            let endHour = parseInt(data_endTime.split(":")[0])

            //console.info(data_startDate + "\n" + data_endDate + "\n" + data_startTime + "\n" + data_endTime);
            //                                              //To get day of week in base of start date and end date
            //                                              // Example: "sun"
            let strStartDay = $("#divOfWeekDate").find("[data-strDate='" + data_startDate + "']").attr("data-strDay");
            let strEndDay = $("#divOfWeekDate").find("[data-strDate='" + data_endDate + "']").attr("data-strDay");

            let boolStartIsPreviousWeek = false;
            let boolEndIsNextWeek = false;
            if (strStartDay == undefined) {
                let sunday = moment(currentSunday, "YYYY-MM-DD").day("Sunday").format("YYYY-MM-DD");
                strStartDay = $("#divOfWeekDate").find("[data-strDate='" + sunday + "']").attr("data-strDay");
                startHour = 0;
                boolStartIsPreviousWeek = true;
            }
            if (strEndDay == undefined) {
                let saturday = moment(currentSunday, "YYYY-MM-DD").day("Saturday").format("YYYY-MM-DD");
                strEndDay = $("#divOfWeekDate").find("[data-strDate='" + saturday + "']").attr("data-strDay");
                endHour = 23;
                boolEndIsNextWeek = true;
            }

            //                                              //To get div of week in base of string start date and 
            //                                              //  string end date
            //                                              //Example: All hours of the monday
            let divOfStartDay = $(".divOfDay[data-strDay='" + strStartDay + "']");
            let divOfEndDay = $(".divOfDay[data-strDay='" + strEndDay + "']");

            //                                              // To get the specific start hour div
            let divOfStartHour = divOfStartDay.find("[data-hour='" + startHour + "']");

            //let x = divOfStartHour.prev().length == 0 ? 0 : divOfStartHour.prev().position().left;

            let x = 0;

            if (divOfStartHour.prev().length > 0) {
                x = divOfStartHour.prev().position().left;
            }
            else {
                if (divOfStartHour.parent().parent().prev().length > 0) {
                    x = divOfStartHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().position().left;
                    x = x + divOfStartHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().outerWidth();
                }
            }

            //                                              // To get the specific end hour div
            let divOfEndHour = divOfEndDay.find("[data-hour='" + endHour + "']");

            //                                              //To get the position of the end div
            //let y = divOfEndHour.prev().length == 0 ? 0 : divOfEndHour.prev().position().left;

            let y = 0;

            if (divOfEndHour.prev().length > 0) {
                y = divOfEndHour.prev().position().left;
            }
            else {
                if (divOfEndHour.parent().parent().prev().length > 0) {
                    y = divOfEndHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().position().left;
                    y = y + divOfEndHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().outerWidth();
                }
            }

            //                                              //If the start time have miunutes
            if (parseInt(data_startTime.split(":")[1]) != undefined) {

                //                                          //Calculate the minutes width
                let minutes = boolStartIsPreviousWeek == true ? (0 * parseFloat(divOfStartHour.outerWidth())) / 60 :
                    (parseInt(data_startTime.split(":")[1]) * parseFloat(divOfStartHour.outerWidth())) / 60;

                //                                          //Add the result to the divOfStartHour position
                x = x + minutes;
            }

            //                                              //If the end time have miunutes
            if (parseInt(data_endTime.split(":")[1]) != undefined) {

                //                                          //Calculate the minutes width
                let minutes = boolEndIsNextWeek == true ? (59 * parseFloat(divOfEndHour.outerWidth())) / 60 :
                    (parseInt(data_endTime.split(":")[1]) * parseFloat(divOfEndHour.outerWidth())) / 60;

                //                                          //Add the result to the divOfStartHour position
                y = y + minutes;
            }

            //                                              //Calculate the final width
            let realWidth = y - x;

            //                                              //Create the style string to div's that represents the
            //                                              //  "process"
            style = style + "width: " + realWidth + "px; ";

            //                                              //Remove the current style
            $(this).removeAttr("style");

            //                                              //Set the new style
            $(this).attr("style", style);

            let initialPosition = 0;
            $(this).prevAll().each(function (index, value) {
                initialPosition = initialPosition + $("#" + value.id).outerWidth();
            });
            //console.info(initialPosition)

            initialPosition = initialPosition * (-1);

            style = style + "left: " + initialPosition + "px; ";

            $(this).removeAttr("style");
            $(this).attr("style", style);

            x = initialPosition + x;

            style = style + "left: " + x + "px; ";

            $(this).removeAttr("style");
            $(this).attr("style", style);
        });
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subSetFormatToPeriods() {
    //                                                      //To iterate all levels
    $("#processToDrawing").find(".processToDrawingRow").each(function (index, value) {
        //                                                  //To iterate all process by level
        $(this).find(".layoutPeriods").find(".period").each(function (index, value) {
            //                                              //To get the initial style
            //                                              // when this method calculate the width and postition,
            //                                              // this method will create a string to concatenate
            //                                              // to the initial style.
            let style = $(this).attr("style");

            //                                              //To get all data of the process
            let data_startDate = $("#" + value.id).attr("data-startDate")
            let data_endDate = $("#" + value.id).attr("data-endDate")
            let data_startTime = $("#" + value.id).attr("data-startTime")
            let data_endTime = $("#" + value.id).attr("data-endTime")
            let data_boolIsTheFirstPeriod = $("#" + value.id).attr("data-boolIsTheFirstPeriod")
            let data_boolIsTheLastPeriod = $("#" + value.id).attr("data-boolIsTheLastPeriod")

            //                                              // To get the initial hour where the process is starting
            let startHour = parseInt(data_startTime.split(":")[0])

            //                                              // To get the ending hour where the process is ending
            let endHour = parseInt(data_endTime.split(":")[0])

            //console.info(data_startDate + "\n" + data_endDate + "\n" + data_startTime + "\n" + data_endTime);
            //                                              //To get day of week in base of start date and end date
            //                                              // Example: "sun"
            let strStartDay = $("#divOfWeekDate").find("[data-strDate='" + data_startDate + "']").attr("data-strDay");
            let strEndDay = $("#divOfWeekDate").find("[data-strDate='" + data_endDate + "']").attr("data-strDay");

            let boolStartIsPreviousWeek = false;
            let boolEndIsNextWeek = false;
            if (strStartDay == undefined) {
                let sunday = moment(currentSunday, "YYYY-MM-DD").day("Sunday").format("YYYY-MM-DD");
                strStartDay = $("#divOfWeekDate").find("[data-strDate='" + sunday + "']").attr("data-strDay");
                startHour = 0;
                boolStartIsPreviousWeek = true;
            }
            if (strEndDay == undefined) {
                let saturday = moment(currentSunday, "YYYY-MM-DD").day("Saturday").format("YYYY-MM-DD");
                strEndDay = $("#divOfWeekDate").find("[data-strDate='" + saturday + "']").attr("data-strDay");
                endHour = 23;
                boolEndIsNextWeek = true;
            }

            //                                              //To get div of week in base of string start date and 
            //                                              //  string end date
            //                                              //Example: All hours of the monday
            let divOfStartDay = $(".divOfDay[data-strDay='" + strStartDay + "']");
            let divOfEndDay = $(".divOfDay[data-strDay='" + strEndDay + "']");

            //                                              // To get the specific start hour div
            let divOfStartHour = divOfStartDay.find("[data-hour='" + startHour + "']");

            //let x = divOfStartHour.prev().length == 0 ? 0 : divOfStartHour.prev().position().left;

            let x = 0;

            if (divOfStartHour.prev().length > 0) {
                x = divOfStartHour.prev().position().left;
            }
            else {
                if (divOfStartHour.parent().parent().prev().length > 0) {
                    x = divOfStartHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().position().left;
                    x = x + divOfStartHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().outerWidth();
                }
            }

            //                                              // To get the specific end hour div
            let divOfEndHour = divOfEndDay.find("[data-hour='" + endHour + "']");

            //                                              //To get the position of the end div
            //let y = divOfEndHour.prev().length == 0 ? 0 : divOfEndHour.prev().position().left;

            let y = 0;

            if (divOfEndHour.prev().length > 0) {
                y = divOfEndHour.prev().position().left;
            }
            else {
                if (divOfEndHour.parent().parent().prev().length > 0) {
                    y = divOfEndHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().position().left;
                    y = y + divOfEndHour.parent().parent().prev().find(".row").find("[data-hour='23']").prev().outerWidth();
                }
            }

            //                                              //If the start time have miunutes
            if (parseInt(data_startTime.split(":")[1]) != undefined) {

                //                                          //Calculate the minutes width
                let minutes = boolStartIsPreviousWeek == true ? (0 * parseFloat(divOfStartHour.outerWidth())) / 60 :
                    (parseInt(data_startTime.split(":")[1]) * parseFloat(divOfStartHour.outerWidth())) / 60;

                //                                          //Add the result to the divOfStartHour position
                x = x + minutes;
            }

            //                                              //If the end time have miunutes
            if (parseInt(data_endTime.split(":")[1]) != undefined) {

                //                                          //Calculate the minutes width
                let minutes = boolEndIsNextWeek == true ? (59 * parseFloat(divOfEndHour.outerWidth())) / 60 :
                    (parseInt(data_endTime.split(":")[1]) * parseFloat(divOfEndHour.outerWidth())) / 60;

                //                                          //Add the result to the divOfStartHour position
                y = y + minutes;
            }

            //                                              //Calculate the final width
            let realWidth = y - x;

            //                                              //Create the style string to div's that represents the
            //                                              //  "process"
            style = style + "width: " + realWidth + "px; ";

            //                                              //Remove the current style
            $(this).removeAttr("style");

            //                                              //Set the new style
            $(this).attr("style", style);

            let initialPosition = 0;
            $(this).prevAll().each(function (index, value) {
                //console.info(value)
                initialPosition = initialPosition + $("#" + value.id).outerWidth();
            });
            //console.info(initialPosition)

            initialPosition = initialPosition * (-1);

            style = style + "left: " + initialPosition + "px; ";

            $(this).removeAttr("style");
            $(this).attr("style", style);

            x = initialPosition + x;

            style = style + "left: " + x + "px; ";

            $(this).removeAttr("style");
            $(this).attr("style", style);

            if (data_boolIsTheFirstPeriod == "True") {
                $(this).append('<div style="float: left; position: relative; left: -18px; color: black; font-size: 20px; z-index: 1001">' +
                    '<i class="fa fa-chevron-circle-right" aria-hidden="true"></i>' +
                    '</div>'
                )
            }
            if (data_boolIsTheLastPeriod == "True") {
                $(this).append('<div style="float: left; position: relative; left: ' + (realWidth) + 'px; color: black; font-size: 20px;; z-index: 1001">' +
                    '<i class="fa fa-chevron-circle-left" aria-hidden="true"></i>' +
                    '</div>'
                )
            }

            $(this).attr("data-position", x);
            //console.info(data_boolIsTheFirstPeriod)
            //console.info(data_boolIsTheLastPeriod)
        });
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subResetForm(periodObject, intPkCalculation) {
    debugger
    if (periodObject != null) {
        let strStartTime = periodObject.strStartTime.split(':');
        let strEndTime = periodObject.strEndTime.split(':');

        $("#strStartDateJob_" + intPkCalculation).val(periodObject.strStartDate + " " + strStartTime[0] + ":"
            + strStartTime[1]);

        $("#strEndDateJob_" + intPkCalculation).val(periodObject.strEndDate + " " + strEndTime[0] + ":"
            + strEndTime[1]);

        $("#intMinsBeforeDelete_" + intPkCalculation).val(periodObject.intMinsBeforeDelete);

        $("#strEmployee_" + intPkCalculation).val(periodObject.intnContactId);
    }
    else {
        $("#strStartDateJob_" + intPkCalculation).val(null);

        $("#strEndDateJob_" + intPkCalculation).val(null);

        $("#intMinsBeforeDelete_" + intPkCalculation).val("");

        $("#strEmployee_" + intPkCalculation).val("");
    }
}