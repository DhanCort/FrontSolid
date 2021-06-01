let element = null;
let boolSetCondition = null;
let darrattr;
let conditionToApplyObject = null;

$(document).ready(function () {
    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".openConditionToApplyModal", function () {
        element = $(this);
        let boolIsLink = $(this).data("boolislink");
        let intnPkIn = $(this).data("intpkin");
        let intnPkOut = $(this).data("intpkout");
        boolSetCondition = JSON.parse(($(this).data("boolsetcondition") ?? "false").toLowerCase());
        let intnPkProduct = $("#intnPkProduct").val()
        let intnPkCalculation = $(this).closest("form").find("#intPk").val() == "" ? null
            : $(this).closest("form").find("#intPk").val();
        let intnPkTransformCalculation = $(this).closest("#transform-calculation-form").find("input[name=intnPk]").val() == "" ? null
            : $(this).closest("#transform-calculation-form").find("input[name=intnPk]").val();

        $.ajax({
            type: "GET",
            url: "/ConditionToApply/GetConditions",
            data: {
                "intPk": intnPkProduct,
                "boolIsLink": boolIsLink,
                "boolSetCondition": boolSetCondition,
                "intnPkProduct": intnPkProduct,
                "intnPkCalculation": intnPkCalculation,
                "intnPkOut": intnPkOut,
                "intnPkIn": intnPkIn,
                "intnPkTransformCalculation": intnPkTransformCalculation,
                "condition": JSON.stringify(conditionToApplyObject)
            },
            dataType: "html",
            beforeSend: function () {
                $("#conditionToApply").html('<div class="col-sm-12 text-center"><i class="fa fa-spinner ' +
                    'fa-pulse fa-3x fa-fw"></i><span class="sr-only"> Loading...</span ></div>');
            },
            success: function (response) {
                $("#conditionToApply").html(response);

                if (
                    boolSetCondition
                ) {
                    $("#conditionToApply").find("#intnPkIn").val(intnPkIn);
                    $("#conditionToApply").find("#intnPkOut").val(intnPkOut);
                }
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnAddConditionGroup", function (e) {
        let boolCondition = $(this).attr("data-boolCondition");
        let boolGeneral = $(this).attr("data-boolGeneral")
        let btnAddGroupCard = $(this);
        let intnPkProduct = $("#intnPkProduct").val();
        let boolFromGroup = $(this).attr("data-boolFromGroup")
        let intMargin = parseInt($(this).attr("data-intMargin"))

        funCreateConditionCard(boolCondition, boolGeneral, btnAddGroupCard, intnPkProduct, null, boolFromGroup, true,
            null, intMargin)
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", ".intnPkAttribute", function (e) {
        debugger
        let intnPkAttribute = $(this).val();
        let strValue = $(this).closest("div").next().next().find(".strValue")
        let selectAttribute = $(this);
        strValue.html("")

        if (
            intnPkAttribute != "" &&
            intnPkAttribute != "null"
        ) {
            let arrValues = darrattr.filter(value => value.intPk == intnPkAttribute)[0].arrstrValues;
            let strCondition = selectAttribute.closest("div").next().find(".strCondition")
            strCondition.find("option[value='>']").remove()
            strCondition.find("option[value='<']").remove()
            strCondition.find("option[value='>=']").remove()
            strCondition.find("option[value='<=']").remove()

            selectAttribute.closest("div").parent().find(".dropdownValues").removeAttr("style")
            selectAttribute.closest("div").parent().find(".inputValues").css("display", "none")
            selectAttribute.closest("div").parent().find(".dropdownValues").css("width", "250px")

            strValue.append($('<option>').text("- Select value -").attr('value', ""));
            $.each(arrValues, function () {
                strValue.append($('<option>').text(this).attr('value', this));
            });
        }
        else if (
            intnPkAttribute == "null"
        ) {
            let strCondition = selectAttribute.closest("div").next().find(".strCondition")
            strCondition.append("<option value='>'>></option>")
            strCondition.append("<option value='<'><</option>")
            strCondition.append("<option value='>='>≥</option>")
            strCondition.append("<option value='<='>≤</option>")

            selectAttribute.closest("div").parent().find(".dropdownValues").css("display", "none")
            selectAttribute.closest("div").parent().find(".inputValues").removeAttr("style")
            selectAttribute.closest("div").parent().find(".inputValues").find(".strValue").val("")
            selectAttribute.closest("div").parent().find(".inputValues").css("width", "250px")
        }
        else {
            let strCondition = selectAttribute.closest("div").next().find(".strCondition")
            strCondition.find("option[value='>']").remove()
            strCondition.find("option[value='<']").remove()
            strCondition.find("option[value='>=']").remove()
            strCondition.find("option[value='<=']").remove()

            selectAttribute.closest("div").parent().find(".dropdownValues").removeAttr("style")
            selectAttribute.closest("div").parent().find(".inputValues").css("display", "none")
            selectAttribute.closest("div").parent().find(".dropdownValues").css("width", "250px")
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnRemoveConditionGroup", function (e) {
        let strOperator = $(this).closest(".conditionCard").find(".strOperator").val()
        if (
            $(this).hasClass("hasDropdown") &&
            $(this).closest(".conditionCard").find(".divGroupOperator").is(":not(:hidden)")
        ) {
            console.info($(this).closest(".conditionCard").find(".divGroupOperator"))
            $(this).closest(".conditionCard").parent().next().find(".divGroupOperator").prop("hidden", false);
            $(this).closest(".conditionCard").parent().next().find(".strOperator").val(strOperator);
            $(this).closest(".conditionCard").parent().next().addClass("groupCardCondition")
                .removeClass("singleCardCondition");
        }

        let parentCard = $(this).closest("div.card");
        //console.info(parentCard)

        $(this).closest(".conditionCard").parent().remove();

        let intdivChildLength = parentCard.find(".singleCardCondition, .groupCardCondition")
            .children(".conditionCard").length

        if (intdivChildLength == 0) {
            parentCard.remove();
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnSaveConditionToApply", function (e) {
        conditionToApplyObject = funCreateObject();
        if (
            conditionToApplyObject.arrcond.length > 0 ||
            conditionToApplyObject.arrgpcond.length > 0
        ) {
            if (boolSetCondition) {
                funSetCondition();
            }
            else {
                element.prev("#strConditionToApply").val(JSON.stringify(conditionToApplyObject))
                element.closest("div").next().find("#translatedCondition").removeAttr("hidden").html("<strong>You " +
                    "have a condition to apply</strong>")
            }

            $('#conditionToApplyModal').modal('toggle');
        }
        else {
            conditionToApplyObject = null;
        }

        console.info(conditionToApplyObject);
    });

    //------------------------------------------------------------------------------------------------------------------
});

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funCreateConditionCard(
    boolCondition,
    boolGeneral,
    btnAddGroupCard,
    intnPkProduct,
    obj,
    boolFromGroup,
    boolFromButtonEvent,
    strOperator,
    intMargin
) {
    $.ajax({
        type: "POST",
        url: "/ConditionToApply/Index",
        async: false,
        data: {
            "boolCondition": boolCondition,
            "boolGeneral": boolGeneral,
            "intnPkProduct": intnPkProduct,
            "boolFromGroup": boolFromGroup
        }

    }).done(function (response) {
        subAddForms(response, boolFromGroup, btnAddGroupCard, boolFromButtonEvent, obj, strOperator, boolCondition, intMargin)
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funCreateObject() {
    let arrConditionBodyChildren = $(".conditionBodyChildren");
    let strOperator = $("#strOperator").val()
    let arrcond = new Array();
    let arrgpcond = new Array();

    $.each(arrConditionBodyChildren, function (index, obj) {
        let arrCardCondition = $(this).children("div");
        let intIndex = 0;
        for (intIndex = 0; intIndex < arrCardCondition.length; intIndex++) {
            if (
                $(arrCardCondition[intIndex]).hasClass("singleCardCondition") &&
                !$(arrCardCondition[intIndex]).prev("div").hasClass("groupCardCondition")
            ) {
                let tempObj = {
                    "intnPkAttribute": $(arrCardCondition[intIndex]).find(".intnPkAttribute").val() == "null" ? null : parseInt($(arrCardCondition[intIndex]).find(".intnPkAttribute").val()),
                    "strCondition": $(arrCardCondition[intIndex]).find(".strCondition").val(),
                    "strValue": $(arrCardCondition[intIndex]).find(".divValues:visible").find(".strValue").val()
                }
                arrcond.push(tempObj)
            }
            else {
                break;
            }
        }

        let intEnd = intIndex;
        arrCardCondition.splice(0, intEnd);
        if (
            arrCardCondition.length > 0
        ) {
            arrgpcond.push(funcCreateGroup(arrCardCondition));
        }
    });

    let conditionToApplyObject = {
        "strOperator": strOperator,
        "arrcond": arrcond,
        "arrgpcond": arrgpcond
    }

    console.info(conditionToApplyObject);
    return conditionToApplyObject;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funcCreateGroup(arrCardCondition) {
    let strOperator = $("#strOperator").val()
    let arrcond = new Array();
    let arrgpcond = new Array();

    let intIndex = 0;
    for (intIndex = 0; intIndex < arrCardCondition.length; intIndex++) {
        let cardCondition = $(arrCardCondition[intIndex])
        if (
            intIndex == 0 &&
            cardCondition.hasClass("groupCardCondition")
        ) {
            let arrConditionCard = $(arrCardCondition[intIndex]).children(".conditionCard");
            strOperator = $($(arrCardCondition[intIndex]).children(".conditionCard")[0]).find(".divGroupOperator:visible").find(".strOperator").val();

            let tempObj = {
                "intnPkAttribute": $(arrCardCondition[intIndex]).find(".intnPkAttribute").val() == "null" ? null : parseInt($(arrCardCondition[intIndex]).find(".intnPkAttribute").val()),
                "strCondition": $(arrCardCondition[intIndex]).find(".strCondition").val(),
                "strValue": $(arrCardCondition[intIndex]).find(".divValues:visible").find(".strValue").val()
            }
            arrcond.push(tempObj)
        }
        else if (
            cardCondition.hasClass("singleCardCondition")
        ) {
            let tempObj = {
                "intnPkAttribute": $(arrCardCondition[intIndex]).find(".intnPkAttribute").val() == "null" ? null : parseInt($(arrCardCondition[intIndex]).find(".intnPkAttribute").val()),
                "strCondition": $(arrCardCondition[intIndex]).find(".strCondition").val(),
                "strValue": $(arrCardCondition[intIndex]).find(".divValues:visible").find(".strValue").val()
            }
            arrcond.push(tempObj)
        }
        else {
            break;
        }
    }

    let intEnd = intIndex;
    arrCardCondition.splice(0, intEnd);
    if (
        arrCardCondition.length > 0
    ) {
        arrgpcond.push(funcCreateGroup(arrCardCondition));
    }

    conditionToApplyObject = {
        "strOperator": strOperator,
        "arrcond": arrcond,
        "arrgpcond": arrgpcond
    }

    return conditionToApplyObject;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funSetCondition(
) {
    let intPkIn = $("#conditionToApply").find("#intnPkIn").val();
    let intPkOut = $("#conditionToApply").find("#intnPkOut").val();
    debugger
    $.ajax({
        type: "POST",
        url: "/Workflow/SetConditionToLink",
        data: {
            "intPkOut": intPkOut,
            "intPkIn": intPkIn,
            "condition": JSON.stringify(conditionToApplyObject),
        },
        success: function (objResponse) {
            if (
                objResponse.intStatus == 200
            ) {
                let intPkProduct = $("#intPkProduct").val();

                strNewLinkForReload = "/Workflow?intPkWorkflow=" + objResponse.objResponse +
                    "&intPkProduct=" + intPkProduct;

                $("#intPkWorkflow").val(objResponse.objResponse);

                funGetLinks(objResponse.objResponse);
                conditionToApplyObject = null;
            }

            subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
        },
        error: function () {
            subSendNotification("Something is wrong.", 400);
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funCreateConditionForm(
    conditionObject,
    boolFromGroup,
    boolCondition,
    intMargin
) {
    $(".generalOperator").val(conditionObject.strOperator)

    if (
        conditionObject.arrcond.length > 0
    ) {
        for (let intI = 0; intI < conditionObject.arrcond.length; intI++) {
            funCreateConditionCard("true", "true", null, $("#intnPkProduct").val(),
                conditionObject.arrcond[intI], boolFromGroup, false, null, intMargin)
        }
    }

    if (
        conditionObject.arrgpcond.length > 0
    ) {
        for (var i = 0; i < conditionObject.arrgpcond.length; i++) {
            funCreateGroupConditionForm(conditionObject.arrgpcond[i], "false", "false", "true", intMargin);
        }
    }
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funCreateGroupConditionForm(
    conditionObject,
    boolFromGroup,
    boolCondition,
    boolGeneral,
    intMargin
) {
    console.info(intMargin)
    if (
        conditionObject.arrcond.length > 0
    ) {
        for (let intI = 0; intI < conditionObject.arrcond.length; intI++) {
            funCreateConditionCard(boolCondition, boolGeneral, null, $("#intnPkProduct").val(),
                conditionObject.arrcond[intI], boolFromGroup, false, conditionObject.strOperator, intMargin)

            if (
                intI == 0
            ) {
                boolGeneral = "false";
                boolFromGroup = "true";
                boolCondition = "true";
            }
        }
    }

    if (
        conditionObject.arrgpcond.length > 0
    ) {
        for (var i = 0; i < conditionObject.arrgpcond.length; i++) {
            funCreateGroupConditionForm(conditionObject.arrgpcond[i], "true", "false", boolGeneral, intMargin + 87);
        }
    }
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subSetFormValues(
    boolCondition,
    boolGeneral,
    btnAddGroupCard,
    intnPkProduct,
    obj,
    boolFromGroup,
    boolFromButtonEvent,
    htmlResponse) {
    if (
        boolGeneral == "true" &&
        boolFromGroup == "false"
    ) {
        $("#conditionBody").append(htmlResponse)
        let currentCard = $("#conditionBody").children().last();

        funSetAttribute(currentCard);

        if (obj != null) {

            currentCard.find(".intnPkAttribute")
                .val(obj.intnPkAttribute == null ? "null" : obj.intnPkAttribute).change()
            currentCard.find(".strCondition").val(obj.strCondition)
            currentCard.find(".divValues:visible").find(".strValue")
                .val(obj.intnPkAttribute == null ? parseFloat(obj.strValue) : obj.strValue)

        }
    }
    else {
        if (boolFromButtonEvent) {
            btnAddGroupCard.closest(".conditionBodyChildren").append(htmlResponse)

            funSetAttribute(btnAddGroupCard.closest(".conditionBodyChildren").children().last())
        }
        else {
            $("#conditionBody").children("div").last().find(".conditionBodyChildren").append(htmlResponse);

            funSetAttribute($("#conditionBody").children("div").last().find(".conditionBodyChildren").children().last())
        }

        if (obj != null) {

        }
    }
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funSetAttribute(card) {
    card.find(".intnPkAttribute").html("");
    card.find(".intnPkAttribute").append(new Option("- Select criteria -", ""))
    $.each(darrattr, function (index, obj) {
        card.find(".intnPkAttribute").append(new Option(obj.strCustomName, obj.intPk))
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subAddForms(
    htmlResponse,
    boolFromGroup,
    btnAddGroupCard,
    boolFromButtonEvent,
    obj,
    strOperator,
    boolCondition,
    intMargin
) {
    let currentCard;
    if (boolFromGroup == "true") {
        if (boolFromButtonEvent) {
            if (boolCondition == "false") {
                intMargin = intMargin + 87;
            }
            btnAddGroupCard.closest(".conditionBodyChildren").append(htmlResponse)
            currentCard = btnAddGroupCard.closest(".conditionBodyChildren").children("div").last()
            funSetAttribute(currentCard);
        }
        else {
            $("#conditionBody").children("div").last().find(".conditionBodyChildren").append(htmlResponse);
            currentCard = $("#conditionBody").children("div").last().find(".conditionBodyChildren").children("div").last();
            funSetAttribute(currentCard)
        }
    }
    else {
        $("#conditionBody").append(htmlResponse)
        currentCard = $("#conditionBody").children("div").last();
        funSetAttribute(currentCard)
    }

    currentCard.find(".strOperator").val(strOperator)

    if (obj != null) {
        currentCard.find(".intnPkAttribute")
            .val(obj.intnPkAttribute == null ? "null" : obj.intnPkAttribute).change();
        currentCard.find(".strCondition").val(obj.strCondition)
        currentCard.find(".divValues:visible").find(".strValue")
            .val(obj.intnPkAttribute == null ? parseFloat(obj.strValue) : obj.strValue)
    }

    currentCard.css("margin-left", intMargin + "px")
    currentCard.find(".btnAddConditionGroup").attr("data-intMargin", intMargin)
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 