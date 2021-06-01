$(document).ready(function () {
    let boolPrintBankDeposit = false;

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".accountBankModalClose", function (e) {
        $("#accountBankModal").modal("hide")
    })

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".accountBankModalBtn", function (e) {
        let strAccount = $("#bankDepositForm").find("#intPkBankAccount option:selected").text();
        $("#accountBankModalTitle").html(strAccount)
    })

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnBankDeposit", function (e) {
        getOpenPayments(false);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".getBankDepositsInARange", function (e) {
        let strStartDate = $('#strAccountBankStartDate').val();
        let strEndDate = $('#strAccountBankEndDate').val();
        let intPkBankAccount = $("#intPkBankAccount").val();

        if (
            strStartDate == ""
            )
        {
            subSendNotification("Please, select a start date", 300);
            $('#strAccountBankStartDate').focus()
        }

        if (
            strStartDate == ""
        ) {
            subSendNotification("Please, select a end date", 300);
            $('#strAccountBankEndDate').focus()
        }

        if (
            intPkBankAccount == ""
        ) {
            subSendNotification("Please, select an account", 300);
            $("#intPkBankAccount").focus()
        }

        if (
            strStartDate != "" &&
            strEndDate != "" &&
            intPkBankAccount != ""
            )
        {
            $.ajax({
                type: "POST",
                url: "/PrintshopBankDeposit/GetBankDepositsInARange",
                data: {
                    "strStartDate": strStartDate, "strEndDate": strEndDate, "intPkBankAccount": intPkBankAccount
                },
                success: function (htmlResponse) {
                    $("#accountBankTable").html(htmlResponse)
                },
                error: function () {
                    subSendNotification("Something is wrong.", 400);
                }
            });
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnAddDepositBank", function (e) {
        let strDate = $("#bankDepositForm").find('#strBankDate').val();
        let intPkAccount = $("#bankDepositForm").find('#intPkBankAccount').val();
        let arrintPkPayment = new Array();

        $("#bankDepositForm").find(".chkPayment:checked").each(function () {
            arrintPkPayment.push(parseInt(this.value));
        });


        if (
            $(this).hasClass("btnSaveAndPrintDepositBank")
            ) {
            boolPrintBankDeposit = true;
		}

        if (
            strDate != "" &&
            intPkAccount != "" &&
            arrintPkPayment.length > 0
        ) {
            $.ajax({
                type: "POST",
                url: "/PrintshopBankDeposit/AddBankDeposit",
                data: {
                    "strDate": strDate,
                    "intPkAccount": intPkAccount,
                    "arrintPkPayment": arrintPkPayment,
                    "boolPrintBankDeposit": boolPrintBankDeposit
                },
                success: function (jsonResponse) {
                    if (
                        typeof jsonResponse != "object"
                    ) {
                        getOpenPayments(true);

                        const linkSource = `data:application/pdf;base64,${jsonResponse}`;
					    const downloadLink = document.createElement("a");
					    const fileName = "bank_deposit_" + strDate + ".pdf";
					    downloadLink.href = linkSource;
					    downloadLink.download = fileName;
					    downloadLink.click();
                    }
                    else {
                        if (jsonResponse.intStatus == 200) {
                            getOpenPayments(true)
                            subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                        }
                        else {
                            subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                        }
                    }

                    boolPrintBankDeposit = false;
                },
                error: function () {
                    boolPrintBankDeposit = false;
                    subSendNotification("Something is wrong.", 400);
                }
            });
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", "#intPkBankAccount", function (e) {
        let intPkBankAccount = $("#bankDepositForm").find('#intPkBankAccount').val();
        let strBankDate = $("#bankDepositForm").find("#strBankDate").val()

        if (
            intPkBankAccount != ""
        ) {
            $.ajax({
                type: "POST",
                url: "/PrintshopBankDeposit/GetAccountBalance",
                data: {
                    "intPk": intPkBankAccount
                },
                success: function (jsonResponse) {
                    if (jsonResponse.intStatus == 200) {
                        if (
                            intPkBankAccount != ""
                        )
                        {
                            $(".accountBankModalBtn").prop("disabled", false)
                        }
                        $(".lblAmount").html(" $ " + strCurrencyFormat(jsonResponse.objResponse))
                        //subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                    }
                    else {
                        subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                    }
                },
                error: function () {
                    subSendNotification("Something is wrong.", 400);
                }
            });
        }
        else {
            $(".accountBankModalBtn").prop("disabled", true)
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".print-deposit-summary", function () {
        let intPkBankDeposit = $(this).data("intpkbankdeposit");
        let strDate = $(this).data("strdate");

        $.ajax({
            type: "GET",
            url: "/PrintshopBankDeposit/GetBankDepositSummary",
            data: {
                "intPkBankDeposit": intPkBankDeposit
            },
            success: function (objResponse) {
                if (
                    typeof objResponse != "object"
                ) {
                    const linkSource = `data:application/pdf;base64,${objResponse}`;
                    const downloadLink = document.createElement("a");
                    const fileName = "bank_deposit_" + strDate + ".pdf";
                    downloadLink.href = linkSource;
                    downloadLink.download = fileName;
                    downloadLink.click();
                }
                else {
                    subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
                }
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
			}
        });
    });

    ////------------------------------------------------------------------------------------------------------------------
    //$(document).on("change input keyup", "#strBankDate", function (e) {
    //    let intPkBankAccount = $("#bankDepositForm").find('#intPkBankAccount').val();
    //    let strBankDate = $("#bankDepositForm").find("#strBankDate").val()

    //    if (
    //        intPkBankAccount != "" &&
    //        strBankDate != ""
    //    ) {
    //        $(".accountBankModalBtn").prop("disabled", false)
    //    }
    //    else {
    //        $(".accountBankModalBtn").prop("disabled", true)
    //    }
    //});

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", ".chkPayment", function (e) {
        let numBankTotal = 0;
        $(".chkPayment:checked").each(function () {
            numBankTotal = numBankTotal + parseFloat($(this).attr("data-numAmount"))
        })

        $(".numBankTotal").html(strCurrencyFormat(numBankTotal))
    })

    //------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------
//															//SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getOpenPayments(boolModalIsShow) {
    $.ajax({
        type: "POST",
        url: "/PrintshopBankDeposit/Index",
        //data: { "strNumber": strNumber, "strName": strName, "intPkType": intPkType },
        success: function (htmlResponse) {
            if (boolModalIsShow) {
                $("#mi4pMasterModalBody").html(htmlResponse);
            }
            else {
                subShowModal("Bank Deposit", htmlResponse, "modal-lg", "", true, false);
            }

            $('#strBankDate').datetimepicker({
                format: "YYYY-MM-DD"
            });

            $('#strAccountBankStartDate').datetimepicker({
                format: "YYYY-MM-DD"
            });

            $('#strAccountBankEndDate').datetimepicker({
                format: "YYYY-MM-DD"
            });
        },
        error: function () {
            subSendNotification("Something is wrong.", 400);
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 