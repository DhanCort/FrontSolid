$(document).ready(function () {
	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnStatement", function (e) {
		$.ajax({
			type: "POST",
			url: "/PrintshopStatement/Index",
			//data: { "strNumber": strNumber, "strName": strName, "intPkType": intPkType },
			success: function (htmlResponse) {
				subShowModal("Create Statement", htmlResponse, "modal-md", "", true, false);

				$('#strStatementStartDate').datetimepicker({
					format: "YYYY-MM-DD"
				});

				$('#strStatementEndDate').datetimepicker({
					format: "YYYY-MM-DD"
				});
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", "#strBalanceStatus", function (e) {
		let strBalanceStatus = $(this).val()

		if (strBalanceStatus != "") {
			$.ajax({
				type: "POST",
				url: "/PrintshopStatement/GetCustomersBalances",
				data: { "strBalanceStatus": strBalanceStatus },
				success: function (jsonResponse) {
					if (jsonResponse.intStatus == 200) {
						$("#customersBalancesBody").html("");
						let tableBody = $("#customersBalancesBody");
						$.each(jsonResponse.objResponse, function (intIndex, obj) {
							//alert(obj.strFullName);
							let row = $("<tr class='tr-calculation-row'></tr>");
							row.append("<td>" + obj.strFullName + "</td>")
								.append("<td>$</td><td class='text-right'>" + strCurrencyFormat(obj.numBalance) + "</td>")
								.append('<td class="text-center"><button class="btn btn-info btn-sm print-statement" data-intContactId="'
									+ obj.intContactId + '" data-strFullName="' + obj.strFullName +
									'" type="button""><i class="fa fa-print" aria-hidden="true"></i> Print</button></td>');

							tableBody.append(row);
						})
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
			$("#customersBalancesBody").html("");
        }
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".print-statement", function () {
		let intContactId = $(this).data("intcontactid");
		let strFullName = $(this).data("strfullname");
		let strStatementStartDate = $('#strStatementStartDate').val();
		let strStatementEndDate = $('#strStatementEndDate').val();
		let strStatementType = $('#strStatementType').val();
		debugger
		$.ajax({
			type: "GET",
			url: "/PrintshopStatement/GetStatement",
			data: {
				"strType": strStatementType,
				"strStartDate": strStatementStartDate,
				"strEndDate": strStatementEndDate,
				"intContactId": intContactId
			},
			success: function (objResponse) {
				if (
					typeof objResponse != "object"
				) {
					const linkSource = `data:application/pdf;base64,${objResponse}`;
					const downloadLink = document.createElement("a");
					const fileName = strStatementType + "_statement_" + strFullName + ".pdf";
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