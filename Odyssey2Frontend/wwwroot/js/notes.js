(function ($, undefined) {
    $.fn.getCursorPosition = function () {
        var el = $(this).get(0);
        var pos = 0;
        if ('selectionStart' in el) {
            pos = el.selectionStart;
        } else if ('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    }
})(jQuery);

let arrContactsIds = new Array();
let arrNameAndContact = new Array();
let boolCharFound = false;
let intArroba = 0;
let strTextBeforeEdit = null;

$(document).ready(function () {
    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".openNotesModal", function (e) {
        let intJobId = $(this).attr("data-jobId");
        let intPkWorkflow = $(this).attr("data-intpkworkflow");

        $.ajax({
            type: "POST",
            url: "/JobNotes/Index",
            data: {
                "intJobId": intJobId,
                "intPkWorkflow": intPkWorkflow
            },
            success: function (htmlResponse) {
                $(".notesModalBody").html(htmlResponse)
                $("#notesModal").modal("show")
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".editNote", function (e) {
        $(".divNote").css("display", "none");
        $(".btnDivSaveAndCancel").removeAttr("style");

        strTextBeforeEdit = $("#strOdyssey2Note").val();
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".cancelEdit", function (e) {
        $(".btnDivSaveAndCancel").css("display", "none");
        $(".divNote").removeAttr("style");

        //                                                  //Get original text and replace all the
        //                                                  //      modified text with the original.
        
        $("#strOdyssey2Note").val(strTextBeforeEdit);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnSaveNote", function (e) {
        let intnPkNote = $(".frmAddNote").find("#intnPkNote").val() == 0 ? null : $(".frmAddNote").find("#intnPkNote").val()
        let intJobId = $(".frmAddNote").find("#intJobId").val()
        let strOdyssey2Note = $(".frmAddNote").find("#strOdyssey2Note").val()
        let intPkWorkflow = $(".frmAddNote").find("#intPkWorkflow").val()

        $.ajax({
            type: "POST",
            url: "/JobNotes/SetNote",
            data: {
                "intnPkNote": intnPkNote,
                "intJobId": intJobId,
                "strOdyssey2Note": strOdyssey2Note,
                "intPkWorkflow": intPkWorkflow
            },
            success: function (htmlResponse) {
                $(".notesModalBody").html(htmlResponse)
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnTaskNotes", function (e) {
        let strJobId = $(this).attr("data-strJobId")

        let intnPkPeriod = $(this).attr("data-intnPkPeriod") == undefined ?
            null : $(this).attr("data-intnPkPeriod");

        let intnPkProcessInWorkflow = $(this).attr("data-intnPkProcessInWorkflow") == undefined ?
            null : $(this).attr("data-intnPkProcessInWorkflow");

        let boolFromMyEmployees = $(this).attr("data-boolFromMyEmployees");

        let boolFromWfJobs = $(this).attr("data-boolFromWfJobs");

        $.ajax({
            type: "POST",
            //                                              //Cambiar el consumo al nuevo servicio. Crear el nuevo 
            //                                              //      servicio
            url: "/JobNotes/GetProcessNotes",
            data: {
                "strJobId": strJobId,
                "intnPkPeriod": intnPkPeriod,
                "intnPkProcessInWorkflow": intnPkProcessInWorkflow,
                "boolFromMyEmployees": boolFromMyEmployees,
                "boolFromWfJobs": boolFromWfJobs
            },
            success: function (htmlResponse) {
                $(".taskNotesModalBody").html(htmlResponse)
                $("#taskNotesModal").modal("show")
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnSavePeriodNote", function (e) {
        let intPkProcessInWorkflow = $(this).attr("data-intPkProcessInWorkflow")
        let intJobId = $(this).attr("data-strJobId")
        let strNote = $(".frmAddPeriodNote").find("#strNote").val()
        let boolFromMyEmployees = $(this).attr("data-boolFromMyEmployees")
        let boolFromWfJobs = $(this).attr("data-boolFromWfJobs")

        $.ajax({
            type: "POST",
            url: "/JobNotes/AddProcessNotes",
            data: {
                "intPkProcessInWorkflow": intPkProcessInWorkflow,
                "strNote": strNote,
                "arrContactsIds": arrContactsIds,
                "intJobId": intJobId,
                "boolFromMyEmployees": boolFromMyEmployees,
                "boolFromWfJobs": boolFromWfJobs
            },
            success: function (htmlResponse) {
                $(".taskNotesModalBody").html(htmlResponse)
                arrContactsIds = new Array();
                arrNameAndContact = new Array();
                intArroba = 0;
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("keyup", "#strNote", function (e) {
        let intCount = $(this).getCursorPosition() - 1;

        let char = $(this).val().charAt(intCount);
        while (!(
            char == " " ||
            intCount < 0
        )) {
            intCount--;
            char = $(this).val().charAt(intCount);
        }

        let str = $(this).val().substring(intCount + 1, $(this).getCursorPosition());

        if (
            str.includes("@")
        ) {
            let intIndexOf = str.lastIndexOf("@");
            let strTag = str.substring(intIndexOf + 1);

            let strLastChar = strTag.charAt(strTag.length - 1)

            let strRegExp = "[A-Za-z]";
            let regExp = new RegExp(strRegExp);
            if (
                !regExp.test(strLastChar) &&
                strLastChar != "_" &&
                strLastChar != "@" &&
                strLastChar != "" &&
                strLastChar != " "
            ) {
                let strEmployeeFormat = strTag.substring(0, strTag.length - 1)
                getEmployeesForNotes(strEmployeeFormat, false)
                $(".employeeToast").css("display", "none")
            }
            else {
                getEmployeesForNotes(strTag, true);
                $(".employeeToast").css("display", "block")                
            }

        }
        else {
            $(".employeeToast").css("display", "none")

            if (str == "") {
                let intCountA = $(this).getCursorPosition() - 2;

                let charA = $(this).val().charAt(intCountA);
                while (!(
                    charA == " " ||
                    intCountA < 0
                )) {
                    intCountA--;
                    charA = $(this).val().charAt(intCountA);
                }

                let strA = $(this).val().substring(intCountA + 1, $(this).getCursorPosition() - 1);

                if (
                    strA.includes("@")
                ) {
                    let strTagA = strA.substring(strA.lastIndexOf("@") + 1);
                    getEmployeesForNotes(strTagA, false);
                }
            }
        }

        funCountAt($(this).val())
    })

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".employee-item", function (e) {
        let strNote = $(".frmAddPeriodNote").find("#strNote").val();
        let strFullName = $(this).attr("data-fullname")
        let intContactId = parseInt($(this).attr("data-contactid"))

        let intCount = $(".frmAddPeriodNote").find("#strNote").getCursorPosition() - 1;

        let char = strNote.charAt(intCount);
        while (!(
            char == " " ||
            intCount < 0
        )) {
            intCount--;
            char = strNote.charAt(intCount);
        }

        let str1 = strNote.substring(0, intCount + 1);
        let str2 = strNote.substring($(".frmAddPeriodNote").find("#strNote").getCursorPosition());
        let strSpace = str2[0] == " " ? "" : " ";

        $(".frmAddPeriodNote").find("#strNote").val(str1 + "@" + strFullName + strSpace + str2);
        $(".frmAddPeriodNote").find("#strNote").focus()
        $(".employeeToast").css("display", "none")

        if (!arrContactsIds.includes(intContactId)) {
            arrContactsIds.push(intContactId);
            arrNameAndContact.push("@" + strFullName + "|" + intContactId);
        }
    })

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnCloseTasksnotes", function (e) {
        $("#taskNotesModal").modal("hide");
    })

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnCloseSuggestedEmployees", function (e) {
        $("#suggestedEmployeesModal").modal("hide");
    })

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("hidden.bs.modal", "#taskNotesModal", function (e) {
        arrContactsIds = new Array();
        arrNameAndContact = new Array();
        intArroba = 0;
    })

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnDeleteNote", function (e) {
        let intPkNote = $(this).attr("data-intPkNote");
        let intPkProcessInWorkflow = $(this).attr("data-intPkProcessInWorkflow")
        let intJobId = $(this).attr("data-strJobId")
        let boolFromMyEmployees = $(this).attr("data-boolFromMyEmployees")
        let boolFromWfJobs = $(this).attr("data-boolFromWfJobs")

        $.ajax({
            type: "POST",
            url: "/JobNotes/DeleteNote",
            data: {
                "intPkNote": intPkNote,
                "intPkProcessInWorkflow": intPkProcessInWorkflow,
                "intJobId": intJobId,
                "boolFromMyEmployees": boolFromMyEmployees,
                "boolFromWfJobs": boolFromWfJobs
            },
            success: function (htmlResponse) {
                $(".taskNotesModalBody").html(htmlResponse)
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    })

    //------------------------------------------------------------------------------------------------------------------
})

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getEmployeesForNotes(strEmployee, boolGetSuggested) {
    $.ajax({
        type: "GET",
        url: "/JobNotes/GetEmployees",
        data: {
            "strEmployee": strEmployee,
            "boolGetSuggested": boolGetSuggested
        },
        success: function (jsonResponse) {
            if (
                typeof jsonResponse === "object"
            ) {
                if (jsonResponse.intStatus == 200) {
                    if (
                        jsonResponse.objResponse != null &&
                        !arrContactsIds.includes(jsonResponse.objResponse.intContactId)
                    ) {
                        arrContactsIds.push(jsonResponse.objResponse.intContactId);
                        let strFullName = jsonResponse.objResponse.strFirstName.replace(" ", "_")
                            + "_" +
                            jsonResponse.objResponse.strLastName.replace(" ", "_")

                        arrNameAndContact.push("@" + strFullName + "|" + jsonResponse.objResponse.intContactId);
                    }
                    else {
                        let strLastChar = strEmployee.charAt(strEmployee.length - 1)

                        let strRegExp = "[A-Za-z]";
                        let regExp = new RegExp(strRegExp);
                        if (!regExp.test(strLastChar)) {
                            let strEmployeeFormat = strEmployee.substring(0, strEmployee.length - 1)
                            getEmployeesForNotes(strEmployeeFormat, false)
                        }
                    }
                }
            }
            else {
                $(".employeeToast").html(jsonResponse);
            }
        },
        error: function () {
            subSendNotification("Something is wrong.", 400);
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funCountAt(strNote) {
    let intAt = strNote.split('@').length - 1

    if (intAt >= intArroba) {
        intArroba = intAt;
    }
    else {
        let arrTemp = arrNameAndContact;
        arrTemp.forEach(function (namecontact) {
            let strName = namecontact.split("|")[0];
            let intContactId = parseInt(namecontact.split("|")[1]);

            if (!strNote.includes(strName)) {
                arrContactsIds.splice(arrContactsIds.indexOf(intContactId), 1);
                arrNameAndContact.splice(arrNameAndContact.indexOf(namecontact), 1);
            }
        });
    }
}