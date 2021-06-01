$(document).ready(function () {
	let boolPrintCreditMemo = false;

	//------------------------------------------------------------------------------------------------------------------
	$('#creditMemoDate').datetimepicker({
		format: "YYYY-MM-DD"
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnCreditMemo", function (event) {
		$("#creditMemoDivForm").removeAttr("hidden");
		$("#creditMemoTableSection").attr("hidden", true);

		funGetCustomers();
		funGetAllAccountsRevenueAvailable();
		$('#creditMemoModal').modal('show');
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funGetCustomers() {
		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetCustomers",
			beforeSend: function () {
				let invoiceSelect = $('#creditMemoForm').find("select[name=intnPkInvoice]");

				$('#creditMemoForm')[0].reset();
				invoiceSelect.html("");
				invoiceSelect.append(new Option("None", ""));
				invoiceSelect.trigger("change");
			},
			success: function (objResponse) {
				let selectListCustomersForNewCreditMemo = $('#creditMemoForm').find("select[name=intContactId]");
				selectListCustomersForNewCreditMemo.html("");
				selectListCustomersForNewCreditMemo.append(new Option("Pick one", ""));

				let selectListCustomersfilter = $('#filterCreditMemoByCustomer');
				selectListCustomersfilter.html("");
				selectListCustomersfilter.append(new Option("All", null));

				if (objResponse.length > 0) {
					for (var i = 0; i < objResponse.length; i++) {
						var obj = objResponse[i];
						option = document.createElement("option");
						option.value = obj.intContactId;
						option.text = obj.strFullName;

						let optionElementForForm = new Option(option.text, option.value);
						$(optionElementForForm).attr("data-strCustomerName", obj.strFullName);
						selectListCustomersForNewCreditMemo.append(optionElementForForm);

						let optionElementForFilter = new Option(option.text, option.value);
						selectListCustomersfilter.append(optionElementForFilter);
					}
				}
			}
		});
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funGetAllAccountsRevenueAvailable() {
		$.ajax({
			type: "GET",
			url: "/Invoice/GetAllAccountsRevenueAvailable",
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					let selectElement = $("#creditMemoForm").find("select[name=intPkRevenueAccount]");
					selectElement.html("");
					selectElement.append('<option value="">Pick one</option>');

					$.each(objResponse.objResponse, function (intIndex, object) {
						selectElement.append('<option value="' + object.intPk + '">' + object.strName + '</option>');
					});
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus)
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	}

	//------------------------------------------------------------------------------------------------------------------
	$("#customerForOverpaidInvoices").change(function () {
		let intContactId = $(this).val();
		let strCustomerName = $(this).find(':selected').data('strcustomername');
		$('#creditMemoForm').find("input[name=strCustomerFullName]").val(strCustomerName);

		if (
			intContactId != null && intContactId != "" && intContactId != undefined
		) {
			funGetContactBillingAddress(intContactId);

			$.ajax({
				type: "GET",
				url: "/PrintshopAccount/GetOverpaidInvoices",
				data: {
					"intContactId": intContactId
				},
				success: function (objResponse) {
					var selectListCustomers = $('#creditMemoForm').find("select[name=intnPkInvoice]");
					selectListCustomers.html("");
					selectListCustomers.append(new Option("None", ""));
					if (
						objResponse.objResponse.length > 0
					) {
						for (var i = 0; i < objResponse.objResponse.length; i++) {
							var obj = objResponse.objResponse[i];
							let option = document.createElement("option");
							option.value = obj.intPk;
							option.text = "Order no. " + obj.intOrderNumber + " - $" + obj.numOpenBalance;

							let optionElement = new Option(option.text, option.value)

							$(optionElement).attr("data-intOrderNumber", obj.intOrderNumber);
							$(optionElement).attr("data-numOpenBalance", obj.numOpenBalance);
							$(optionElement).attr("data-strBilledTo", obj.strBilledTo);

							selectListCustomers.append(optionElement);
						}
					}
				}
			});
		}
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funGetContactBillingAddress(intContactId) {
		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetContactBillingAddress",
			data: {
				"intContactId": intContactId
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					$('#creditMemoForm').find("textarea[name=strBilledTo]").val(objResponse.objResponse);
				}
				else {
					$('#creditMemoForm').find("textarea[name=strBilledTo]").val("");
				}
			}
		});
	}

	//------------------------------------------------------------------------------------------------------------------
	$("#intPkInvoiceForCreditMemo").change(function () {
		let intPkInvoice = $(this).val();
		let numopenbalance = $(this).find(':selected').data('numopenbalance');
		let strOrderNumber = $(this).find(':selected').data('numopenbalance');
		let strBilledTo = $(this).find(':selected').data('strbilledto');
		let form = $('#creditMemoForm');

		if (
			intPkInvoice > 0
		) {
			form.find("textarea[name=strBilledTo]").val(strBilledTo);

			form.find("input[name=numAmount]").css("pointer-events", "none");
			form.find("input[name=numAmount]").css("background", "#dddddd");
			form.find("input[name=numAmount]").val(numopenbalance);

			form.find("input[name=strDescription]").css("pointer-events", "none");
			form.find("input[name=strDescription]").css("background", "#dddddd");
			form.find("input[name=strDescription]").val("Order no. " + strOrderNumber);

			form.find("select[name=intnPkRevenueAccount]").css("pointer-events", "none");
			form.find("select[name=intnPkRevenueAccount]").css("background", "#dddddd");
			form.find("select[name=intnPkRevenueAccount]").removeAttr("required");
			form.find("select[name=intnPkRevenueAccount]").val("");
		}
		else {
			form.find("input[name=numAmount]").css("pointer-events", "auto");
			form.find("input[name=numAmount]").css("background", "#ffffff");
			form.find("input[name=numAmount]").val(0);

			form.find("input[name=strDescription]").css("pointer-events", "auto");
			form.find("input[name=strDescription]").css("background", "#ffffff");
			form.find("input[name=strDescription]").val(numopenbalance);

			form.find("select[name=intnPkRevenueAccount]").attr("required", true);
			form.find("select[name=intnPkRevenueAccount]").css("pointer-events", "auto");
			form.find("select[name=intnPkRevenueAccount]").css("background", "transparent none repeat scroll 0 0");
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".save-CreditMemo").click(function () {
		let boolPrint = $(this).data("boolprint");
		boolPrintCreditMemo = boolPrint;
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#creditMemoForm").submit(function (event) {
		event.preventDefault();
		let objCreditMemo = {};
		let invoiceSelect = $('#creditMemoForm').find("select[name=intnPkInvoice]");

		$(this).serializeArray().map(function (item) {
			if (objCreditMemo[item.name]) {
				if (typeof (objCreditMemo[item.name]) === "string") {
					objCreditMemo[item.name] = [config[item.name]];
				}
				objCreditMemo[item.name].push(item.value);
			} else {
				objCreditMemo[item.name] = item.value;
			}
		});

		objCreditMemo["boolPrint"] = boolPrintCreditMemo;

		$.ajax({
			type: "POST",
			url: "/PrintshopAccount/AddCreditMemo",
			data: objCreditMemo,
			success: function (objResponse) {
				if (
					typeof objResponse != "object"
				) {
					$('#creditMemoForm')[0].reset();
					invoiceSelect.html("");
					invoiceSelect.append(new Option("None", ""));
					invoiceSelect.trigger("change");

					const linkSource = `data:application/pdf;base64,${objResponse}`;
					const downloadLink = document.createElement("a");
					const fileName = "credit_memo_" + objCreditMemo.strCreditMemoNumber + ".pdf";
					downloadLink.href = linkSource;
					downloadLink.download = fileName;
					downloadLink.click();
				}
				else {
					if (
						objResponse.intStatus == 200
					) {

						$('#creditMemoForm')[0].reset();
						invoiceSelect.html("");
						invoiceSelect.append(new Option("None", ""));
						invoiceSelect.trigger("change");
					}

					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}

				boolPrintCreditMemo = false;
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});

	});

	//------------------------------------------------------------------------------------------------------------------
	$("#viewCreditMemosButton").click(function () {
		$("#creditMemoDivForm").attr("hidden", true);
		$("#creditMemoTableSection").removeAttr("hidden");

		funGetCreditMemos();
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#backToNewCreditMemo").click(function () {
		$("#creditMemoDivForm").removeAttr("hidden");
		$("#creditMemoTableSection").attr("hidden", true);

		funGetCreditMemos();
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funGetCreditMemos(
		intnContactId
	) {
		let tbody = $("#creditMemoTable").find("tbody");

		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetCreditMemos",
			data: {
				"intnContactId": intnContactId
			},
			beforeSend: function () {
				tbody.html('<tr><td colspan="3" class="text-center"><i class="fa fa-spinner' +
					' fa-pulse fa-3x fa-fw">' + '</i><span class="sr-only" >Loading...</span ></td></tr>');
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					tbody.html("");

					if (
						objResponse.objResponse.length > 0
					) {
						$.each(objResponse.objResponse, function (intIndex, obj) {
							let row = $("<tr class='tr-calculation-row'></tr>");

							row.append("<td>" + obj.strCreditMemoNumber + "</td>");
							row.append("<td>" + obj.strCustomerFullName + "</td>");
							row.append("<td><button data-intPkCreditMemo='" + obj.intPkCreditMemo +
								"'data-strCreditMemoNumber='" + obj.strCreditMemoNumber +
								"' class='btn btn-sm btn-info print-credit-memo'>" +
								"<i class='fa fa-print'></i> Print</button></td>");

							tbody.append(row);
						});
					}
					else {
						tbody.append("<td class='text-center' colspan='3'>There are no records to show.<td>");
					}
				}
				else {
					tbody.append("<td class='text-center' colspan='3'>There are no records to show.<td>");
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	}

	//------------------------------------------------------------------------------------------------------------------
	$("#filterCreditMemoByCustomer").change(function () {
		funGetCreditMemos($(this).val());
	})

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".print-credit-memo", function () {
		let intPkCreditMemo = $(this).data("intpkcreditmemo");
		let strCreditMemoNumber = $(this).data("strcreditmemonumber");

		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetCreditMemo",
			data: {
				"intPkCreditMemo": intPkCreditMemo
			},
			success: function (objResponse) {
				if (
					typeof objResponse != "object"
				) {
					const linkSource = `data:application/pdf;base64,${objResponse}`;
					const downloadLink = document.createElement("a");
					const fileName = "credit_memo_" + strCreditMemoNumber + ".pdf";
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

	//------------------------------------------------------------------------------------------------------------------
});