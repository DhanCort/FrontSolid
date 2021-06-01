let unitInherited = null;
let boolIsDecimal = false;
$(document).ready(function () {

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".editResourceOrTemplate", function () {
        //let intPk = $(this).prev().prev().val().split("|")[1];
        let intPk = $(this).attr("data-intPk");
        let boolDeviceToolOrCustom = $(this).attr("data-boolIsDeviceToolOrCustom");

        $.ajax({
            type: "GET",
            url: "/PrintshopResourcesTemplate/GetData",
            data: { 'intPk': intPk },
            dataType: "html",
            success: function (response) {
                let json = JSON.parse(response);
                console.info(json)
                let intPkType = json.objResponse.intPkType;
                let strRes = json.objResponse.strTypeName;
                let boolIsPhysical = json.objResponse.boolIsPhysical;
                let boolnIsChangeable = json.objResponse.boolnIsChangeable;

                let obj = {
                    "unit": json.objResponse.unitinhe,
                    "cost": json.objResponse.costinhe,
                    "avai": json.objResponse.avainhe
                }

                $(location).attr("href", "/PrintshopResourcesTemplate/AddXJDFForm?intPkType=" +
                    intPkType + "&strType=" + strRes + "&intPkResource=" + intPk +
                    "&boolnIsChangeable=" + boolnIsChangeable +
                    "&boolIsPhysical=" + boolIsPhysical + "&boolnIsDeviceToolOrCustom=" + boolDeviceToolOrCustom);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $("#addXJDFForm").ready(function () {
        let intPkResource = $("#intPkResource").val();
        if (intPkResource > 0) {
            $.ajax({
                type: "GET",
                url: "/PrintshopResourcesTemplate/GetData",
                data: { 'intPk': intPkResource },
                dataType: "html",
                success: function (response) {
                    //debugger
                    let json = JSON.parse(response);
                    console.info(json)
                    let intPkType = json.objResponse.intPkType;
                    let strRes = json.objResponse.strTypeName;

                    $("#strResName").val(json.objResponse.strResourceName);
                    $("#strUnitResourceForm").val(json.objResponse.strUnit);
                    $("#boolIsDecimal").prop("checked", json.objResponse.boolnIsDecimal);

                    unitInherited = json.objResponse.strUnit;
                    boolIsDecimal = json.objResponse.boolnIsDecimal;

                    if (json.objResponse.intnPkInherited != null) {
                        $("#intnInheritedPk").val(json.objResponse.intnPkInherited).change();
                    }
                    $("#intnInheritedPk").attr("disabled", "true");
                    if (json.objResponse.boolIsTemplate) {
                        $("#boolIsTemplate").addClass("on");
                    }
                    $("#boolIsTemplate").parent().addClass("disabled");
                    $("#boolIsTemplate").parent().parent().unbind();
                    if (json.objResponse.arrattr.length > 0) {
                        json.objResponse.arrattr.forEach(function (attribute, index) {
                            //debugger
							let lastAscendantPk = attribute.arrPkAscendant[attribute.arrPkAscendant.length - 1];
                            let divForm = $("#dynamicElements").find("div#" + lastAscendantPk);
                            let boolIsInherited = false;

							if (attribute.intnPkValueInherited != null) {
                                boolIsInherited = true;
                            }

                            if (divForm.length == 0) {
                                //addElements(intPkResource, lastAscendantPk, lastAscendantPk, boolIsInherited, true);
								arrAscendantPk = attribute.arrPkAscendant;
								strValue = attribute.strValue;
								
								createForm(intPkType, 1, attribute.arrPkAscendant[0], attribute.arrPkAscendant[0], attribute.intPkValue, true,
                                    boolIsInherited, attribute.intnPkValueInherited, attribute.boolChangeable, attribute.boolIsBlocked);
                            }
                        });
                    }

                    objInherited = {
                        "unit": json.objResponse.unitinhe,
                        "cost": json.objResponse.costinhe,
                        "avai": json.objResponse.avainhe
                    }

                    if (json.objResponse.boolIsPhysical) {
                        Cookies.set("showUnitOfMeasurement", "true");
                    }
                    else {
                        Cookies.set("showUnitOfMeasurement", "false");
                    }

                    $("#saveResForm").show();
                }
            });
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", "#saveChangesResForm", function () {

    });

    //------------------------------------------------------------------------------------------------------------------
});