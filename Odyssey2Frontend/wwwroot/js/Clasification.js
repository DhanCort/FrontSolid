$(document).ready(function () {

    //------------------------------------------------------------------------------------------------------------------
    $("#intPkProcessSelect").change(function (event) {
        //
        let element = $("#addAscendantElements");
        element.attr("hidden");
        let strProcess = $(this).val();
        let boolIsPhysical = $(this).closest("form").find("#boolIsPhysical").val()
        let strClasification = $("#strClasificationSelect").val();

        $.ajax({
            type: "GET",
            url: "/PrintshopResourcesTemplate/GetResourcesByProcessOrAll",
            data: { 'strProcess': strProcess, 'strClasification': strClasification, 'boolIsPhysical': boolIsPhysical },
            dataType: "html",
            success: function (response) {
                //debugger
                var json = JSON.parse(response);
                if (json.length == 0) {
                    $("#chkResources").html("<div class='col-sm-12'><strong>Nothing to show</strong></div>")
                }
                else {
                    $("#chkResources").empty();
                    for (var i = 0; i < json.length; i++) {
                        var obj = json[i];
                        console.info(obj)
                        let checked = "";
                        if (obj.boolHasIt == true) {
                            checked = "checked";
						}
                        $("#chkResources").append('<div class="col-sm-4 checkbox"><label class="checkbox-label">'
                            + '<input type = "radio" class= "template-radio" name="rdoResource" '
                            + 'data-boolIsPhysical="' + obj.boolIsPhysical + '" data-checkbox-text="' + obj.strTypeId +
                            '" value = "' + obj.intPk + '"> ' + obj.strTypeId + '</label></div>'
                        );
                    }
                }
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $("#strClasificationSelect").change(function (event) {
        //
        let element = $("#addAscendantElements");
        element.attr("hidden");
        let strClasification = $(this).val();
        let strProcess = $("#intPkProcessSelect").val();
        let boolIsPhysical = $(this).closest("form").find("#boolIsPhysical").val()

        $.ajax({
            type: "GET",
            url: "/PrintshopResourcesTemplate/GetResourcesByProcessOrAll",
            data: { 'strProcess': strProcess, 'strClasification': strClasification, 'boolIsPhysical': boolIsPhysical },
            dataType: "html",
            success: function (response) {
                //debugger
                var json = JSON.parse(response);
                if (json.length == 0) {
                    $("#chkResources").html("<div class='col-sm-12'><strong>Nothing to show</strong></div>")
                }
                else {
                    $("#chkResources").empty();
                    for (var i = 0; i < json.length; i++) {
                        var obj = json[i];
                        let checked = "";
                        if (obj.boolHasIt == true) {
                            checked = "checked";
                        }
                        $("#chkResources").append('<div class="col-sm-4 checkbox"><label class="checkbox-radio">'
                            + '<input type = "radio" class= "template-radio" name="rdoResource" '
                            + 'data-boolIsPhysical="' + obj.boolIsPhysical + '" data-checkbox-text="' + obj.strTypeId +
                            '" value = "' + obj.intPk + '"> ' + obj.strTypeId + '</label></div>'
                        );
                    }
                }
            }
        });
    });
})