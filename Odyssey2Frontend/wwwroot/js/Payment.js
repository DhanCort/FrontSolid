$(document).ready(function () {
	let numAmountInvoices = 0;
	let numAmountCredits = 0;
	let numAmountReceived = 0;

	let numAmountToApply = 0;
	let numAmountToCredit = 0;

	//------------------------------------------------------------------------------------------------------------------
	$('#paymentDate').datetimepicker({
		format: "YYYY-MM-DD"
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnPayments", function (event) {
		funGetCustomers();
		funGetPaymentMethods();
		funGetBankAccounts();

		numAmountInvoices = 0;
		numAmountCredits = 0;
		numAmountReceived = 0;
		numAmountToApply = 0;
		numAmountToCredit = 0;

		$("#receivePaymentForm")[0].reset();
		$("#receivePaymentForm").find("input[name=numAmountReceived]").val(0)
		$("#openInvoicesSection").attr("hidden", true);
		$("#openInvoicesSection").next().attr("hidden", true);
		$("#creditSection").attr("hidden", true);
		$('#paymentsModal').modal('show');

		$("#receivePaymentForm").find("#amount-received-label").html("$ 0.00");

		$("#receivePaymentForm").find("#amountToApplySection").html("$ 0.00");
		$("#receivePaymentForm").find("#amountToCreditSection").html("$ 0.00");
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funGetCustomers() {
		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetCustomers",
			success: function (objResponse) {
				var selectListCustomers = $('#paymentsModal').find("#intContactId");
				selectListCustomers.html("");
				selectListCustomers.append(new Option("Pick one", ""));
				if (objResponse.length > 0) {
					for (var i = 0; i < objResponse.length; i++) {
						var obj = objResponse[i];
						option = document.createElement("option");
						option.value = obj.intContactId;
						option.text = obj.strFullName;
						selectListCustomers.append(new Option(option.text, option.value));
					}
				}
			}
		});
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funGetPaymentMethods() {
		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetPaymentMethods",
			success: function (objResponse) {
				var selectListCustomers = $('#paymentsModal').find("#intPkPaymentMethod");
				selectListCustomers.html("");
				selectListCustomers.append(new Option("Pick one", ""));

				if (
					objResponse.intStatus == 200
				) {
					for (var i = 0; i < objResponse.objResponse.length; i++) {
						var obj = objResponse.objResponse[i];
						option = document.createElement("option");
						option.value = obj.intPk;
						option.text = obj.strName;
						selectListCustomers.append(new Option(option.text, option.value));
					}
				}
			}
		});
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funGetBankAccounts() {
		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetBankAccounts",
			data: {
				"boolUndepositedFunds": true
			},
			success: function (objResponse) {
				var selectListCustomers = $('#paymentsModal').find("#intPkAccount");
				selectListCustomers.html("");

				if (
					objResponse.intStatus == 200
				) {
					for (var i = 0; i < objResponse.objResponse.length; i++) {
						var obj = objResponse.objResponse[i];
						option = document.createElement("option");
						option.value = obj.intPk;
						option.text = obj.strName;
						selectListCustomers.append(new Option(option.text, option.value));
					}
				}
			}
		});
	}

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", "#intContactId", function (event) {
		let intnContactId = $(this).val();

		if (
			(intnContactId != null && intnContactId != undefined && intnContactId != "")
		) {
			GetOpenInvoice(intnContactId, null);
			GetCredits(intnContactId, null);
			$("#openInvoicesSection").next().removeAttr("hidden");
		}
		else {
			$("#openInvoicesSection").attr("hidden", true);
			$("#openInvoicesSection").next().attr("hidden", true);
			$("#creditSection").attr("hidden", true);
		}

		numAmountInvoices = 0;
		numAmountCredits = 0;
		numAmountReceived = 0;
		numAmountToApply = 0;
		numAmountToCredit = 0;

		$("#receivePaymentForm").find("#amount-received-label").html("$ 0.00");
		$("#receivePaymentForm").find("#amountToApplySection").html("$ 0.00");
		$("#receivePaymentForm").find("#amountToCreditSection").html("$ 0.00");
		$("#receivePaymentForm")[0].reset();
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#searchInvoiceForPayment", function (event) {
		let intInvoiceNumber = $(this).prev().val();

		if (
			(intInvoiceNumber != null && intInvoiceNumber != undefined && intInvoiceNumber != "")
		) {
			GetOpenInvoice(null, intInvoiceNumber);
			GetCredits(null, intInvoiceNumber);
		}
		else {
			$("#openInvoicesSection").attr("hidden", true);
			$("#creditSection").attr("hidden", true);
		}

		$("#receivePaymentForm").find("#amount-received-label").html("$ 0.00");
		$("#receivePaymentForm").find("#amountToApplySection").html("$ 0.00");
		$("#receivePaymentForm").find("#amountToCreditSection").html("$ 0.00");
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function GetOpenInvoice(
		intnContactId,
		intnOrderNumber
	) {
		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetOpenInvoices",
			data: {
				"intnContactId": intnContactId,
				"intnOrderNumber": intnOrderNumber
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					$("#openInvoicesTableBody").html("");
					let tableBody = $("#openInvoicesTableBody");
					$("#receivePaymentForm").find("#intContactId").val(objResponse.objResponse.intContactId)

					if (
						objResponse.objResponse.arrOpenInvoices.length > 0
					) {
						$.each(objResponse.objResponse.arrOpenInvoices, function (intIndex, obj) {
							let row = $("<tr></tr>");

							let customCheckbox = $("<div class='custom-control custom-checkbox'></div>")
								.append("<input class='custom-control-input paymentInvoiceCheckbox' name='intPkInvoice'" +
									" type='checkbox' id='invoice-" + obj.intPkInvoice + "'  value='" +
									obj.intPkInvoice + "' data-numOpenBalance='" + obj.numOpenBalance + "'/>")
								.append("<label class='custom-control-label checkbox-label' for='invoice-"
									+ obj.intPkInvoice + "'></label>");

							let culumnCheckbox = $("<td></td>").append(customCheckbox);

							row.append(culumnCheckbox)
								.append("<td class='text-centered'>" +
									obj.intInvoiceNumber + "</td>")
								.append("<td>$</td><td class='text-right pr-5 pl-0'>" +
									strCurrencyFormat(obj.numOriginalAmount) + "</td>")
								.append("<td>$</td><td class='text-right pr-5 pl-0'>" +
									strCurrencyFormat(obj.numOpenBalance) + "</td>");

							tableBody.append(row);
						});

						$('#paymentsModal').find("#intContactId").val(objResponse.objResponse.intContactId);
					}
					else {
						let row = $("<tr></tr>");
						row.append("<td colspan='5' class='text-center'>There are no records to show.</td>");

						tableBody.append(row);
					}

					$("#openInvoicesSection").removeAttr("hidden");
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
	function GetCredits(
		intnContactId,
		intnOrderNumber
	) {
		$.ajax({
			type: "GET",
			url: "/PrintshopAccount/GetCredits",
			data: {
				"intnContactId": intnContactId,
				"intnOrderNumber": intnOrderNumber
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					$("#creditTableBody").html("");
					let tableBody = $("#creditTableBody");

					if (
						objResponse.objResponse.length > 0
					) {
						$.each(objResponse.objResponse, function (intIndex, obj) {
							let row = $("<tr></tr>");
							if (
								obj.strCreditNumber == "null" ||
								obj.strCreditNumber == null
							) {
								obj.strCreditNumber = "-";
							}

							let customCheckbox = $("<div class='custom-control custom-checkbox'></div>")
								.append("<input class='custom-control-input paymentCreditCheckbox' name='credit'" +
									" type='checkbox' id='credit-" + obj.intPkCredit + "' " +
									"data-boolIsCreditMemo='" + obj.boolIsCreditMemo + "' value=" + obj.intPkCredit +
									" data-numOpenBalance='" + obj.numOpenBalance + "'/>")
								.append("<label class='custom-control-label checkbox-label' for='credit-"
									+ obj.intPkCredit + "'></label>");

							let culumnCheckbox = $("<td></td>").append(customCheckbox);

							row.append(culumnCheckbox)
								.append("<td>" + obj.strCreditNumber + "</td>")
								.append("<td>$</td><td class='text-right pr-5 pl-0'>" +
									strCurrencyFormat(obj.numOriginalAmount) + "</td>")
								.append("<td>$</td><td class='text-right pr-5 pl-0'>" +
									strCurrencyFormat(obj.numOpenBalance) + "</td>");

							tableBody.append(row);
						});
					}
					else {
						let row = $("<tr></tr>");
						row.append("<td colspan='5' class='text-center'>There are no records to show.</td>");

						tableBody.append(row);
					}

					$("#creditSection").removeAttr("hidden");
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
	$("#savePaymentBtn").click(function () {
		$("#receivePaymentForm").find("button").click();
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#receivePaymentForm").submit(function (event) {
		event.preventDefault();
		let paymentObj = funCreatePaymentObject();

		$.ajax({
			type: "POST",
			url: "/PrintshopAccount/AddPayment",
			data: paymentObj,
			success: function (jsonResponse) {
				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				if (jsonResponse.intStatus === 200) {
					numAmountInvoices = 0;
					numAmountCredits = 0;
					numAmountReceived = 0;
					numAmountToApply = 0;
					numAmountToCredit = 0;

					$("#receivePaymentForm")[0].reset();
					$("#receivePaymentForm").find("input[name=numAmountReceived]").val(0)

					$("#openInvoicesSection").attr("hidden", true);
					$("#openInvoicesSection").next().attr("hidden", true);
					$("#creditSection").attr("hidden", true);

					$("#receivePaymentForm").find("#intPkAccount").removeAttr("style")

					$("#receivePaymentForm").find("#amount-received-label").html("$ 0.00");
					$("#receivePaymentForm").find("#amountToApplySection").html("$ 0.00");
					$("#receivePaymentForm").find("#amountToCreditSection").html("$ 0.00");

					if (
						jsonResponse.objResponse != null &&
						jsonResponse.objResponse.length > 0
					) {
						let strMessage = "The orders ";
						$.each(jsonResponse.objResponse, function (intIndex, intOrderId) {
							strMessage = strMessage + intOrderId + ", "
						});
						strMessage = (strMessage.substring(0, strMessage.length - 2)) + " have been marked as paid.<br />" +
							"Would you like to send an email to your customer?";

						funShowEmailDialog(strMessage, function () { funSendEmail(0, jsonResponse.objResponse) });
					}
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funCreatePaymentObject() {
		let strDate = $("#receivePaymentForm").find("#paymentDate").val();

		let paymentObj = {
			"intContactId": $("#receivePaymentForm").find("#intContactId").val(),
			"strDate": strDate,
			"intnPkPaymentMethod": $("#receivePaymentForm").find("#intPkPaymentMethod").val(),
			"strReference": $("#receivePaymentForm").find("input[name=strReference]").val(),
			"intnPkAccount": $("#receivePaymentForm").find("#intPkAccount").val(),
			"arrintPkInvoices": [],
			"arrCredits": [],
			"numAmountReceived": $("#receivePaymentForm").find("input[name=numAmountReceived]").val()
		};

		$("#receivePaymentForm").find('.paymentCreditCheckbox input:checked')
		$.each($("#receivePaymentForm").find('.paymentInvoiceCheckbox'), function (intIndex, checkbox) {
			if (
				$(checkbox).is(":checked")
			) {
				paymentObj.arrintPkInvoices.push($(checkbox).val());
			}
		});

		$.each($("#receivePaymentForm").find('.paymentCreditCheckbox'), function (intIndex, checkbox) {
			if (
				$(checkbox).is(":checked")
			) {
				let creditMemoObj = {
					"intPkCredit": $(checkbox).val(),
					"boolIsCreditMemo": $(checkbox).data("booliscreditmemo")
				};

				paymentObj.arrCredits.push(creditMemoObj);
			}
		});

		return paymentObj;
	}

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".paymentCreditCheckbox, .paymentInvoiceCheckbox", function () {
		let numAmount = parseFloat($("#receivePaymentForm").find("#amount-received-label").html().replace("$ ", ""));
		let numOpenBalance = parseFloat($(this).data("numopenbalance"));

		//if (
		//	parseFloat($("#receivePaymentForm").find("input[name=numAmountReceived]").val()) > 0 
		//) {
		//	numAmount = 0;
		//	$("#receivePaymentForm").find("input[name=numAmountReceived]").val("0.00")

		//	$("#receivePaymentForm").find("#amountToApplySection").html("$ 0.00");
		//	$("#receivePaymentForm").find("#amountToCreditSection").html("$ 0.00");
		//}

		if (
			$(this).is(':checked')
		) {
			if (
				$(this).hasClass("paymentInvoiceCheckbox")
			) {
				numAmountInvoices = numAmountInvoices + numOpenBalance;
			}
			else {
				numAmountCredits = numAmountCredits + numOpenBalance;
			}
		}
		else {
			if (
				$(this).hasClass("paymentInvoiceCheckbox")
			) {
				numAmountInvoices = numAmountInvoices - numOpenBalance;
			}
			else {
				numAmountCredits = numAmountCredits - numOpenBalance;
			}
		}

		numAmountToApply = (numAmountCredits + numAmountReceived);
		if (
			numAmountToApply > numAmountInvoices
		) {
			numAmountToApply = numAmountInvoices;
		}

		if (
			numAmountReceived > numAmountInvoices
		) {
			numAmountToCredit = numAmountReceived - numAmountInvoices;
		}
		else {
			numAmountToCredit = 0;
		}

		$("#receivePaymentForm").find("#amountToApplySection").html("$ " + strCurrencyFormat(numAmountToApply));
		$("#receivePaymentForm").find("#amountToCreditSection").html("$ " + strCurrencyFormat(numAmountToCredit));
		$("#receivePaymentForm").find("#amount-received-label").html("$ " + strCurrencyFormat(numAmountReceived));
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("keyup", "input[name=numAmountReceived]", function () {
		numAmountReceived = parseFloat($(this).val());
		if (
			isNaN(numAmountReceived)
		) {
			numAmountReceived = 0;
		}

		numAmountToApply = (numAmountCredits + numAmountReceived);
		if (
			numAmountToApply > numAmountInvoices
		) {
			numAmountToApply = numAmountInvoices;
		}

		if (
			numAmountReceived > numAmountInvoices
		) {
			numAmountToCredit = numAmountReceived - numAmountInvoices;
		}
		else {
			numAmountToCredit = 0;
		}

		$("#receivePaymentForm").find("#amountToApplySection").html("$ " + strCurrencyFormat(numAmountToApply));
		$("#receivePaymentForm").find("#amountToCreditSection").html("$ " + strCurrencyFormat(numAmountToCredit));
		$("#receivePaymentForm").find("#amount-received-label").html("$ " + strCurrencyFormat(numAmountReceived));
	});

	//------------------------------------------------------------------------------------------------------------------
});