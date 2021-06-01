/*TASK RP PRODUCTS*/

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: May 11, 2020.

//======================================================================================================================
$(document).ready(function () {
    let intnPkWorkflow = null;

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("keydown", "#newWorkflowForm", function (event) {
        if (
            //												//Disable the the submit button on the workflows modal form.
            event.keyCode == 13
        ) {
            event.preventDefault();
            return false;
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(".product-type").change(function () {
        let intPk = $(this).attr("id");
        let strType = $(this).val();
        let dropdownElement = $(this);

        $.ajax({
            type: "GET",
            url: "/PrintshopProductTemplate/SetProductType",
            data: {
                "intPk": intPk, "strType": strType
            },
            success: function (objResponse) {
                if (objResponse.intStatus != 200) {
                    dropdownElement.val("");
                }

                subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btn-wf-modal", function () {
        //													//Get values from the html element data.
        let intPkProduct = $(this).data("intpkproduct");
        let strTypeId = $(this).data("strtypeid");

        //													//Set title on modal's header.
        $("#workflowsModalProductTitle").html(strTypeId);

        //													//The product's workflows.
        strGetProductWorkflow(intPkProduct);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".delete-workflow", function () {
        let intPkWorkflow = $(this).attr("data-intPkWorkflow");
        let intPkProduct = $(this).data("intpkproduct");

        $.ajax({
            type: "GET",
            url: "/workflow/IsModifiable",
            data:
            {
                "intPkWorkflow_I": intPkWorkflow
            },
            success: function (jsonResponse) {
                /*CASE*/
                if (
                    //										//Workflow modifiable, it is not necessary to consult with 
                    //										//		the user.
                    (jsonResponse.intStatus == 200) &&
                    (jsonResponse.objResponse == true)
                ) {
                    funDeleteWorkflow(intPkProduct, intPkWorkflow);
                }
                else if (
                    //										//Workflow not modifiable, it is necessary to ask what to 
                    //										//		do to the user.
                    (jsonResponse.intStatus == 200) &&
                    (jsonResponse.objResponse == false)
                ) {
                    //										//Modal (first step).
                    $(".btnYesNo").css("display", "block");
                    $(".btnOk").css("display", "none");
                    $("#confirmation-modal").modal('show');
                    $("#myModalBody").html("<span class='font-bold'>" + jsonResponse.strUserMessage + "</span>" +
                        "<br/> Delete anyway?")

                    $("#modal-btn-yes").unbind();
                    $("#modal-btn-no").unbind();

                    //										//Yes (second step).
                    $("#modal-btn-yes").bind("click", function () {
                        funDeleteWorkflow(intPkProduct, intPkWorkflow);
                        $("#confirmation-modal").modal('hide');
                    });

                    //										//Abort modification.
                    $("#modal-btn-no").bind("click", function () {
                        $("#confirmation-modal").modal('hide');
                    });
                }
                else {
                    //										//Invalid data.
                    subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                }
                /*EN-CASE*/
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".wf-radio-default", function () {
        let intPkResource = $(this).data("id");

        $('#toast-' + intPkResource).toast('hide');
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("submit", "#newWorkflowForm", function (event) {
        event.preventDefault();
        let intPkProduct = $(this).find("input[name=intPkProduct]").val();
        let strWorkflowName = $("#strWorkflowName").val();

        funAddOrCopyWorkflow(intPkProduct, null, strWorkflowName);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("submit", ".CopyWorkflowForm", function (event) {
        event.preventDefault();
        intPkProduct = $(this).find('input[name="intPkProductSelect"]').val();
        let intnPkWorkflow = $(this).find("input[name=intPkWorkflow]").val();
        let strWorkflowName = $(this).find("#strWorkflowName").val();
        let arrintPkPiw = new Array();

        $(".chkProcess:checked").each(function () {
            arrintPkPiw.push(parseInt($(this).val()))
        })

        funAddOrCopyWorkflow(intPkProduct, intnPkWorkflow, strWorkflowName, arrintPkPiw);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".add-copy-product-workflow", function () {
        let intPkWorkflow = $(this).data("intpkworkflow");
        let intPkProduct = $(this).data("intpkproduct");
        let boolGeneric = $(this).data("boolgeneric");

        $.ajax({
            type: "GET",
            url: "/PrintshopProductTemplate/CopyWorkflow",
            data: {
                "intPkWorkflow": intPkWorkflow,
                "intPkProduct": intPkProduct,
                "boolGeneric": boolGeneric
            },
            beforeSend: function () {
                let strImage = '<div class="col-sm-12 text-center"><i class="fa fa-spinner fa-pulse fa-3x ' +
                    'fa-fw"></i><span class="sr-only" ></span ></div>';

                subShowModal("Copy workflow", strImage, "modal-dialog-md", "", true, false);
            },
            success: function (strResponse) {
                subShowModal("Copy workflow", strResponse, "modal-dialog-md", "", true, true, "h4",
                    '<span class="fa fa-copy"></span> Copy workflow');

                //                                          //Enable save button.
                $("#mi4pMasterModalSave").removeAttr("disabled");

                //                                          //Add new event
                $("#mi4pMasterModalSave").bind("click", function () {
                    $(".CopyWorkflowForm").find("button").click();
                });
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", ".boolCopyToOtherProduct", function () {
        let productSelect = $(this).parent().parent().prev();

        if (
            //												//If the checkbox it's checked enable the select control.
            $(this).prop("checked")
        ) {
            productSelect.removeAttr("disabled");
        }
        else {
            productSelect.attr("disabled", true);
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", ".wf-radio-default", function () {
        let radioElement = $(this);
        let intPkWorkflow = radioElement.data("intpkworkflow");
        let intPkProduct = radioElement.data("intpkproduct");

        $.ajax({
            type: "POST",
            url: "/PrintshopProductTemplate/MakeDefault",
            data: {
                "intPkWorkflow": intPkWorkflow
            },
            success: function (objResponse) {
                if (
                    objResponse.intStatus != 200
                ) {
                    strGetProductWorkflow(intPkProduct);
                    subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
                }
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", ".selectAccount", function () {
        let intPkProduct = $(this).find(':selected').data('intpkproduct');
        let intPkAccount = $(this).find(':selected').val();

        $.ajax({
            type: "POST",
            url: "/PrintshopProductTemplate/SetAccountToProduct",
            data: {
                "intPkAccount": intPkAccount,
                "intPkProduct": intPkProduct
            },
            success: function (objResponse) {
                subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".setAsGenericWorkflowBtn", function () {
        let intPkWorkflow = $(this).data("intpkworkflow");

        $.ajax({
            type: "POST",
            url: "/PrintshopProductTemplate/SetGeneric",
            data: {
                "intPkWorkflow": intPkWorkflow
            },
            success: function (objResponse) {
                subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("focusin", "#productSearchInput", function (event) {
        let intWidth = $(this).width() + 20;
        let productList = $(this).next();

        //													//Show and adjust the filter div.
        productList.css("display", "block");
        productList.css("max-width", intWidth);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("focusout", "#productSearchInput", function (event) {
        let productList = $(this).next();

        //													//Hide the filter div.
        setTimeout(function () {
            productList.css("display", "none");
        }, 200);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("keyup", "#productSearchInput", function (event) {
        let strProductSearch = $(this).val().toLowerCase();

        $(this).next().html("");
        let arrProductsFiltered = darrproducts;
        if (strProductSearch.length > 0) {
            //												//Find all the cases that the user's search match with 
            //												//		some name in the array.
            arrProductsFiltered = darrproducts.filter(p =>
                ((p.text).toLowerCase()).includes(strProductSearch));
        }

        $(".CopyWorkflowForm").find("input[name=intPkProductSelect]").val("");
        if (
            //												//If the results of the search, only have a unique row,
            //												//		then the contactid is assigned in the hidden input.
            arrProductsFiltered.length == 1
        ) {
            $(".CopyWorkflowForm").find("input[name=intPkProductSelect]").val(arrProductsFiltered[0].value);
        }

        //													//Fill the filter div with all the results.
        for (var i = 0; i < arrProductsFiltered.length; i++) {
            var obj = arrProductsFiltered[i];

            let strProduct = obj.text;

            let strDivElement = '<div class="productOptionFilter cursor-pointer" style="color: #58585b; border-radius:0px;"' +
                ' data-intProductId="' + obj.value + '">' + strProduct + '</div>';

            $(this).next().append(strDivElement);
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".productOptionFilter", function () {
        let intProductId = $(this).attr("data-intProductId");
        let strProductName = $(this).text();

        //													//Assign the values of the selected option in the filter div.
        console.info($(".CopyWorkflowForm").find("input[name=intPkProductSelect]"))
        $(".CopyWorkflowForm").find("input[name=intPkProductSelect]").val(intProductId);
        $(".CopyWorkflowForm").find("#productSearchInput").val(strProductName);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", "#chkProcessAll", function () {
        if (this.checked) {
            $(".chkProcess").prop("checked", true);
        }
        else {
            $(".chkProcess").prop("checked", false);
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    //														//SUPPORT METHODS.

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    function funDeleteWorkflow(intPkProduct, intPkWorkflow) {
        $.ajax({
            type: "POST",
            url: "/PrintshopProductTemplate/DeleteWorkflow",
            data: { "intPkWorkflow": intPkWorkflow },
            success: function (objResponse) {
                if (
                    objResponse.intStatus == 200
                ) {
                    if (
                        intPkProduct != "" && intPkProduct != null
                    ) {
                        strGetProductWorkflow(intPkProduct);
                        subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
                    }
                    else {
                        location.reload();
                    }
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

    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    function strGetProductWorkflow(intPkProduct) {
        $.ajax({
            type: "GET",
            url: "/PrintshopProductTemplate/GetProductWorkflows",
            data: {
                "intPkProduct": intPkProduct
            },
            success: function (strResponse) {
                $("#product-workflow-section").html(strResponse);
                $("#WorkflowsModal").modal("show");
                $("#product-workflow-section").animate({
                    scrollTop: $("#product-workflow-section").prop("scrollHeight")
                }, 'slow');
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    }
    //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    function funAddOrCopyWorkflow(intPkProduct, intnPkWorkflow = null, strWorkflowName, arrintPkPiw) {
        $.ajax({
            type: "POST",
            url: "/PrintshopProductTemplate/AddNewWorkflow",
            data: {
                "intnPkProduct": intPkProduct,
                "intnPkWorkflow": intnPkWorkflow,
                "strWorkflowName": strWorkflowName,
                "arrintPkPiw": arrintPkPiw
            },
            success: function (objResponse) {
                if (
                    objResponse.intStatus == 200
                ) {
                    let intPkCurrentProduct = $("#newWorkflowForm").find("input[name=intPkProduct]").val();

                    if (
                        intPkCurrentProduct != "" && intPkCurrentProduct != null
                    ) {
                        strGetProductWorkflow(intPkCurrentProduct);
                        subSendNotification(objResponse.strUserMessage, objResponse.intStatus);

                        if (intnPkWorkflow != null) {
                            $("#mi4pMasterModal").modal("hide");
                        }
                    }
                    else {
                        location.reload();
                    }
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

    //------------------------------------------------------------------------------------------------------------------
});

//======================================================================================================================

/*END-TASK*/