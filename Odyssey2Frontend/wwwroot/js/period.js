let calendarDate = null;
let periodWeek = null;
let arrPrevCells = null;
$(document).ready(function () {

    //------------------------------------------------------------------------------------------------------------------
    $(document).ready(function () {
        $('#strStartDate').datetimepicker({
            format: "YYYY-MM-DD HH:mm"
        });

        $('#strEndDate').datetimepicker({
            format: "YYYY-MM-DD HH:mm"
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    //$('#setPeriodModal').on('hidden.bs.modal', function () {
    //    //loader();
    //    disableElements();
    //    location.reload();
    //});

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".periodModal", function () {
        //debugger
        let strDate = getDateSunday();
        let data_job_info = $(this).attr("data-job-info").split("|");
        let strResource = $(this).attr("data-strResource");
        let objResponse = null;
        $.when(
            $.ajax({
                type: "POST",
                url: "/Period/GetWeek",
                data: { "intPkResource": data_job_info[1], "strDate": strDate },
                success: function (response) {
                    //console.info(response)
                    objResponse = response;
                }
            })
        ).then(function () {

            if (objResponse.intStatus == 200) {
                $.each(objResponse.objResponse, function (index, val) {
                    setPeriods(index, val);
                });
            }
            else {
                subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
            }

            calendarDate = getCurrentDate();
            getInitialDaysOfWeek(calendarDate);
            $("#modalPeriodTitle").html("Set Period for " + strResource + " - " + data_job_info[0]);

            $(".nextWeek").removeAttr("data-intPkResource");
            $(".prevWeek").removeAttr("data-intPkResource");
            $("#gotoCurrentWeek").removeAttr("data-intPkResource");
            $("#refreshWeek").removeAttr("data-intPkResource");
            $(".nextWeek").attr("data-intPkResource", data_job_info[1]);
            $(".prevWeek").attr("data-intPkResource", data_job_info[1]);
            $("#gotoCurrentWeek").attr("data-intPkResource", data_job_info[1]);
            $("#refreshWeek").attr("data-intPkResource", data_job_info[1]);

            $("#addNewPeriod").removeAttr("data-new-period");
            $("#addNewPeriod").attr("data-new-period", data_job_info[1] + "|" + data_job_info[2] + "|" +
                data_job_info[3] + "|" + data_job_info[4]);
            $("#intPkResourceModal").val(data_job_info[1]);

            subGetPeriodsByDay(calendarDate, data_job_info[1]);

            $(".getAvailableTimes").attr("data-suggested", data_job_info[1] + "|" + data_job_info[5] + "|" +
                data_job_info[2] + "|" + data_job_info[3] + "|" + data_job_info[4])

            getAvailableTimes(data_job_info[1], data_job_info[5], data_job_info[2], data_job_info[3], data_job_info[4], "ready");
            getEmployees();

            subGetResourcePeriods(data_job_info[1], data_job_info[5], data_job_info[2], data_job_info[3], data_job_info[4]);
            $("#setPeriodModal").modal("show");
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", "#addNewPeriod", function () {
        //debugger
        let data_new_period = $(this).attr("data-new-period").split("|");
        let period;
        let strPassword = null;

        if ($("#intPkPeriod").val() != "") {
            period = {
                "intPkPeriod": $("#intPkPeriod").val(),
                "intnPkPeriod": $("#intPkPeriod").val(),
                "strPassword": strPassword,
                "intPkResource": data_new_period[0],
                "intJobId": $("#resourcePeriodForm").find("input[name=intJobId]").val(),
                "intPkProcessInWorkflow": data_new_period[1],
                "strStartDate": $("#strStartDate").val().split(" ")[0],
                "strStartTime": $("#strStartDate").val().split(" ")[1] + ":00",
                "strEndDate": $("#strEndDate").val().split(" ")[0],
                "strEndTime": $("#strEndDate").val().split(" ")[1] + ":00",
                "intnContactId": $("#strEmployee").val(),
                "intPkEleetOrEleele": data_new_period[2],
                "boolIsEleet": data_new_period[3],
                "intMinsBeforeDelete": $("#intMinsBeforeDelete").val(),
                "intPeriodId": null
            };
        }
        else {
            period = {
                "intnPkPeriod": null,
                "intPkResource": data_new_period[0],
                "strPassword": strPassword,
                "strStartDate": $("#strStartDate").val().split(" ")[0],
                "strStartTime": $("#strStartDate").val().split(" ")[1] + ":00",
                "strEndDate": $("#strEndDate").val().split(" ")[0],
                "strEndTime": $("#strEndDate").val().split(" ")[1] + ":00",
                "intJobId": $("#resourcePeriodForm").find("input[name=intJobId]").val(),
                "intPkProcessInWorkflow": data_new_period[1],
                "intPkEleetOrEleele": data_new_period[2],
                "boolIsEleet": data_new_period[3],
                "intnContactId": $("#strEmployee").val(),
                "intMinsBeforeDelete": $("#intMinsBeforeDelete").val(),
                "intPeriodId": null
            };
        }

        //console.info(period);

        $.ajax({
            type: "POST",
            url: "/Period/PeriodIsAddable",
            data: period,
            success: function (objResponse) {
                if (objResponse.intStatus == 200) {
                    let strPasswordInput = "<input type='password' placeholder='Special Password' class='input-with-dropdowns form-control mt-2' id ='strConfirmPassword' />";
                    if (objResponse.objResponse.boolIsAddableAboutPeriods == true &&
                        objResponse.objResponse.boolIsAddableAboutRules == true) {
                        subAddOrModifyPeriod(data_new_period, period);
                    }
                    else if (objResponse.objResponse.boolIsAddableAboutPeriods == true &&
                        objResponse.objResponse.boolIsAddableAboutRules == false) {
                        subConfirmAddOrModifyPeriod(objResponse, period, strPasswordInput, data_new_period);
                    }
                    else if (objResponse.objResponse.boolIsAddableAboutPeriods == false &&
                        objResponse.objResponse.boolIsAddableAboutRules == true) {
                        strPasswordInput = "";
                        subConfirmAddOrModifyPeriod(objResponse, period, strPasswordInput, data_new_period);
                    }
                    else if (objResponse.objResponse.boolIsAddableAboutPeriods == false &&
                        objResponse.objResponse.boolIsAddableAboutRules == false) {
                        subConfirmAddOrModifyPeriod(objResponse, period, strPasswordInput, data_new_period);
                    }
                    else {
                        subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
                    }
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
    $(document).on("click", ".prevWeek", function () {
        //debugger
        let intPkResource = $(this).attr("data-intPkResource");

        $(".task-cell").removeClass("topBorder-OtherJob");
        $(".task-cell").removeClass("topBorder-currentJob");
        //$(".task-cell").find("div").css("background-color", "#fff");
        //debugger
        cleanCalendar();
        calendarDate = getPreviousWeek(calendarDate);
        getDaysOfWeek(intPkResource, calendarDate);
        //console.info(calendarDate)

        $("#resourcePeriodSelect").val("");
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".nextWeek", function () {
        //debugger
        let intPkResource = $(this).attr("data-intPkResource");

        $(".task-cell").removeClass("topBorder-currentJob");
        $(".task-cell").removeClass("topBorder-OtherJob");
        //$(".task-cell").find("div").css("background-color", "#fff");
        cleanCalendar();
        calendarDate = getNextWeek(calendarDate);
        getDaysOfWeek(intPkResource, calendarDate);

        $("#resourcePeriodSelect").val("");
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", "#gotoCurrentWeek", function () {
        //debugger
        let intPkResource = $(this).attr("data-intPkResource");

        $(".task-cell").removeClass("topBorder-currentJob");
        $(".task-cell").removeClass("topBorder-OtherJob");
        //$(".task-cell").find("div").css("background-color", "#fff");
        cleanCalendar();
        calendarDate = getDateSunday();
        getDaysOfWeek(intPkResource, calendarDate);

        $("#resourcePeriodSelect").val("");
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", "#refreshWeek", function () {
        //debugger
        let intPkResource = $(this).attr("data-intPkResource");

        $(".task-cell").removeClass("topBorder-currentJob");
        $(".task-cell").removeClass("topBorder-OtherJob");
        //$(".task-cell").find("div").css("background-color", "#fff");
        cleanCalendar();
        let sunday = moment(calendarDate, "YYYY-MM-DD").day("Sunday").format("YYYY-MM-DD");
        //console.info(sunday);
        getDaysOfWeek(intPkResource, sunday);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".openOption", function () {
        //debugger
        let intPkPeriod = $(this).attr("data-period")
        //console.info(intPkPeriod)

        $.ajax({
            type: "GET",
            url: "/Period/GetPeriod",
            data: { "intPkPeriod": intPkPeriod },
            success: function (response) {
                //console.info(response)
                if (response.intStatus == 200) {
                    //debugger
                    $("#intPkPeriod").val(response.objResponse.intPk);
                    $("#resourcePeriodForm").find("input[name=intJobId]").val(response.objResponse.intJobId);
                    $("#resourcePeriodForm").find("input[name=strJobNumber]").val(response.objResponse.strJobNumber);

                    let arrStartTime = response.objResponse.strStartTime.split(":");
                    //$("#strStartTimeHour").val(arrStartTime[0]);
                    //$("#strStartTimeMin").val(arrStartTime[1]);
                    $("#strStartDate").val(response.objResponse.strStartDate + " " + arrStartTime[0] + ":" + arrStartTime[1]);

                    let arrEndTime = response.objResponse.strEndTime.split(":");
                    //$("#strEndDateHour").val(arrEndTime[0]);
                    //$("#strEndDateMin").val(arrEndTime[1]);
                    $("#strEndDate").val(response.objResponse.strEndDate + " " + arrEndTime[0] + ":" + arrEndTime[1]);

                    $("#strEmployee").val(response.objResponse.intnContactId).change();

                    $("#intMinsBeforeDelete").val(response.objResponse.intMinsBeforeDelete);

                    $("#addNewPeriod").html("Update");

                    subSendNotification(response.strUserMessage, response.intStatus);
                }
                else {
                    subSendNotification(response.strUserMessage, response.intStatus);
                }
            }
        })
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".deletePeriod", function () {
        let intPkPeriod = $(this).attr("data-period");
        let intPkResourceModal = $("#intPkResourceModal").val()
        let card = $(this);
        let sunday = null;
        let delDate = $(this).attr("data-date-delete");
        let data_job_info = $("#addNewPeriod").attr("data-new-period").split("|");

        $.when(
            $.ajax({
                type: "POST",
                url: "/Period/DeletePeriod",
                data: { "intPkPeriod": intPkPeriod },
                success: function (response) {
                    //console.info(response)
                    if (response.intStatus == 200) {
                        //debugger
                        subSendNotification(response.strUserMessage, response.intStatus);
                        //card.parent().parent().parent().parent().remove();
                        sunday = response.objResponse.strLastSunday;
                        $("#estimateDateLabel-" + $("#strJobId").val()).html("Estimated Date: " +
                            response.objResponse.strEstimatedDate);
                    }
                    else {
                        subSendNotification(response.strUserMessage, response.intStatus);
                    }
                }
            })
        ).then(function () {
            $(".task-cell").removeClass("topBorder-currentJob");
            $(".task-cell").removeClass("topBorder-OtherJob");
            cleanCalendar();
            subGetPeriodsByDay(delDate, intPkResourceModal);
            getDaysOfWeek(intPkResourceModal, sunday);

            subGetResourcePeriods(data_job_info[0], $("#intJobId").val(), data_job_info[1], data_job_info[2], data_job_info[3]);
            //$("#resourcePeriodSelect").val("");
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".getDay", function () {
        let data_date = $(this).attr("data-date");
        let intPkResourceModal = $("#intPkResourceModal").val()
        subGetPeriodsByDay(data_date, intPkResourceModal);

        $("#resourcePeriodSelect").val("");
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".getAvailableTimes", function () {
        let data_suggested = $(this).attr("data-suggested").split("|");
        getAvailableTimes(data_suggested[0], data_suggested[1], data_suggested[2],
            data_suggested[3], data_suggested[4], "button");
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", "#resourcePeriodSelect", function () {
        if (
            $(this).val() != ""
        ) {
            let intPkResource = $(this).attr("data-intPkResource");

            $(".task-cell").removeClass("topBorder-currentJob");
            $(".task-cell").removeClass("topBorder-OtherJob");

            cleanCalendar();
            getDaysOfWeek(intPkResource, $(this).find("option:selected").data("strdatesunday"));
            subGetPeriodsByDay($(this).val(), intPkResource);
        }
    });

    //------------------------------------------------------------------------------------------------------------------
});

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getEmployees() {
    $.ajax({
        type: "POST",
        url: "/Period/GetEmployees",
        success: function (response) {
            let arrEmployee = response.objResponse;
            let select = $("#strEmployee");
            select.html("");

            option = document.createElement("option");
            option.value = "";
            option.text = "-";
            select.append(new Option(option.text, option.value));

            for (var i = 0; i < arrEmployee.length; i++) {
                var obj = arrEmployee[i];
                option = document.createElement("option");
                option.value = obj.intContactId;
                option.text = obj.strFirstName + " " + obj.strLastName;
                select.append(new Option(option.text, option.value));
            }
            //objResponse = response;
        }
    })
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subGetPeriodsByDay(date, intPkResource) {
    $.ajax({
        type: "POST",
        url: "/Period/GetDay",
        data: { "intPkResource": intPkResource, "strDate": date },
        success: function (response) {
            $("#periodsOfDay").html(response)
        }
    })
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function setPeriods(index, obj) {
    let dayOfWeek = index + 1;
    let arrperPeriods = obj.arrperPeriods;
    //console.info(arrperPeriods)
    $.each(arrperPeriods, function (index, val) {
        //debugger
        let intnPkPeriod = val.intnPkPeriod;
        var dt = new Date(obj.strDate);
        let intDayOfWeek = dt.getDay() + 1;
        let strStartTime = val.strStartTime
        let strEndTime = val.strEndTime
        let start = strStartTime.split(":")[0]
        let end = strEndTime.split(":")[0]

        if (start == 00) {
            start = 0;
        }
        if (end == 00) {
            end = 0;
        }

        var arrCells = new Array();
        for (var i = parseInt(start); i <= parseInt(end); i++) {
            arrCells.push(i + "-" + dayOfWeek);
        }
        //console.info(arrCells)
        let tempStart = null;
        tempStart = parseInt(start);
        let tempEnd = null;
        tempEnd = parseInt(end);

        let tempstrJobId = null;
        let strJobId = null;
        let back_color = null;
        let topColor = null;
        let topB_Period = null;

        if (intnPkPeriod != null) {
            tempstrJobId = $("#intJobId").val();
            strJobId = val.strJobId;
            back_color = "#59a2c8";
            topColor = "topBorder-currentJob";
            topB_Period = "border-top: 0.5px solid #4093AA !important";
            if (tempstrJobId != strJobId) {
                back_color = "#f37024";
                topColor = "topBorder-OtherJob"
                topB_Period = "border-top: 0.5px solid #ff715b !important";
            }
        }
        else {
            back_color = "#dee2e6";
            topColor = "topBorder-rule"
        }
        //console.info(arrCells)
        $.each(arrCells, function (index, val) {
            if (strStartTime.split(":")[0] == strEndTime.split(":")[0]) {
                //debugger

                let hStartMin = parseInt(strStartTime.split(":")[1]);
                let hEndMin = parseInt(strEndTime.split(":")[1]);

                let intTaskCellChild = $(".cell-" + val).find(".task-cell-child").length;
                if (intTaskCellChild == 0) {
                    for (var m = 0; m < 60; m++) {
                        $(".cell-" + val).append('<div class="task-cell-child minute-' + val + "-" + m + '" style="height: 0.8333px"></div>');
                    }
                }
                else {
                    $(".cell-" + val).find(".task-cell-child").css("height", "0.8333px")
                }

                for (var i = hStartMin; i < hEndMin; i++) {
                    $(".cell-" + val).find('.minute-' + val + "-" + i).css("background-color", back_color);
                }
            }
            else {
                //debugger
                if (val == tempStart + "-" + dayOfWeek) {
                    //debugger
                    let minutes = strStartTime.split(":")[1];

                    if (minutes != "00") {
                        let m = parseInt(minutes);

                        let intTaskCellChild = $(".cell-" + val).find(".task-cell-child").length;
                        if (intTaskCellChild == 0) {
                            for (var min = 0; min < 60; min++) {
                                $(".cell-" + val).append('<div class="task-cell-child minute-' + val + "-" + min + '" style="height: 0.8333px"></div>');
                            }
                        }
                        else {
                            $(".cell-" + val).find(".task-cell-child").css("height", "0.8333px")
                        }

                        for (var i = m; i < 60; i++) {
                            $(".cell-" + val).find('.minute-' + val + "-" + i).css("background-color", back_color);
                        }
                    }
                    else {
                        $(".cell-" + val).addClass(topColor)
                        $(".cell-" + val).removeAttr("style");
                        $(".cell-" + val).css("background-color", back_color);
                    }
                }
                else if (val == tempEnd + "-" + dayOfWeek) {
                    let middle = strEndTime.split(":")[1];

                    if (middle != "00") {
                        let m = parseInt(middle);

                        let intTaskCellChild = $(".cell-" + val).find(".task-cell-child").length;
                        if (intTaskCellChild == 0) {
                            for (var min = 0; min < 60; min++) {
                                $(".cell-" + val).append('<div class="task-cell-child minute-' + val + "-" + min + '" style="height: 0.8333px"></div>');
                            }
                        }
                        else {
                            $(".cell-" + val).find(".task-cell-child").css("height", "0.8333px")
                        }

                        $(".cell-" + val).removeAttr("style");
                        $(".cell-" + val).attr("style", topB_Period);
                        for (var i = 0; i <= m; i++) {
                            $(".cell-" + val).addClass("task-cell-child");
                            $(".cell-" + val).find('.minute-' + val + "-" + i).css("background-color", back_color);
                        }
                    }
                    else {
                        $(".cell-" + val).css("background-color", "#fff");
                    }
                }
                else {
                    $(".cell-" + val).addClass(topColor)
                    $(".cell-" + val).removeAttr("style");
                    $(".cell-" + val).css("background-color", back_color);
                }
            }
        });
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function cleanCalendar() {
    //debugger
    $(".task-cell").find(".task-cell-child").css("background-color", "#fff")
    $(".task-cell").find(".task-cell-child").css("height", "0px")
    $(".task-cell").css("background-color", "#fff")
    $(".task-cell").css("border", "0.5px solid #dee2e6")
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getCurrentDate() {
    //debugger
    var today = moment().format("YYYY-MM-DD");
    return today;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getInitialDaysOfWeek(currentDate) {
    //debugger
    let weekArray = moment.weekdays();
    let arrDays = new Array();
    let arrYearMonth = new Array();
    for (var i = 0; i < 7; i++) {
        let date = moment().day(weekArray[i]);
        let day = date.date();
        let month = date.month();
        month = moment(month + 1, "M").format("MM");
        let year = date.year();
        year = moment(year, "YYYY").format("YYYY");
        arrDays.push(day);
        arrYearMonth.push(year + "-" + month + "-");
    }
    setMonthOfWeek(currentDate);
    setDaysOfWeek(arrDays, arrYearMonth);
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getDaysOfWeek(intPkResource, currentDate) {
    //debugger
    $.ajax({
        type: "POST",
        url: "/Period/GetWeek",
        data: { "intPkResource": intPkResource, "strDate": currentDate },
        success: function (response) {
            //console.info(response)
            if (response.intStatus == 200) {
                $.each(response.objResponse, function (index, val) {
                    setPeriods(index, val);
                });
            }
            else {
                subSendNotification(response.strUserMessage, response.intStatus);
            }
        }
    })
    //debugger
    //console.info("Para pintar dias de la semana " + currentDate)
    let weekArray = moment.weekdays();
    let arrDays = new Array();
    let arrYearMonth = new Array();
    for (var i = 0; i < 7; i++) {
        let date = moment(currentDate, "YYYY-MM-DD").day(weekArray[i]);
        let day = date.date();
        let month = date.month();
        month = moment(month + 1, "M").format("MM");
        let year = date.year();
        year = moment(year, "YYYY").format("YYYY");
        arrDays.push(day);
        arrYearMonth.push(year + "-" + month + "-");
    }
    setMonthOfWeek(currentDate);
    setDaysOfWeek(arrDays, arrYearMonth);
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function setDaysOfWeek(arrDays, arrYearMonth) {
    //debugger
    //console.info(arrYearMonth)
    for (var i = 0; i < arrDays.length; i++) {
        let d = i + 1;
        $("#textNumber").find("[data-day-of-week='" + d + "']").find("#dayOfWeek_" + d).html(arrDays[i]);
        let day = arrDays[i];
        if (day < 10) {
            day = "0" + arrDays[i];
        }
        let fullDate = arrYearMonth[i] + day;
        $("#textNumber").find("[data-day-of-week='" + d + "']").find("#dayOfWeek_" + d).removeAttr("data-date")
        $("#textNumber").find("[data-day-of-week='" + d + "']").find("#dayOfWeek_" + d).attr("data-date", fullDate)
    }
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function setMonthOfWeek(currentDate, initialDate) {
    //debugger
    var firstday = moment(currentDate, "YYYY-MM-DD").day("Sunday").month();
    var lastday = moment(currentDate, "YYYY-MM-DD").day("Saturday").month();

    var yearFirstday = moment(currentDate, "YYYY-MM-DD").day("Sunday").year();
    var yearLastday = moment(currentDate, "YYYY-MM-DD").day("Saturday").year();

    let arrMonth = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September",
        "October", "November", "December");
    if (arrMonth[firstday] != arrMonth[lastday]) {
        $(".periodMonth").html(arrMonth[firstday] + " " + yearFirstday + " - " + arrMonth[lastday] + " " + yearLastday);
    }
    else {
        $(".periodMonth").html(arrMonth[firstday] + " " + yearFirstday);
    }
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getPreviousWeek(currentDate) {
    //debugger
    let previousSunday = moment(currentDate, "YYYY-MM-DD").subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');

    //console.info(previousSunday)

    return previousSunday;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getNextWeek(currentDate) {
    //debugger
    var nextSunday = moment(currentDate, "YYYY-MM-DD").add(1, 'week').day(0).format('YYYY-MM-DD');
    //let day = firstday.date();
    //if (parseInt(day) < 10) {
    //    day = "0" + day;
    //}
    //let month = firstday.month();
    //if (parseInt(month) < 10) {
    //    month = "0" + month;
    //}
    //let year = firstday.year();
    //year = moment(year, "YYYY").format("YYYY");
    //let startDayOfWeek = year + "-" + month + "-" + day;

    //console.info(nextSunday)

    return nextSunday;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getDateSunday() {
    let sunday = moment().day("Sunday").format("YYYY-MM-DD");
    //console.info(sunday)
    return sunday;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getAvailableTimes(intPkResource, intJobId, intPkProcessInWorkflow, intPkEleetOrEleele, boolIsEleet, from) {
    $.ajax({
        type: "GET",
        url: "/Period/GetAvailableTimes",
        data: {
            "intPkResource": intPkResource,
            "intJobId": intJobId,
            "intPkProcessInWorkflow": intPkProcessInWorkflow,
            "intPkEleetOrEleele": intPkEleetOrEleele,
            "boolIsEleet": boolIsEleet
        },
        success: function (response) {
            if (response.intStatus == 200) {
                let arrInt = response.objResponse.strStartTime.split(":");
                $("#strStartDate").val(response.objResponse.strStartDate + " " + arrInt[0] + ":" + arrInt[1]);

                arrInt = response.objResponse.strEndTime.split(":");
                $("#strEndDate").val(response.objResponse.strEndDate + " " + arrInt[0] + ":" + arrInt[1]);

                if (from == "button") {
                    subSendNotification(response.strUserMessage, response.intStatus);
                }
            }
            else {
                subSendNotification(response.strUserMessage, response.intStatus);
            }
        }
    })
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subGetResourcePeriods(intPkResource, intJobId, intPkProcessInWorkflow, intPkEleetOrEleele, boolIsEleet) {
    $.ajax({
        type: "GET",
        url: "/Period/GetResourcePeriodsInIoFormJob",
        data: {
            "intPkResource": intPkResource,
            "intJobId": intJobId,
            "intPkProcessInWorkflow": intPkProcessInWorkflow,
            "intPkEleetOrEleele": intPkEleetOrEleele,
            "boolIsEleet": boolIsEleet
        },
        success: function (objResponse) {
            if (objResponse.intStatus == 200) {
                $("#resourcePeriodSelect").html("");
                $("#resourcePeriodSelect").attr("data-intPkResource", intPkResource);
                $("#resourcePeriodSelect").append('<option value="">Select a period</option>');
                $.each(objResponse.objResponse, function (intIndex, object) {
                    $("#resourcePeriodSelect").append('<option value="' + object.strStartDate + '" data-strDateSunday="'
                        + object.strDateSunday + '">Start date: ' + object.strStartDate + ', '
                        + object.strStartTime + '</option>');
                });
            }
            else {
                subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
            }
        },
        error: function () {
            subSendNotification("Something is wrong", 400);
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subAddOrModifyPeriod(data_new_period, period) {
    let url = null;
    let sunday = null;
    let daySelected = period.strStartDate;
    let json = null;
    let intPkPeriod = null;
    
    console.info(period);
    if (period.intnPkPeriod != null) {
        url = "/Period/ModifyPeriod";
    }
    else {
        url = "/Period/AddPeriod";
    }

    $.when(
        $.ajax({
            type: "POST",
            url: url,
            data: period,
            success: function (response) {
                //debugger
                json = response;
                //console.info(json.objResponse);
                if (json.intStatus == 200) {
                    subSendNotification(json.strUserMessage, json.intStatus);
                    $("#estimateDateLabel-" + period.intJobId).html("Estimated Date: "
                        + json.objResponse.strEstimatedDate);

                    $("#resourcePeriodForm").find("input[name=intJobId]").val($("#strJobId").val());
                    $("#resourcePeriodForm").find("input[name=strJobNumber]").val($("#strJobNumber").val());
                    $("#strStartDate, #strEndDate, #strEmployee, #intMinsBeforeDelete").val("");
                    $("#addNewPeriod").html("Add");
                    sunday = json.objResponse.strLastSunday;
                    intPkPeriod = json.objResponse.intPkPeriod;
                    $("#" + data_new_period[1] + "-" + data_new_period[2]).removeClass("bg-warning")
                        .addClass("bg-success");
                }
                else {
                    subSendNotification(json.strUserMessage, json.intStatus);
                }
            }
        })
    ).then(function () {
        if (json.intStatus == 200) {

            if (
                period.intPeriodId != null
            ) {
                if (
                    period.intnPkPeriod == null
                ) {
                    $("#btnDeleteResourcePeriod_" + period.intPeriodId).prop("hidden", false);
                    $("#btnDeleteResourcePeriod_" + period.intPeriodId).val(intPkPeriod);
                    $("#btnResetResourcePeriod_" + period.intPeriodId).attr("data-intPkPeriod", intPkPeriod);
                    $("#btnSetResourcePeriod_" + period.intPeriodId).attr("data-intPkPeriod", intPkPeriod);
                }
                
            }
            //Necesito hacer nejor esta condicion para cuando es una modificacion
            else {
                $(".task-cell").removeClass("topBorder-currentJob");
                $(".task-cell").removeClass("topBorder-OtherJob");
                $("#intPkPeriod").val("");
                cleanCalendar();
                subGetPeriodsByDay(daySelected, data_new_period[0]);
                getDaysOfWeek(data_new_period[0], sunday);
                subGetResourcePeriods(period.intPkResource, period.intJobId, period.intPkProcessInWorkflow,
                    period.intPkEleetOrEleele, period.boolIsEleet);
            }
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subConfirmAddOrModifyPeriod(objResponse, period, strPasswordInput, data_new_period) {
    $(".btnYesNo").css("display", "block");
    $(".btnOk").css("display", "none");
    $("#confirmation-modal").modal('show');
    $("#myModalBody").html(
        "<span class='font-bold'>" + objResponse.strUserMessage + "<br /> Set anyway?</span><br />" + strPasswordInput
    );

    $("#modal-btn-yes").unbind();
    $("#modal-btn-yes").bind("click", function () {
        period.strPassword = $("#strConfirmPassword").val();
        subAddOrModifyPeriod(data_new_period, period);
        $("#confirmation-modal").modal('hide');
    });

    $("#modal-btn-no").unbind();
    $("#modal-btn-no").bind("click", function () {
        $("#strStartDate, #strEndDate, #strEmployee, #resourcePeriodSelect").val("");
        $("#confirmation-modal").modal('hide');
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 