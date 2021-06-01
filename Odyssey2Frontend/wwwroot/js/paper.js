let intPkPaTrans = null;
let intnPkCalcu = null;
let boolFromClose = true;
let numPerUnit = null;
let numNeeded = null;

let quantityFrom = null;
let needed = null;
let perUnits = null;

let boolFirstCalculate = true;

$(document).ready(function () {
    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".openPaperModal", function (e) {
        boolFirstCalculate = true;
        let intPaperTransformationPk = $("#ResourceForm").find("#intnPkTrans").val();
        let intpkeleetoreleelei = $("#ResourceForm").find("#intnPkEleetOrEleeleI").val();
        let booliseleeti = $("#ResourceForm").find("#boolnIsEleetI").val();
        let intpkprocessinworkflow = $("#ResourceForm").find("#intnPkProcessInWorkflow").val();
        let intpkresourcei = $("#ResourceForm").find("#intnPkResourceI").val();
        let intnPkCalculation = $("#ResourceForm").find("#intPk").val() == "0" ? "" :
            $("#ResourceForm").find("#intPk").val();
        let intJobId = $("#ResourceForm").find("#intJobId").val() == "" ? null : $("#ResourceForm").find("#intJobId").val();
        
        //                                              //Getting output info
        let dropdownOption = $("#ResourceForm").find("#intnPkResourceO").find('option:selected');
        let intnPkEleetOrEleele = dropdownOption.data("intnpkeleetoreleele");
        let boolnIsEleet = dropdownOption.data("booliseleet");
        let intPkResourceO = $("#ResourceForm").find("#intnPkResourceO").val()

        let boolIsPaper = $("#ResourceForm").find("#boolIsPaper").val();
        let boolIsSize = dropdownOption.data("boolsize");

        $("#frmPaper").find("#intnPkPaTrans").val($("#ResourceForm").find("#intnPkTrans").val());
        $("#frmPaper").find("#boolIsEleetI").val($("#ResourceForm").find("#boolnIsEleetI").val());
        $("#frmPaper").find("#intPkEleetOrEleeleI").val($("#ResourceForm").find("#intnPkEleetOrEleeleI").val());
        $("#frmPaper").find("#intPkResourceI").val($("#ResourceForm").find("#intnPkResourceI").val());
        $("#frmPaper").find("#intPkResource").val($("#ResourceForm").find("#intnPkResourceI").val());
        $("#frmPaper").find("#boolIsEleetO").val(boolnIsEleet);
        $("#frmPaper").find("#intPkEleetOrEleeleO").val(intnPkEleetOrEleele);
        $("#frmPaper").find("#intPkResourceO").val(intPkResourceO);
        $("#frmPaper").find("#intPkProcessInWorkflow").val($("#ResourceForm").find("#intnPkProcessInWorkflow").val());
        $("#frmPaper").find("#intnPkCalculation").val(intnPkCalculation)

        $(".calculateCuts").val("")
        $("#frmPaper").find("#paperTransGraph").prop("hidden", true)
        $.ajax({
            type: "POST",
            url: "/PaperTransformation/GetOnePaperTransformation",
            data: {
                "intnPkPaTrans": intPaperTransformationPk,
                "intPkEleetOrEleele": intpkeleetoreleelei,
                "boolIsEleet": booliseleeti,
                "intPkProcessInWorkflow": intpkprocessinworkflow,
                "intPkResource": intpkresourcei,
                "intnJobId": intJobId,
                "intPkEleetOrEleeleO": intnPkEleetOrEleele,
                "boolIsEleetO": boolnIsEleet
            },
            beforeSend: function () {
                $("#frmPaper").find("#switchPaperTrans").parent().parent().addClass("switchPaperTrans");
            },
            success: function (jsonResponse) {
                $("#paperTransGraph").removeAttr("width")
                $("#paperTransGraph").removeAttr("height")

                if (jsonResponse.objResponse == null) {
                    if (
                        jsonResponse.intStatus != 200
                        ) {
                        $("#frmPaper").prop("hidden", true);
                        $("#paperTransBlocked").children("div").html(jsonResponse.strUserMessage);
                        $("#paperTransBlocked").removeAttr("hidden");
                    }
                    $("#frmPaper").prop("hidden", true);
                    $("#frmPaper").find(".paperAlert").prop("hidden", true);
                    $("#frmPaper").find("#numWidth").prop("readonly", false);
                    $("#frmPaper").find("#numnHeight").prop("readonly", false);
                    $("#paperTransforModal").modal("show");
                }
                else {
                    $("#frmPaper").removeAttr("hidden"); 
                    $("#paperTransBlocked").children("div").html("");
                    $("#paperTransBlocked").prop("hidden", true);

                    $.each(jsonResponse.objResponse, function (key, value) {
                        if (key == "strUnit") {
                            $("#frmPaper").find("#" + key).val(value).change();
                        }
                        else {
                            $("#frmPaper").find("#" + key).val(value == 0 ? "" : value);
                        }
                    })
                    $("#frmPaper").find("#intnPkPaTrans").val(intPaperTransformationPk)

                    if (!jsonResponse.objResponse.boolInputIsChangeable || jsonResponse.objResponse.boolPostSize)
                    {
                        $("#frmPaper").find("#numWidth").prop("readonly", true);
                        $("#frmPaper").find("#numnHeight").prop("readonly", true);
                        $("#frmPaper").find("#strUnit").css("pointer-events", "none");
                        $("#frmPaper").find("#strUnit").css("background", "#dddddd");
                        if (
                            jsonResponse.objResponse.numWidth > 0
                        ) {
                            $("#frmPaper").find("#OriginalSizeJobNote").prop("hidden", true);
                            $("#frmPaper").find("#OriginalSizeMediaNote").prop("hidden", false);
                        } else {
                            $("#frmPaper").find("#OriginalSizeJobNote").prop("hidden", false);
                            $("#frmPaper").find("#OriginalSizeMediaNote").prop("hidden", true);
                        }
                    }
                    else {
                        $("#frmPaper").find("#numWidth").prop("readonly", false);
                        $("#frmPaper").find("#numnHeight").prop("readonly", false);
                        $("#frmPaper").find("#strUnit").css("pointer-events", "all");
                        $("#frmPaper").find("#strUnit").css("background", "#ffffff");
                        $("#frmPaper").find("#OriginalSizeJobNote").prop("hidden", true);
                        $("#frmPaper").find("#OriginalSizeMediaNote").prop("hidden", true);
                    }

                    if (jsonResponse.objResponse.arrrow != null) {
                        $("#frmPaper").find("#paperTransGraph").prop("hidden", false)
                    }

                    if (jsonResponse.objResponse.boolIsReversed) {
                        $("#frmPaper").find(".paperAlert").prop("hidden", false);
                    }
                    else {
                        $("#frmPaper").find(".paperAlert").prop("hidden", true);
                    }

                    if (jsonResponse.objResponse.boolIsOptimized) {
                        $("#frmPaper").find("#boolIsOptimized").prop("checked", true)
                    }
                    else {
                        $("#frmPaper").find("#boolIsOptimized").prop("checked", false)
                    }

                    if (!jsonResponse.objResponse.boolCut) {
                        $("#frmPaper").find("#switchPaperTrans").removeClass("on");
                        $("#frmPaper").find("#switchPaperTrans").parent().next().html("Fold")
                        $("#frmPaper").find("#boolCut").val("false");
                    }
                    else {
                        $("#frmPaper").find("#switchPaperTrans").addClass("on");
                        $("#frmPaper").find("#switchPaperTrans").parent().next().html("Cut")
                        $("#frmPaper").find("#boolCut").val("true");
                    }

                    if (
                        jsonResponse.objResponse.numnHeight == null ||
                        jsonResponse.objResponse.numnHeight == undefined
                    ) {
                        $("#frmPaper").find("#switchPaperTrans").parent().parent().removeClass("switchPaperTrans")
                    }

                    if (jsonResponse.intStatus == 200) {
                        $("#frmPaper").find(".paperAlertSize").prop("hidden", true)
                    }
                    else if (jsonResponse.intStatus == 300) {
                        $("#frmPaper").find(".paperAlertSize").html(jsonResponse.strUserMessage)
                        $("#frmPaper").find(".paperAlertSize").prop("hidden", false)
                    }

                    $(".calculateCuts").keyup();

                    if (boolIsPaper == "true" && boolIsSize) {
                        $("#frmPaper").find("#numCutWidth").prop("readonly", true);
                        $("#frmPaper").find("#numCutHeight").prop("readonly", true);

                        if (
                            intJobId != null && intJobId != "" && intJobId != undefined
                            ) {
                            $("#frmPaper").find("#strUnit").css("pointer-events", "none");
                            $("#frmPaper").find("#strUnit").css("background", "#dddddd");
                        }

                        $("#frmPaper").find("#FinishedSizeNote").prop("hidden", false);
                    } else {
                        $("#frmPaper").find("#numCutWidth").prop("readonly", false);
                        $("#frmPaper").find("#numCutHeight").prop("readonly", false);
                        //$("#frmPaper").find("#strUnit").css("pointer-events", "all");
                        //$("#frmPaper").find("#strUnit").css("background", "#ffffff");
                        $("#frmPaper").find("#FinishedSizeNote").prop("hidden", true);
                    }

                    boolFirstCalculate = false;
                }
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        }).done(function () {
            funGetCalculatedCuts()
            $("#paperTransforModal").modal("show");
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("submit", "#frmPaper", function (e) {
        e.preventDefault()
        let formData = $(this).serialize();

        $.ajax({
            type: "POST",
            url: "/PaperTransformation/SaveTemporaryPaper",
            data: formData,
            success: function (jsonResponse) {
                if (jsonResponse.intStatus == 200) {
                    $("#ResourceForm").find("#intnPkTrans").val(jsonResponse.objResponse)

                    $("#ResourceForm").find("#numnPerUnits").val(numPerUnit)
                    $("#ResourceForm").find("#numnNeeded").val(numNeeded)

                    $("#frmPaper").find("#intnPkPaTrans").val(jsonResponse.objResponse)
                    intPkPaTrans = jsonResponse.objResponse;

                    $("#frmPaper").find("#paperTransGraph").prop("hidden", false)

                    //$("#frmPaper")[0].reset();

                    quantityFrom = $("#ResourceForm").find("#intnPkResourceO").val()
                    needed = $("#ResourceForm").find("#numnNeeded").val()
                    perUnits = $("#ResourceForm").find("#numnPerUnits").val()

                    subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                }
                else {
                    subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                }
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    })

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("keyup", ".calculateCuts", function (e) {
        e.preventDefault()
        if (!boolFirstCalculate) {
            funGetCalculatedCuts();
        }
    })

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", "#boolIsOptimized", function (e) {
        if ($("#boolIsOptimized").is(':checked')) {
            $("#boolIsOptimized").val("true")
        }
        else {
            $("#boolIsOptimized").val("false")
        }

        funGetCalculatedCuts();
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".switchPaperTrans", function (e) {
        let intPk = $(this).attr("data-intpk")
        let boolEnabled = !($(this).children().children().attr("class") === "switch on");

        if (
            boolEnabled
        ) {
            $("#frmPaper").find("#switchPaperTrans").addClass("on");
            $(this).children("label").html("Cut");
            $("#frmPaper").find("#boolCut").prop('checked', true);
            $("#frmPaper").find("#boolCut").val("true");
        }
        else {
            $("#frmPaper").find("#switchPaperTrans").removeClass("on");
            $(this).children("label").html("Fold");
            $("#frmPaper").find("#boolCut").val("false");
        }

        funGetCalculatedCuts()
    })
    
    //------------------------------------------------------------------------------------------------------------------
    $(document).on("hidden.bs.modal", "#paperTransforModal", function (e) {
        boolFirstCalculate = true;
    })

    //------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------
//                                                          //SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function funGetCalculatedCuts() {
    let boolIsReadyToCalculate = true;
    $.each($(".calculateCutsRequired"), function (index, value) {
        let intvalue = $(this).val()
        if (intvalue == "") {
            boolIsReadyToCalculate = false;
        }
    });

    if (boolIsReadyToCalculate) {
        let formData = $("#frmPaper").serialize();
        let boolCut = $("#frmPaper").find("#boolCut").val();
        let intParentWidth = 0;
        let intParentHeight = 0;
        let arrrow = null;
        let boolWidthIsScaled = false;
        let boolHeightIsScaled = false;
        let numMinFactor = 0;

        $.ajax({
            type: "POST",
            url: "/PaperTransformation/GetCalculatedCuts",
            data: formData,
            success: function (jsonResponse) {
                if (jsonResponse.intStatus == 200 || jsonResponse.intStatus == 300) {
                    $("#paperTransGraph").removeAttr("width")
                    $("#paperTransGraph").removeAttr("height")

                    $("#paperTransGraph").prop("hidden", false)

                    if (
                        jsonResponse.objResponse.numPerUnit == 0 ||
                        jsonResponse.objResponse.numNeeded == 0 
                    ) {
                        $(".savePaperTrans").prop("disabled", true)
                    }
                    else {
                        if (
                            boolCut == "false"
                        ) {
                            numPerUnit = 1;
                        } else {
                            numPerUnit = jsonResponse.objResponse.numPerUnit;
                        }
                        numNeeded = jsonResponse.objResponse.numNeeded;
                        $(".savePaperTrans").prop("disabled", false)
                    }

                    let parentGraphContainerWidth = 0
                    let parentGraphContainerHeight = 0

                    parentGraphContainerWidth = $("#parentGraphContainer").width();
                    parentGraphContainerHeight = $("#parentGraphContainer").height();

                    let numHeight = $("#numnHeight").val();
                    if (
                        (numHeight == null || numHeight == undefined || numHeight == "")
                        ) {
                        numHeight = jsonResponse.objResponse.arrrow[0].numheight * jsonResponse.objResponse.arrrow.length;
					}

                    intParentWidth = (($("#numWidth").val() * 100) / 3) + 10;
                    intParentHeight = ((numHeight * 100) / 3) + 10;

                    if (
                        parentGraphContainerWidth > 0 &&
                        intParentWidth > parentGraphContainerWidth
                    ) {
                        intParentWidth = parentGraphContainerWidth;
                        boolWidthIsScaled = true;
                    }
                    if (
                        parentGraphContainerHeight > 0 &&
                        intParentHeight > parentGraphContainerHeight
                    ) {
                        intParentHeight = parentGraphContainerHeight
                        boolHeightIsScaled = true;
                    }

                    let numparentGraphContainerW = ($("#parentGraphContainer").width() - 10) / $("#numWidth").val();
                    let numparentGraphContainerH = ($("#parentGraphContainer").height() - 10) / numHeight;

                    numMinFactor = Math.min(numparentGraphContainerW, numparentGraphContainerH)//.toFixed(1);

                    arrrow = jsonResponse.objResponse.arrrow;

                    //subCreateGraph(intParentWidth, intParentHeight, arrrow,
                    //    boolWidthIsScaled, boolHeightIsScaled, numMinFactor)

                    if (jsonResponse.objResponse.boolIsReversed) {
                        $(".paperAlert").prop("hidden", false);
                    }
                    else {
                        $(".paperAlert").prop("hidden", true);
                    }

                    if (jsonResponse.intStatus == 200) {
                        $(".paperAlertSize").prop("hidden", true)
                        //subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                    }
                    else if (jsonResponse.intStatus == 300) {
                        $(".paperAlertSize").html(jsonResponse.strUserMessage)
                        $(".paperAlertSize").prop("hidden", false)
                    }
                }
                else {
                    subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                }
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        }).done(function () { 
            subCreateGraph(intParentWidth, intParentHeight, arrrow,
                boolWidthIsScaled, boolHeightIsScaled, numMinFactor)
        });
    }
    else {
        $("#paperTransGraph").prop("hidden", true)
    }
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subCreateGraph(intParentWidth, intParentHeight, arrrow, boolWidthIsScaled, boolHeightIsScaled, numMinFactor) {
    let canvas = document.getElementById('paperTransGraph');
    canvas.width = intParentWidth;
    canvas.height = intParentHeight;

    let boolCut = JSON.parse($("#frmPaper").find("#boolCut").val());
    let numParentRectangleWidth = 0;
    let numParentRectangleHeight = 0;

    let ctx = canvas.getContext('2d');

    let totalHeight = 0;
    let intRows = arrrow.length
    for (let row = 0; row < intRows; row++) {
        let objRow = arrrow[row];
        let numheight = objRow.numheight;
        let intCellHeight = (numheight * 100) / 3;

        if (boolHeightIsScaled) {
            intCellHeight = numheight * numMinFactor
        }

        let y = totalHeight;

        let totalWidth = 0;
        let intCols = objRow.arrcell.length
        for (let col = 0; col < intCols; col++) {
            let objCol = objRow.arrcell[col];
            let numwidth = objCol.numwidth
            let intCellWidth = (numwidth * 100) / 3;

            if (boolWidthIsScaled) {
                intCellWidth = numwidth * numMinFactor
            }

            let x = totalWidth;

            ctx.beginPath();
            ctx.rect(x, y, intCellWidth, intCellHeight);

            if (objCol.boolIsWaste) {
                //console.info("Waste: " + intCellWidth + "x" + intCellHeight + " Coords:" + x + " , " + y)
                ctx.fillStyle = "#666666";
                ctx.strokeStyle = "#666666";
                ctx.fillRect(x, y, intCellWidth, intCellHeight);
            }
            else {
                //console.info("Paper: " + intCellWidth + "x" + intCellHeight + " Coords:" + x + " , " + y)
                if (!boolCut) {
                    ctx.setLineDash([7]);
                }
                ctx.font = "15px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#000000";

                ctx.fillText(numwidth + " x " + numheight, x + (intCellWidth / 2), y + (intCellHeight / 2));
            }

            ctx.stroke();

            totalWidth = totalWidth + intCellWidth;
        }

        numParentRectangleWidth = totalWidth;

        totalHeight = totalHeight + intCellHeight;
    }

    numParentRectangleHeight = totalHeight;

    let ctx2 = canvas.getContext('2d');
    ctx2.beginPath();
    ctx.setLineDash([0]);
    ctx.lineWidth = 2;
    ctx2.rect(0, 0, numParentRectangleWidth, numParentRectangleHeight);
    ctx2.stroke();

    console.info(numParentRectangleWidth);
    console.info(numParentRectangleHeight);
}