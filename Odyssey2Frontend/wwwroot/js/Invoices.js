let arrJobs = null;

//======================================================================================================================
$(document).ready(function () {

	//------------------------------------------------------------------------------------------------------------------
	//														//EVENTS.

	//------------------------------------------------------------------------------------------------------------------
	$(".generateInvoice").click(function () {
		let intnPkInvoice = $(this).data("intnpkinvoice");
		let intOrderId = $(this).data("intorderid");
		let strJobId = $(this).data("jobids")
		let arrintJobsIds = strJobId.toString().split(',');

		if (
			intnPkInvoice == null ||
			intnPkInvoice == ""
		) {
			funGenerateInvoice(intOrderId, arrintJobsIds);
		}
		else {
			//										//Modal (first step).
			$(".btnYesNo").css("display", "block");
			$(".btnOk").css("display", "none");
			$("#confirmation-modal").modal('show');
			$("#myModalBody").html("<span class='font-bold'>If you generate a new invoice, the current invoice will be replaced.</span>" +
				"<br/> Generate anyway?")

			$("#modal-btn-yes").unbind();
			$("#modal-btn-no").unbind();

			//										//Yes (second step).
			$("#modal-btn-yes").bind("click", function () {
				funGenerateInvoice(intOrderId, arrintJobsIds);
				$("#confirmation-modal").modal('hide');
			});

			//										//Abort.
			$("#modal-btn-no").bind("click", function () {
				$("#confirmation-modal").modal('hide');
			});
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".downloadInvoice").click(function () {
		let intnPkInvoice = $(this).data("intnpkinvoice");

		$.ajax({
			type: "GET",
			url: "/Invoice/GetInvoice",
			data: {
				"intPkInvoice": intnPkInvoice
			},
			success: function (objResponse) {
				if (
					typeof objResponse != "object"
				) {
					const linkSource = `data:application/pdf;base64,${objResponse}`;
					const downloadLink = document.createElement("a");
					const fileName = "invoice.pdf";
					downloadLink.href = linkSource;
					downloadLink.download = fileName;
					downloadLink.click();
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus)
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#editInvoiceForm").submit(function (event) {
		event.preventDefault();

		let objInvoice = {
			"intOrderId": $(this).find("input[name=intOrderId]").val(),
			"intnOrderNumber": $(this).find("input[name=intnOrderNumber]").val(),
			"strLogoUrl": $(this).find("input[name=strLogoUrl]").val(),
			"strOrderDate": $(this).find("input[name=strOrderDate]").val(),
			"intPkInvoice": $(this).find("input[name=intPkInvoice]").val(),
			"boolIsShipped": $(this).find("input[name=boolIsShipped]").val(),
			"intnInvoiceNumber": $(this).find("input[name=intnInvoiceNumber]").val(),
			"strOrderDate": $(this).find("input[name=strOrderDate]").val(),
			"intNumberOfJobs": $(this).find("input[name=intNumberOfJobs]").val(),
			"strShippedToFirstName": $(this).find("input[name=strShippedToFirstName]").val(),
			"strShippedToLastName": $(this).find("input[name=strShippedToLastName]").val(),
			"strShippedToLine1": $(this).find("input[name=strShippedToLine1]").val(),
			"strShippedToLine2": $(this).find("input[name=strShippedToLine2]").val(),
			"strShippedToCity": $(this).find("input[name=strShippedToCity]").val(),
			"strShippedToState": $(this).find("input[name=strShippedToState]").val(),
			"strShippedToZip": $(this).find("input[name=strShippedToZip]").val(),
			"strShippedToCountry": $(this).find("input[name=strShippedToCountry]").val(),
			"strBilledTo": $(this).find("textarea[name=strBilledTo]").val(),
			"strPayableTo": $(this).find("textarea[name=strPayableTo]").val(),
			"strTerms": $(this).find("input[name=strTerms]").val(),
			"strShippingMethod": $(this).find("input[name=strShippingMethod]").val(),
			"strPO": $(this).find("input[name=strPO]").val(),
			"strComments": $(this).find("input[name=strComments]").val(),
			"darrinvjobinfojson": [],
			"numTotal": 0
		}

		objInvoice = funGetAllJobConcepts(objInvoice);

		$.ajax({
			type: "POST",
			url: "/Invoice/EditInvoice",
			data: objInvoice,
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					location.href = "/Invoice"
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus)
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#addANewConcept").click(function () {
		let rowElement = $('<tr class="tr-calculation-row jobInfoSection"></tr>').append('<td>-<input ' +
			'class="form-control form-control-sm" name="strJobNumber" val="" type="hidden" data-account="" /></td >')
			.append('<td><input class="input-with-dropdowns form-control" name="strName" required/></td')
			.append('<td><input class="input-with-dropdowns form-control" type="number" min="0" ' +
				'name="intQuantity" required/></td')
			.append('<td><span class="select"><select class="" name="intnPkAccount" required/></select></span></td')
			.append('<td><input class="input-with-dropdowns form-control form-control-sm" type="number" min="0.01" ' +
				'step="0.01" name="numPrice" required/></td')
			.append('<td><input type ="checkbox" class= "chkTaxes ml-3" id = "boolIsExempt" name = "boolIsExempt"' +
				'checked /></td >')
			.append('<td class="text-center"><button class="btn btn-sm btn-danger pull-right deleteConceptRow" type="button"><span ' +
				'class= "fa fa-trash"></span></button></td');

		$("#conceptTableBody tr:last").before(rowElement);
		funGetAllAccountsRevenueAvailable(rowElement);
		$(".table-responsive").animate({ scrollTop: $("table").height() }, 2000);
	});

	$(document).on("click", ".deleteConceptRow", function () {
		$(this).closest("tr").remove();
	});

	//------------------------------------------------------------------------------------------------------------------
	//														//SUPPORT METHODS

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funGenerateInvoice(
		intOrderId,
		arrintJobsIds
	) {
		$.ajax({
			type: "POST",
			url: "/Invoice/GenerateInvoice",
			data: {
				"intOrderId": intOrderId,
				"arrintJobsIds": arrintJobsIds
			},
			success: function (objResponse) {
				if (
					typeof objResponse != "object"
				) {
					//window.open("data:application/pdf;base64, " + objResponse);

					const linkSource = `data:application/pdf;base64,${objResponse}`;
					const downloadLink = document.createElement("a");
					const fileName = "order_" + intOrderId + "_invoice.pdf";
					downloadLink.href = linkSource;
					downloadLink.download = fileName;
					downloadLink.click();

					location.reload();
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

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funGetAllJobConcepts(
		objInvoice
	) {
		let trElements = $(".jobInfoSection");

		$.each(trElements, function (intIndex, element) {
			let intnPkAccount = null;
			let intnPkAccountMov = null;
			let strAccount = null;

			console.info($(element).find("input[name=strJobNumber]").data("account"));
			intnPkAccount = $(element).find("input[name=strJobNumber]").data("account").split("|")[0];
			intnPkAccountMov = $(element).find("input[name=strJobNumber]").data("account").split("|")[1];
			strAccount = $(element).find("input[name=strJobNumber]").data("account").split("|")[2];

			let objJobConcept = {
				"strJobNumber": $(element).find("input[name=strJobNumber]").val(),
				"intnJobId": $(element).find("input[name=intnJobId]").val(),
				"strName": $(element).find("input[name=strName]").val(),
				"intQuantity": $(element).find("input[name=intQuantity]").val(),
				"numPrice": $(element).find("input[name=numPrice]").val(),
				"intnPkAccount": intnPkAccount,
				"intnPkAccountMov": intnPkAccountMov,
				"strAccount": strAccount,
				"boolIsExempt": !($(element).find("input[name=boolIsExempt]").is(":checked"))
			}

			if (
				objJobConcept.intnPkAccount == undefined ||
				objJobConcept.intnPkAccount == "" ||
				objJobConcept.intnPkAccount == null
			) {
				objJobConcept.intnPkAccount = $(element).find("select[name=intnPkAccount]").val();
			}

			objInvoice.darrinvjobinfojson.push(objJobConcept);
			objInvoice.numTotal = objInvoice.numTotal + objJobConcept.numPrice;

		});

		objInvoice.darrinvjobinfojson = objInvoice.darrinvjobinfojson.filter(function (object) {
			return object != null;
		});

		return objInvoice;
	}

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function funGetAllAccountsRevenueAvailable(
		rowElement
	) {
		$.ajax({
			type: "GET",
			url: "/Invoice/GetAllAccountsRevenueAvailable",
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					let selectElement = rowElement.find("select");

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
});