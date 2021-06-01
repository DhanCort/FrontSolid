/*TASK RP PRODUCTS*/

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //DATE: Sep 03, 2020.

//======================================================================================================================
$(document).ready(function () {
    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", ".filterOderType", function () {
        let intnOrderType = parseInt($(this).val());

        $(".filter-container").css("display", "none");
        $(".filter-company-container").css("display", "none");
        $(".filter-branch-container").css("display", "none");
        $(".filter-contact-container").css("display", "none");

        $(".filterCompany").val("")
        $(".filterBranch").val("")
        $(".filterContact").val("")

        if (intnOrderType == 1) {
            $(".orderTypeTitle").html("<i class='fa fa-eye' aria-hidden='true'></i>Public")
        }
        else if (intnOrderType == 2) {
            $(".orderTypeTitle").html("<i class='fa fa-eye-slash' aria-hidden='true'></i>Private")
            let select = $(".filterCompany");
            subGetPrintshopCompanies(select);

            $(".filter-container").css("display", "block");
            $(".filter-company-container").css("display", "block");
        }
        else if (intnOrderType == 3) {
            $(".orderTypeTitle").html("<i class='fa fa-road' aria-hidden='true'></i>Guided")
        }
        else {
            $(".orderTypeTitle").html("All")
        }

        let obj = {
            "intnOrderType": $(".filterOderType").val(),
            "strKeyword": $(".filterKeywordInput").val() == "" ? null : $(".filterKeywordInput").val(),
            "strCategory": $(".filterCategory").val(),
            "intnCompanyId": $(".filterCompany").val(),
            "intnBranchId": $(".filterBranch").val(),
            "intnContactId": $(".filterContact").val()
        }

        subFilterProducts(obj);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".filterKeyword", function () {
        let strKeyword = $(this).parent().prev().val();
        let obj = null;

        if ($(".filterOderType").val() == 2) {
            obj = {
                "intnOrderType": $(".filterOderType").val(),
                "strKeyword": strKeyword == "" ? null : strKeyword,
                "strCategory": $(".filterCategory").val(),
                "intnCompanyId": $(".filterCompany").val(),
                "intnBranchId": $(".filterBranch").val(),
                "intnContactId": $(".filterContact").val()
            }
        }
        else {
            obj = {
                "intnOrderType": $(".filterOderType").val(),
                "strKeyword": strKeyword == "" ? null : strKeyword,
                "strCategory": $(".filterCategory").val()
            }
        }

        subFilterProducts(obj);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("keypress", ".filterKeywordInput", function (e) {
        if (e.which == 13) {
            let strKeyword = $(this).val();
            let obj = null;

            if ($(".filterOderType").val() == 2) {
                obj = {
                    "intnOrderType": $(".filterOderType").val(),
                    "strKeyword": strKeyword == "" ? null : strKeyword,
                    "strCategory": $(".filterCategory").val(),
                    "intnCompanyId": $(".filterCompany").val(),
                    "intnBranchId": $(".filterBranch").val(),
                    "intnContactId": $(".filterContact").val()
                }
            }
            else {
                obj = {
                    "intnOrderType": $(".filterOderType").val(),
                    "strKeyword": strKeyword == "" ? null : strKeyword
                }
            }

            subFilterProducts(obj);
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnFilterKeywordInput", function (e) {
        let strKeyword = $(".filterKeywordInput").val();
        let obj = null;

        if ($(".filterOderType").val() == 2) {
            obj = {
                "intnOrderType": $(".filterOderType").val(),
                "strKeyword": strKeyword == "" ? null : strKeyword,
                "strCategory": $(".filterCategory").val(),
                "intnCompanyId": $(".filterCompany").val(),
                "intnBranchId": $(".filterBranch").val(),
                "intnContactId": $(".filterContact").val()
            }
        }
        else {
            obj = {
                "intnOrderType": $(".filterOderType").val(),
                "strKeyword": strKeyword == "" ? null : strKeyword
            }
        }

        subFilterProducts(obj);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", ".filterCategory", function () {
        let obj = {
            "intnOrderType": $(".filterOderType").val(),
            "strKeyword": $(".filterKeywordInput").val() == "" ? null : $(".filterKeywordInput").val(),
            "strCategory": $(".filterCategory").val(),
            "intnCompanyId": $(".filterCompany").val(),
            "intnBranchId": $(".filterBranch").val(),
            "intnContactId": $(".filterContact").val()
        }

        subFilterProducts(obj);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", ".filterCompany", function () {
        $(".filter-branch-container").css("display", "none");
        $(".filter-contact-container").css("display", "none");

        let intCompanyId = $(".filterCompany").val();

        if (intCompanyId != "null" && intCompanyId != '') {
            let select = $(".filterBranch");
            subGetPrintshopCompanyBranches(intCompanyId, select);
            $(".filter-branch-container").css("display", "block");
        }
        else if (intCompanyId == "null") {
            let select = $(".filterContact");
            subGetCompanyBranchContacts(intCompanyId, null, select, "All");
            $(".filter-branch-container").css("display", "none");
            $(".filter-contact-container").css("display", "block");
        }
        else {
            $(".filter-branch-container").css("display", "none");
            $(".filter-contact-container").css("display", "none");
        }

        let obj = {
            "intnOrderType": $(".filterOderType").val(),
            "strKeyword": $(".filterKeywordInput").val() == "" ? null : $(".filterKeywordInput").val(),
            "strCategory": $(".filterCategory").val(),
            "intnCompanyId": $(".filterCompany").val()
        }

        subFilterProducts(obj);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", ".filterBranch", function () {
        $(".filter-contact-container").css("display", "none");

        let intCompanyId = $(".filterCompany").val();
        let intBranchId = $(".filterBranch").val();

        if (intBranchId == "null") {
            let select = $(".filterContact");
            subGetCompanyBranchContacts(intCompanyId, null, select, "All");
        }
        else {
            let select = $(".filterContact");
            subGetCompanyBranchContacts(intCompanyId, intBranchId, select, "All");
        }
        $(".filter-contact-container").css("display", "block");

        let obj = {
            "intnOrderType": $(".filterOderType").val(),
            "strKeyword": $(".filterKeywordInput").val() == "" ? null : $(".filterKeywordInput").val(),
            "strCategory": $(".filterCategory").val(),
            "intnCompanyId": $(".filterCompany").val(),
            "intnBranchId": $(".filterBranch").val()
        }

        subFilterProducts(obj);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", ".filterContact", function () {
        let obj = {
            "intnOrderType": $(".filterOderType").val(),
            "strKeyword": $(".filterKeywordInput").val() == "" ? null : $(".filterKeywordInput").val(),
            "strCategory": $(".filterCategory").val(),
            "intnCompanyId": $(".filterCompany").val(),
            "intnBranchId": $(".filterBranch").val(),
            "intnContactId": $(".filterContact").val()
        }

        subFilterProducts(obj);
    });

    //------------------------------------------------------------------------------------------------------------------
});
//======================================================================================================================

//														//SUPPORT METHODS.
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subFilterProducts(objFilter) {
    $.ajax({
        type: "POST",
        url: "/PrintshopProductTemplate/GetFromWisnet",
        data: objFilter,
        beforeSend: function () {
            $(".productsBody").html('<div class="text-center">' +
                '<i class= "fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');
        },
        success: function (objRespose) {
            $(".productsBody").html(objRespose);
        },
        error: function (objRespose) {
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subGetPrintshopCategories() {
    $.ajax({
        type: "POST",
        url: "/PrintshopProductTemplate/GetPrintshopCategories",
        success: function (jsonResponse) {
            if (jsonResponse.intStatus == 200) {
                let select = $(".filterCategory");
                select.html("");

                option = document.createElement("option");
                option.value = "";
                option.text = "All";
                select.append(new Option(option.text, option.value));

                if (jsonResponse.objResponse.length > 0) {
                    for (var i = 0; i < jsonResponse.objResponse.length; i++) {
                        var obj = jsonResponse.objResponse[i];
                        option = document.createElement("option");
                        option.value = obj.strCategory;
                        option.text = obj.strCategory;
                        select.append(new Option(option.text, option.value));
                    }
                }
                else {
                    select.val("").change();
                }
            }
            else {
                subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
            }
        },
        error: function (jsonResponse) {
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subGetPrintshopCompanies(select) {
    $.ajax({
        type: "POST",
        url: "/PrintshopProductTemplate/GetPrintshopCompanies",
        success: function (jsonResponse) {
            if (jsonResponse.intStatus == 200) {

                select.html("");

                option = document.createElement("option");
                option.value = "";
                option.text = "All";
                select.append(new Option(option.text, option.value));

                option = document.createElement("option");
                option.value = "null";
                option.text = "Unassigned";
                select.append(new Option(option.text, option.value));

                if (jsonResponse.objResponse.length > 0) {
                    for (var i = 0; i < jsonResponse.objResponse.length; i++) {
                        var obj = jsonResponse.objResponse[i];
                        option = document.createElement("option");
                        option.value = obj.intCompanyId;
                        option.text = obj.strName;
                        select.append(new Option(option.text, option.value));
                    }
                }
                else {
                    select.val("null").change();
                }
            }
            else {
                subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
            }
        },
        error: function (jsonResponse) {
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subGetPrintshopCompanyBranches(intnCompanyId, select) {
    $.ajax({
        type: "POST",
        url: "/PrintshopProductTemplate/GetPrintshopCompanyBranches",
        data: {
            "intnCompanyId": intnCompanyId
        },
        success: function (jsonResponse) {
            if (jsonResponse.intStatus == 200) {

                select.html("");

                option = document.createElement("option");
                option.value = "";
                option.text = "All";
                select.append(new Option(option.text, option.value));

                option = document.createElement("option");
                option.value = "null";
                option.text = "Unassigned";
                select.append(new Option(option.text, option.value));

                if (jsonResponse.objResponse.length > 0) {
                    for (var i = 0; i < jsonResponse.objResponse.length; i++) {
                        var obj = jsonResponse.objResponse[i];
                        option = document.createElement("option");
                        option.value = obj.intBranchId;
                        option.text = obj.strName;
                        select.append(new Option(option.text, option.value));
                    }
                }
                else {
                    select.val("null").change();
                }
            }
            else {
                subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
            }
        },
        error: function (jsonResponse) {
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subGetCompanyBranchContacts(intnCompanyId, intnBranchId, select, strDefault, boolIsSelectElement = true) {
    $.ajax({
        type: "POST",
        url: "/PrintshopProductTemplate/GetCompanyBranchContacts",
        data: {
            "intCompanyId_I": intnCompanyId,
            "intBranchId_I": intnBranchId
        },
        success: function (jsonResponse) {
            if (jsonResponse.intStatus == 200) {
                select.html("");
                arrCustomers = jsonResponse.objResponse;

                if (
                    boolIsSelectElement
                ) {
                    option = document.createElement("option");
                    option.value = "";
                    option.text = strDefault;
                    select.append(new Option(option.text, option.value));
                }

                if (jsonResponse.objResponse.length > 0) {
                    for (var i = 0; i < jsonResponse.objResponse.length; i++) {
                        var obj = jsonResponse.objResponse[i];
                        if (
                            boolIsSelectElement
                        ) {
                            option = document.createElement("option");
                            option.value = obj.intContactId;
                            option.text = obj.strContactInfo;
                            select.append(new Option(option.text, option.value));
                        }
                        else {
                            let strDivElement = '<div class="customerOptionFilter" style="color: #58585b; border-radius:0px;"' +
                                ' data-intContactId="' + obj.intContactId + '">' + obj.strContactInfo + '</div>';

                            select.append(strDivElement);
                        }
                    }
                }
            }
            else {
                subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
            }
        },
        error: function (jsonResponse) {
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 