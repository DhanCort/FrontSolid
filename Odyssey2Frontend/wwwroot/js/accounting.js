$(document).ready(function () {
	//------------------------------------------------------------------------------------------------------------------
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
	$(document).on("click", ".saveAccount", function (e) {
		let strNumber = $("#accountForm").find("#strNumber").val()
		let strName = $("#accountForm").find("#strName").val()
		let intPkType = $("#accountForm").find("#intPkType").val()

		if (strNumber == "" || strName == "" || intPkType == "") {
			subSendNotification("All inputs are required", 400);
		}
		else {
			$.ajax({
				type: "POST",
				url: "/PrintshopAccount/AddAccount",
				data: { "strNumber": strNumber, "strName": strName, "intPkType": intPkType },
				success: function (jsonResponse) {
					if (jsonResponse.intStatus == 200) {
						//subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
						window.location = "/PrintshopAccount/Index";
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
	})

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".deleteAccount", function (e) {
		let intPk = $(this).attr("data-intpk")
		let element = $(this);

		$.ajax({
			type: "POST",
			url: "/PrintshopAccount/Delete",
			data: { "intPk": intPk },
			success: function (jsonResponse) {
				if (jsonResponse.intStatus == 200) {
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
					element.parent().parent().remove();
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
	$(document).on("click", ".switchAccounting", function (e) {
		let intPk = $(this).attr("data-intpk")
		let boolEnabled = !($(this).children().children().attr("class") === "switch on");

		$.ajax({
			type: "POST",
			url: "/PrintshopAccount/EnableDisable",
			data: {
				"intPk": intPk,
				"boolEnabled": boolEnabled
			},
			success: function (jsonResponse) {
				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				if (
					jsonResponse.intStatus == 200
				) {
					if (
						boolEnabled
					) {
						$("#switch_" + intPk).addClass("on");
					}
					else {
						$("#switch_" + intPk).removeClass("on");
					}
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	})

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".editAccount", function (e) {
		let intPk = $(this).attr("data-intpk")

		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetAccount",
			data: {
				"intPk": intPk
			},
			success: function (jsonResponse) {
				
				if (
					jsonResponse.intStatus == 200
				) {
					$("#accountForm").find("#strNumber").val(jsonResponse.objResponse.strNumber);
					$("#accountForm").find("#strName").val(jsonResponse.objResponse.strName);
					$("#accountForm").find("#intPkType").val(jsonResponse.objResponse.intPkType);
					$("#accountForm").find("#intPkType").prop("disabled", true);
					$("#accountForm").find("#intPkType").css("background", "#dddddd");
					$("#accountForm").find(".saveAccount").prop("hidden", true);
					$("#accountForm").find(".updateAccount").attr("data-intpk", intPk);
					$("#accountForm").find(".updateAccount").prop("hidden", false);
					$("#accountForm").find(".cancelUpdateAccount").prop("hidden", false);
				} else {
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                }
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	})

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".updateAccount", function (e) {
		let intPk = $(this).attr("data-intpk");
		let strNumber = $("#accountForm").find("#strNumber").val();
		let strName = $("#accountForm").find("#strName").val();

		$.ajax({
			type: "POST",
			url: "/PrintshopAccount/UpdateAccount",
			data: {
				"intPk": intPk,
				"strNumber": strNumber,
				"strName": strName
			},
			success: function (jsonResponse) {

				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				if (
					jsonResponse.intStatus == 200
				) {
					window.location = "/PrintshopAccount/Index";
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	})

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".cancelUpdateAccount", function (e) {
		window.location = "/PrintshopAccount/Index";
	})

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".getjobMovs", function (e) {
		let strStartDate = $("#strStartDate").val().split(" ")[0];
		let strStartTime = $("#strStartDate").val().split(" ")[1] + ":00";
		let strEndDate = $("#strEndDate").val().split(" ")[0];
		let strEndTime = $("#strEndDate").val().split(" ")[1] + ":00";

		$.ajax({
			type: "POST",
			url: "/PrintshopAccount/AccountReport",
			data: {
				"strStartDate": strStartDate,
				"strStartTime": strStartTime,
				"strEndDate": strEndDate,
				"strEndTime": strEndTime
			},
			success: function (response) {
				if (
					typeof response === "object"
				) {
					subSendNotification(response.strUserMessage, response.intStatus);
				}
				else {
					$("#accountReportTable").html(response)
				}
			}
		})
	})

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", "#intnContactId", function (event) {
        let intnContactId = $('#paymentsModal').find("#intnContactId").val();
        $.ajax({
            type: "GET",
            url: "/PrintshopAccount/GetInvoicesToPayment",
            data: {
                "intContactId": intnContactId
            },
            success: function (objResponse) {
                var selectListCustomers = $('#paymentsModal').find("#intnPkInvoice");
                selectListCustomers.html("");
                selectListCustomers.append(new Option("Pick one", ""));
                if (objResponse.length > 0) {
                    for (var i = 0; i < objResponse.length; i++) {
                        var obj = objResponse[i];
                        option = document.createElement("option");
                        option.value = obj.intPk;
                        option.text = obj.intOrderNumber;
                        selectListCustomers.append(new Option(option.text, option.value));
                    }
                }
            }
        })
    });

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".showAccountDetails", function () {
		let intPkAccount = $(this).data("intpk");
		let strAccountName = $(this).data("straccountname");

		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetAccountMovements",
			data: {
				"intPkAccount": intPkAccount
			},
			success: function (objResponse) {
				if (
					typeof objResponse === "object"
				) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus)
				}
				else {
					$("#accountMovementsModal").find(".modal-title").html(strAccountName + " Details");
					$("#accountMovementsModal").find(".modal-body").html(objResponse);
					$("#accountMovementsModal").find('#strStartDate').datetimepicker({
						format: "YYYY-MM-DD HH:mm"
					});
					$("#accountMovementsModal").find('#strEndDate').datetimepicker({
						format: "YYYY-MM-DD HH:mm"
					});
					$("#accountMovementsModal").modal("show");
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".getAccountMovs", function () {
		let intPkAccount = $(this).data("intpk");
		let strStartDate = $("#strStartDate").val().split(" ")[0];
		let strStartTime = $("#strStartDate").val().split(" ")[1] + ":00";
		let strEndDate = $("#strEndDate").val().split(" ")[0];
		let strEndTime = $("#strEndDate").val().split(" ")[1] + ":00";

		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetAccountMovements",
			data: {
				"intPkAccount": intPkAccount,
				"strStartDate": strStartDate,
				"strStartTime": strStartTime,
				"strEndDate": strEndDate,
				"strEndTime": strEndTime
			},
			success: function (objResponse) {
				if (
					typeof objResponse === "object"
				) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus)
				}
				else {
					$("#accountMovementsModal").find(".modal-body").html(objResponse);
					$("#accountMovementsModal").find('#strStartDate').datetimepicker({
						format: "YYYY-MM-DD HH:mm"
					});
					$("#accountMovementsModal").find('#strEndDate').datetimepicker({
						format: "YYYY-MM-DD HH:mm"
					});
					$("#accountMovementsModal").modal("show");
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".uploadTaxFile", function (e) {
        let form = new FormData();
        let taxFile = $("#taxFile")[0].files;

        if (taxFile.length > 0) {
            form.append('taxFile', taxFile[0]);            

			$("#taxFile").prop("disabled", true)

            $.ajax({
                url: "/PrintshopAccount/UploadTaxFile",
                type: 'post',
                data: form,
                contentType: false,
                processData: false,
                beforeSend: function () {
                    $(".loadFileLoaderModal").css("display", "block")
                    $(".uploadTaxFile").prop("disabled", true);
                },
                success: function (response) {
                    if (response.intStatus == 200) {
                        subSendNotification(response.strUserMessage, response.intStatus);
						$("#loadFileModal").modal("hide")
                    }
                    else {
						subSendNotification(response.strUserMessage, response.intStatus);						
                    }

					$("#taxFile").prop("disabled", false)

                    $("#taxFile").val("")
                    $(".custom-file-label").html("Choose file")

                    $(".loadFileLoaderModal").css("display", "none")
                    $(".uploadTaxFile").prop("disabled", false);
				}
            });
        }
    })

    //------------------------------------------------------------------------------------------------------------------
});