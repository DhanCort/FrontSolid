let boolIsFirstTime = true;
let boolIsFirstTimePicker = true;
let addEstimationobject = null;
let boolIsSaveable = true;
let intPkProduct = null;
let arrCustomers = [];
let darrproducts;

$(document).ready(function () {
	//------------------------------------------------------------------------------------------------------------------
	//$(document).ready(function () {
	//    $('#strBaseDateTimeDefault').datetimepicker({
	//        format: "YYYY-MM-DD HH:mm"
	//    });
	//});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".getOptions", function () {
		let intJobId = $(this).attr("data-intJobId");
		let intPkWorkflow = $(this).attr("data-intPkWorkflow");
		let strBaseDate = $(this).attr("data-base").split("|")[0];
		let strBaseTime = $(this).attr("data-base").split("|")[1];
		let intEstimationId = $(this).attr("data-intEstimationId");

		subGetOptions(intJobId, intPkWorkflow, null, true, strBaseDate, strBaseTime, intEstimationId);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".openEstimation").on("click", function () {
		let intnPkEstimation = $(this).attr("data-intnPkEstimation") == "" ? null : $(this).attr("data-intnPkEstimation");
		let data_estimate = $(this).attr("data-estimate").split("|");
		let data_base = $(this).attr("data-Base").split("|");
		let estimateBody = $(this).parent().parent().next().find(".card-body");
		let boolIsConfirmed = $(this).data("boolisconfirmed");
		let intnCopyNumber = $(this).data("intncopynumber");

		estimateBody.html("");

		if (
			!estimateBody.parent().hasClass("show")
		) {
			getEstimate(
				data_estimate[0],
				data_estimate[1],
				intnPkEstimation,
				null,
				null,
				estimateBody,
				boolIsConfirmed,
				intnCopyNumber,
			);

			$('#addCalculationModalByResource, #costModal, #timeModal').unbind();
			$('#addCalculationModalByResource, #costModal, #timeModal').bind('hidden.bs.modal', function () {
				$.when(
					subDeleteTemporalPaperTransformation()
				).then(function () {
					//										//Hide the calculation form and table.
					$("#addCalculationModalByResource").find("#byResourcePartialView")
						.find("#ProcessPerQuantityResource").removeClass("show");

					//										//Get the estimation again.
					getEstimate(data_estimate[0], data_estimate[1], intnPkEstimation, null, null, estimateBody,
						boolIsConfirmed, intnCopyNumber);

					//										//Get estimation Ids.
					subGetEstimationIds(data_estimate[0], data_estimate[1]);
				});
			});
		}
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function subGetEstimationIds(
		intJobId,
		intPkWorkflow
	) {
		$.ajax({
			type: "POST",
			url: "/Estimate/GetEstimationIds",
			data: {
				"intJobId": intJobId,
				"intPkWorkflow": intPkWorkflow
			},
			success: function (objRespose) {
				if (
					objRespose.intStatus == 200
				) {
					$.each(objRespose.objResponse.arrest, function (intIndex, objEstimate) {
						$("#qty-" + (objEstimate.intEstimationId + (objEstimate.intnCopyNumber ?? 0)))
							.html("<strong>Quantity:</strong> " + objEstimate.intQuantity);
						$("#price-" + (objEstimate.intEstimationId + (objEstimate.intnCopyNumber ?? 0)))
							.html("<strong>Price:</strong> $" + strCurrencyFormat(objEstimate.numPrice));
					});
				}
			}
		});
	}

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change.datetimepicker", "#strBaseDateTime", function () {
		if (!boolIsFirstTimePicker) {
			boolIsSaveable = false;
			$("#mi4pMasterModalSave").attr("disabled", "disabled");
			$(".optionsData").attr("hidden", "hidden")
		}
		boolIsFirstTimePicker = false;
		//console.info($(this).parent().find(".sendOptionBaseDateTime"))
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".customCheckOption", function () {
		let arrCheckBox = $(".customCheckOption:checked");

		if (arrCheckBox.length > 0 && boolIsSaveable) {
			$("#mi4pMasterModalSave").removeAttr("disabled");
		}
		else {
			$("#mi4pMasterModalSave").attr("disabled", "disabled");
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".selectgetResForIoGr", function () {
		if (!boolIsFirstTime) {
			subCreateObjectAndGetOptions($(this));
		}
		boolIsFirstTime = false;
		boolIsFirstTimePicker = true;
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".getResForIoGr", function () {
		let arrgetresforiogr = $(this).attr("data-to-getresforiogr").split("|");
		let optionSelected = arrgetresforiogr[0];
		let element = $(this);

		$.ajax({
			type: "GET",
			url: "/Estimate/GetResourcesFromIoGroup",
			data: {
				"intJobId": arrgetresforiogr[1],
				"intPkProcessInWorkflow": arrgetresforiogr[2],
				"intPkEleetOrEleele": arrgetresforiogr[3],
				"boolIsEleet": arrgetresforiogr[4]
			},
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {
					let arrResources = objResponse.objResponse;
					let select = element.parent().prev().find(".selectgetResForIoGr");
					select.html("");
					//console.info(select);
					option = document.createElement("option");
					option.value = "none";
					option.text = "-";
					select.append(new Option(option.text, option.value));

					for (var i = 0; i < arrResources.length; i++) {
						var obj = arrResources[i];
						option = document.createElement("option");
						option.value = obj.intPk;
						option.text = obj.strName;
						select.append(new Option(option.text, option.value));
					}

					boolIsFirstTime = true;
					select.val(optionSelected).change();
					select.parent().removeAttr("hidden");
					select.parent().prev().attr("hidden", "hidden");

					element.attr("hidden", "hidden");
					element.next().removeAttr("hidden");
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			},
			error: function (objRespose) {
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".cancelResForIoGr", function () {
		$(this).parent().prev().find(".select").attr("hidden", "hidden");
		$(this).parent().prev().find("span:not(.select)").removeAttr("hidden");

		$(this).attr("hidden", "hidden");
		$(this).prev().removeAttr("hidden");
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".fromEstimate", function () {
		let intJobId = $(this).attr("data-intJobId").split("|")[0];
		let strBaseDate = $("#strBaseDateTime").val().split(" ")[0];
		let strBaseTime = $("#strBaseDateTime").val().split(" ")[1];

		subCreateEstimateReportObject(intJobId, strBaseDate, strBaseTime);

		subAddEstimation(JSON.stringify(addEstimationobject));
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".confirmEstimation", function () {
		let intJobId = $(this).attr("data-intJobId");
		let intEstimationId = $(this).attr("data-intEstimationId");

		let confirmResourceObject = subCreateConfirmationObject(intJobId, intEstimationId, null);

		funConfirmEstimate(confirmResourceObject, intJobId, intEstimationId);
	});

	//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	function funConfirmEstimate(
		confirmResourceObject,
		intJobId,
		intEstimationId
	) {
		$.ajax({
			type: "POST",
			url: "/Estimate/ConfirmResources",
			data: {
				"confirmResources": JSON.stringify(confirmResourceObject),
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					if (
						objResponse.objResponse
					) {
						subSendNotification(objResponse.strUserMessage, objResponse.intStatus);

						setTimeout(function () {
							location.reload();
						}, 2000);
					}
					else {
						let strPasswordInput = "<input type='password' placeholder='Special Password' " +
							"class='input-with-dropdowns form-control mt-2' id ='strConfirmPassword' />";

						$(".btnYesNo").css("display", "block");
						$(".btnOk").css("display", "none");
						$("#confirmation-modal").modal('show');
						$("#myModalBody").html(
							"<span class='font-bold'>" + objResponse.strUserMessage +
							"<br />" + strPasswordInput
						);

						$("#modal-btn-yes").unbind();
						$("#modal-btn-no").unbind();
						$("#modal-btn-yes").bind("click", function () {
							let strPassword = $("#strConfirmPassword").val();
							let confirmResourceObject = subCreateConfirmationObject(intJobId, intEstimationId,
								strPassword);
							funConfirmEstimate(confirmResourceObject, intJobId, intEstimationId);
							$("#confirmation-modal").modal('hide');
						});
						$("#modal-btn-no").bind("click", function () {
							$("#confirmation-modal").modal('hide');
						});
					}
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			},
			error: function (objRespose) {
				subSendNotification("Something is wrong.", 400);
			}
		});
	}

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".sendBaseDateTime", function () {
		let estimateBody = $(this).parent().parent().parent().parent().parent().parent().parent();

		let intnPkEstimation = $(this).attr("data-estimate").split("|")[0];
		let intJobId = $(this).attr("data-estimate").split("|")[1];
		let intPkWorkflow = $(this).attr("data-estimate").split("|")[2];
		let boolConfirmed = $(this).attr("data-estimate").split("|")[3];
		let intnCopyNumber = $(this).attr("data-estimate").split("|")[4];
		let strBaseDate = $("#strBaseDateTimeDefault").val().split(" ")[0];
		let strBaseTime = $("#strBaseDateTimeDefault").val().split(" ")[1];
		debugger
		getEstimate(intJobId, intPkWorkflow, intnPkEstimation, strBaseDate, strBaseTime + ":00", estimateBody,
			boolConfirmed, intnCopyNumber);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".sendOptionBaseDateTime", function () {
		subCreateObjectAndGetOptions($(this));
		boolIsFirstTime = true;
		boolIsFirstTimePicker = true;
		boolIsSaveable = true;
		$(".optionsData").removeAttr("hidden")
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".btn-edit-estimate-name").click(function () {
		let btnEditElement = $(this);

		btnEditElement.attr("hidden", true);
		btnEditElement.prev().prev().attr("hidden", true);
		btnEditElement.prev().prev().prev().attr("hidden", true);
		btnEditElement.prev().prev().prev().prev().attr("hidden", true);
		btnEditElement.next().attr("hidden", true);
		btnEditElement.prev().removeAttr("hidden");
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".cancelEditEstimateName").click(function () {
		subCloseEditEstimationName($(this));
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".saveNewEstimateName").submit(function (event) {
		event.preventDefault();
		let formElement = $(this);
		let btnSubmitElement = $(this).find("button[type=submit]");

		$.ajax({
			type: "POST",
			url: "/Estimate/RenameEstimation",
			data: formElement.serialize(),
			success: function (objRespose) {
				if (objRespose.intStatus == 200) {
					btnSubmitElement.parent().parent().parent().prev().html(formElement.find("input[name=strName]").val());
					btnSubmitElement.parent().prev().data("strname", formElement.find("input[name=strName]").val());

					subCloseEditEstimationName(btnSubmitElement);
				}

				subSendNotification(objRespose.strUserMessage, objRespose.intStatus);
			},
			error: function () {
				subSendNotification("Something wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".resource-info-toast", function () {
		let intPkResource = $(this).data("id");

		if ($('#toast-' + intPkResource).hasClass("hide")) {
			$('.toast').removeClass('show');
			$('.toast').addClass('hide');
			$('#toast-' + intPkResource).removeClass('hide');
			$('#toast-' + intPkResource).addClass('show');
		} else {
			$('#toast-' + intPkResource).removeClass('show');
			$('#toast-' + intPkResource).addClass('hide');
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".close-resource-info-toast", function () {
		let toastElement = $(this).parent().parent().parent();

		toastElement.toast('hide');
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#copy-estimate").click(function () {
		let intJobId = $(this).data("intjobid");
		let intPkWorkflow = $(this).data("intpkworkflow");
		let intEstimateId = $(this).data("intestimateid");

		$.ajax({
			type: "POST",
			url: "/Estimate/CopyConfirmedEstimate",
			data: {
				"intJobId": intJobId,
				"intPkWorkflow": intPkWorkflow
			},
			success: function (objRespose) {
				if (objRespose.intStatus == 200) {
					location.reload();
				}

				subSendNotification(objRespose.strUserMessage, objRespose.intStatus);
			},
			error: function (objRespose) {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".editEstimateQuantity", function (event) {
		event.preventDefault();

		//													//Hide Quantity Label.
		$(this).prev().prop("hidden", true);
		//													//Hide edit link.
		$(this).prop("hidden", true);
		//													//Show Quantity form.
		$(this).next().prop("hidden", false);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".cancelEditEstimateQuantity", function (event) {
		let formElement = $(this).closest("form");

		//													//Hide form.
		formElement.prop("hidden", true);
		//													//Show edit link.
		formElement.prev().prop("hidden", false);
		//													//Show Quantity form.
		formElement.prev().prev().prop("hidden", false);
		//													//Reset the form.
		//formElement[0].reset();
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("submit", ".estimateQuantityForm", function (event) {
		event.preventDefault();
		let intJobId = $(this).find("input[name=intJobId]").val();
		let intPkWorkflow = $(this).find("input[name=intPkWorkflow]").val();
		let intnEstimationId = $(this).find("input[name=intEstimateId]").val();
		let intCopyNumber = $(this).find("input[name=intCopyNumber]").val();
		let estimateBody = $(this).closest(".card-body");

		$.ajax({
			type: "POST",
			url: "/Estimate/SetQuantityForEstimate",
			data: $(this).serialize(),
			success: function (objRespose) {
				if (objRespose.intStatus == 200) {
					getEstimate(
						intJobId,
						intPkWorkflow,
						intnEstimationId,
						null,
						null,
						estimateBody,
						true,
						intCopyNumber
					);

					subGetEstimationIds(intJobId, intPkWorkflow)
				}
				else {
					subSendNotification(objRespose.strUserMessage, objRespose.intStatus);
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		})
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#estimateSummaryButton").click(function () {
		let intJobId = $(this).data("intjobid");
		let intPkWorkflow = $(this).data("intpkworkflow");
		//let boolSendEmail = fun

		$.ajax({
			post: "GET",
			url: "/Estimate/GetEstimationsDetails",
			data: {
				"intJobId": intJobId,
				"intPkWorkflow": intPkWorkflow,
				"boolSendEmail ": boolSendEmail
			},
			beforeSend: function () {
				let strLoaderSection = '<div class="col-sm-12 text-center"><span style="color: #d1d2d4;">' +
					'<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></span ></div>';
				subShowModal("Estimates Summary", strLoaderSection, "", "autoHeight", true, false, null);
				$("#mi4pMasterModalSave").prop("disabled", false);
			},
			success: function (objResponse) {
				if (
					typeof objResponse != 'object'
				) {
					subShowModal("Estimates Summary", objResponse, "", "autoHeight", true, true, null,
						"Update Estimate");

					$("#mi4pMasterModalSave").bind("click", function () {
						funShowEmailDialog("Updated estimate information has been saved. <br />" +
							"Would you like to send this estimate to your customer for approval?",
							function () { funSendEstimations(intJobId, intPkWorkflow) });
						//funSendEstimations(intJobId, intPkWorkflow);
					});
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
	$("#sendEstimationBtn").click(function () {
		let intPkWorkflow = $(this).data("intpkworkflow");
		let intJobId = $(this).data("intjobid");

		let funSendJobPrice = function () {
			$.ajax({
				post: "GET",
				url: "/Estimate/SendJobPrice",
				data: {
					"intJobId": intJobId,
					"intPkWorkflow": intPkWorkflow,
					"boolSendEmail": boolSendEmail
				},
				success: function (objResponse) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					boolSendEmail = false;
				},
				error: function () {
					subSendNotification("Something is wrong.", 400);
					boolSendEmail = false;
				}
			});
		};

		funShowEmailDialog("Updated estimate information has been saved. <br />" +
			"Would you like to send this estimate to your customer for approval?", funSendJobPrice)
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#btnAddNewEstimate").click(function () {
		$("#modalNewEstimate").find("#newEstimateForm")[0].reset();
		$("#modalNewEstimate").modal("show");
		let selectCustomer = $("#modalNewEstimate").find("#customerNameSearchInput").next();
		let selectCompany = $("#modalNewEstimate").find("#selectCompany");
		$("#modalNewEstimate").find("#selectBranch").html("");

		subGetAllCostumers(selectCustomer)
		subGetPrintshopCompanies(selectCompany);
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#selectCompany").change(function () {
		let selectCustomer = $("#modalNewEstimate").find("#customerNameSearchInput").next();
		let selectBranch = $("#modalNewEstimate").find("#selectBranch");

		let intCompanyId = $(this).val();

		if (intCompanyId != "null" && intCompanyId != '') {
			subGetPrintshopCompanyBranches(intCompanyId, selectBranch);
			subGetCompanyBranchContacts(intCompanyId, null, selectCustomer, "Pick one", false);
		}
		else {
			$("#selectBranch").html();
			subGetAllCostumers(selectCustomer);
		}

		//													//Clean inputs for contactid and filter.
		$("#newEstimateForm").find("input[name=intContactId]").val("");
		$("#customerNameSearchInput").val("");
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#selectBranch").change(function () {
		let selectCustomer = $("#modalNewEstimate").find("#customerNameSearchInput").next();

		let intCompanyId = $("#modalNewEstimate").find("#selectCompany").val();
		let intBranchId = $(this).val();

		if (
			intBranchId != "null" && intBranchId != ''
		) {
			subGetCompanyBranchContacts(intCompanyId, intBranchId, selectCustomer, "Pick one", false);
		}
		else if (
			intCompanyId != "null" && intCompanyId != ''
		) {
			subGetCompanyBranchContacts(intCompanyId, null, selectCustomer, "Pick one", false);
		}
		else {
			subGetAllCostumers(selectCustomer)
		}

		//													//Clean inputs for contactid and filter.
		$("#newEstimateForm").find("input[name=intContactId]").val("");
		$("#customerNameSearchInput").val("");
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#newEstimateForm").submit(function (event) {
		event.preventDefault();
		let objData = $(this).serialize();

		$.ajax({
			type: "POST",
			url: "/Estimate/CreateNewEstimate",
			data: objData,
			success: function (objResponse) {
				boolSendEmail = false;

				if (
					objResponse.intStatus == 200
				) {
					window.location = "/Estimate/GetWorkflow?intJobId=" + objResponse.objResponse;
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			},
			error: function () {
				boolSendEmail = false;
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".wkflwEstimateResource-dropdown").change(function () {
		let objResourceData = $(this).closest("form").serialize();

		$.ajax({
			type: "POST",
			url: "/Estimate/SetResourceEstimate",
			data: objResourceData,
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					disableElements();
					location.reload();
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
	$(document).on("click", ".btn-convert-estimate", function () {
		let intJobId = $(this).attr("data-intjobid");
		let intnCopyNumber = $(this).attr("data-intncopynumber");
		let intPkWorkflow = $(this).attr("data-intpkworkflow");
		let intEstimateId = $(this).attr("data-intestimateid");
		let boolIsFromJob = JSON.parse($(this).attr("data-boolisfromjob").toLowerCase());

		let strUrl = "/Estimate/EstimateToOrder";
		if (
			boolIsFromJob
		) {
			strUrl = "/Estimate/SetJobAsPending"
		}

		$.ajax({
			type: "POST",
			url: strUrl,
			data: {
				"intJobId": intJobId,
				"intnCopyNumber": intnCopyNumber,
				"intPkWorkflow": intPkWorkflow,
				"intEstimationId": intEstimateId
			},
			success: function (objResponse) {
				boolSendEmail = false;
				if (
					objResponse.intStatus == 200
				) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);

					setTimeout(function () {
						location.href = "/Jobs?boolnPending=True"
					}, 2000);
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			},
			error: function () {
				boolSendEmail = false;
				subSendNotification("Something wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#btnDeclineEstimate", function () {
		let intJobId = $(this).attr("data-intjobid");

		$.ajax({
			type: "POST",
			url: "/Estimate/EstimateToRejected",
			data: {
				"intJobId": intJobId,
				"boolSendEmail": boolSendEmail
			},
			success: function (objResponse) {
				boolSendEmail = false;
				if (
					objResponse.intStatus == 200
				) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);

					setTimeout(function () {
						location.href = "/Estimate?boolRejected=True"
					}, 2000);
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			},
			error: function () {
				boolSendEmail = false;
				subSendNotification("Something wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#customerNameSearchInput").focusin(function () {
		let intWidth = $(this).width() + 20;
		let cutomersList = $(this).next();

		//													//Show and adjust the filter div.
		cutomersList.css("display", "block");
		cutomersList.css("max-width", intWidth);
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#customerNameSearchInput").focusout(function () {
		let cutomersList = $(this).next();

		//													//Hide the filter div.
		setTimeout(function () {
			cutomersList.css("display", "none");
		}, 200);
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#customerNameSearchInput").keyup(function () {
		let strCustomerSearch = $(this).val().toLowerCase();

		$(this).next().html("");
		let arrCustomersFiltered = arrCustomers;
		if (strCustomerSearch.length > 0) {
			//												//Find all the cases that the user's search match with 
			//												//		some name in the array.
			arrCustomersFiltered = arrCustomers.filter(c =>
				((c.strFirstName + " " + c.strLastName).toLowerCase()).includes(strCustomerSearch));

			if (
				//											//If the filter does'nt have found any result, then seek 
				//											//	matches with the property "strContactInfo".
				arrCustomersFiltered.length == 0
			) {
				arrCustomersFiltered = arrCustomers.filter(c =>
					c.strContactInfo.toLowerCase().includes(strCustomerSearch));
			}
		}

		$("#newEstimateForm").find("input[name=intContactId]").val("");
		if (
			//												//If the results of the search, only have a unique row,
			//												//		then the contactid is assigned in the hidden input.
			arrCustomersFiltered.length == 1
		) {
			$("#newEstimateForm").find("input[name=intContactId]").val(arrCustomersFiltered[0].intContactId);
		}

		//													//Fill the filter div with all the results.
		for (var i = 0; i < arrCustomersFiltered.length; i++) {
			var obj = arrCustomersFiltered[i];

			let strCustomerName = obj.strFirstName + ' ' + obj.strLastName;
			if (obj.strFirstName == undefined && obj.strLastName == undefined) {
				strCustomerName = obj.strContactInfo;
			}

			let strDivElement = '<div class="customerOptionFilter" style="color: #58585b; border-radius:0px;"' +
				' data-intContactId="' + obj.intContactId + '">' + strCustomerName + '</div>';

			$(this).next().append(strDivElement);
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".customerOptionFilter", function () {
		let intContactId = $(this).data("intcontactid");
		let strCustomerName = $(this).text();

		//													//Assign the values of the selected option in the filter div.
		$("#newEstimateForm").find("input[name=intContactId]").val(intContactId);
		$("#newEstimateForm").find("#customerNameSearchInput").val(strCustomerName);
	});

	//------------------------------------------------------------------------------------------------------------------
});

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function funSendEstimations(
	intJobId_I,
	intPkWorkflow_I
) {
	let numPriceOne = $("#EstimatePrice-1").val();
	let numPriceTwo = $("#EstimatePrice-2").val();
	let numPriceThree = $("#EstimatePrice-3").val();

	$.ajax({
		type: "POST",
		url: "/Estimate/SendEstimatesPrices",
		data: {
			"intJobId": intJobId_I,
			"intPkWorkflow": intPkWorkflow_I,
			"numPriceOne": numPriceOne,
			"numPriceTwo": numPriceTwo,
			"numPriceThree": numPriceThree,
			"boolSendEmail": boolSendEmail
		},
		success: function (objResponse) {
			subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			boolSendEmail = false;
		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
			boolSendEmail = false;
		}
	})
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subAddEstimation(
	estimation_I
) {
	$.ajax({
		type: "POST",
		url: "/Estimate/AddEstimation",
		data: {
			"estimationAdd": estimation_I
		},
		success: function (objRespose) {
			if (objRespose.intStatus == 200) {
				subSendNotification(objRespose.strUserMessage, objRespose.intStatus);
			}
			else {
				subSendNotification(objRespose.strUserMessage, objRespose.intStatus);
			}
		},
		error: function (objRespose) {
			subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subCloseEditEstimationName(btnElement) {
	let formElement = btnElement.parent().parent().parent();
	let inputElement = btnElement.parent().prev();

	//                                                  //Show and hide elements.
	formElement.attr("hidden", true);
	formElement.next().removeAttr("hidden");
	formElement.next().next().removeAttr("hidden");
	formElement.prev().removeAttr("hidden");
	formElement.prev().prev().removeAttr("hidden");
	formElement.prev().prev().prev().removeAttr("hidden");

	//                                                  //Restore the original value.
	inputElement.val(inputElement.data("strname"));
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function getEstimate(
	intJobId,
	intPkWorkflow,
	intnPkEstimation,
	strBaseDate,
	strBaseTime,
	estimateBody,
	boolIsConfirmed,
	intnCopyNumber
) {
	let lastEstimateContent = estimateBody.children().clone();

	$.ajax({
		type: "GET",
		url: "/Estimate/GetBudgetEstimation",
		data: {
			"intJobId": intJobId,
			"intPkWorkflow": intPkWorkflow,
			"intnPkEstimation": intnPkEstimation,
			"strBaseDate": strBaseDate,
			"strBaseTime": strBaseTime,
			"intnCopyNumber": intnCopyNumber,
			"boolIsConfirmed": boolIsConfirmed,
			"boolIsFromJob": $("#boolIsFromJob").val()
		},
		beforeSend: function () {
			estimateBody.html('<div class="col-sm-12 text-center"><span style="color: #d1d2d4;"><i class="fa fa-spinner fa-pulse fa-3x ' +
				'fa-fw"></i></span ></div>');
		},
		success: function (htmlRespose) {

			if (typeof htmlRespose === "object") {
				estimateBody.html(lastEstimateContent);
				subSendNotification(htmlRespose.strUserMessage, htmlRespose.intStatus);
			}
			else {
				estimateBody.html(htmlRespose)
				$('.strBaseDateTimeDefault').datetimepicker({
					format: "YYYY-MM-DD HH:mm"
				});
				estimateBody.parent().prev().find(".openEstimation").removeAttr("data-base");
				estimateBody.parent().prev().find(".openEstimation").attr("data-base", strBaseDate + "|" + strBaseTime);

				let boolReadOnly = $("#boolReadOnly").val().toLowerCase();
				if (
					boolReadOnly != null && boolReadOnly != undefined && JSON.parse(boolReadOnly)
				) {
					$("button").prop("disabled", true);
				}
			}
		},
		error: function (objRespose) {
			estimateBody.html(lastEstimateContent);
			subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subGetOptions(intJobId, intPkWorkflow, arrresSelected, boolShowModal, strBaseDate, strBaseTime,
	intEstimationId) {

	console.info(JSON.stringify(arrresSelected))

	$.ajax({
		type: "POST",
		url: "/Estimate/GetOptions",
		data: {
			"intJobId": intJobId,
			"intPkWorkflow": intPkWorkflow,
			"strBaseDate": strBaseDate,
			"strBaseTime": strBaseTime,
			"arrresSelected": arrresSelected,
			"intId": intEstimationId
		},
		beforeSend: function () {
			subShowModal("Options", '<div class="col-sm-12 text-center"><span style="color: #d1d2d4;"><i class="fa ' +
				'fa-spinner fa-pulse fa-3x fa-fw"></i></span ></div>', "modal-md", "", boolShowModal, true);
		},
		success: function (objRespose) {
			if (typeof objRespose === "object") {
				subSendNotification(objRespose.strUserMessage, objRespose.intStatus);
			}
			else {
				if (arrresSelected != null) {
					if (arrresSelected.find(element => element.intnPk == null) == null) {
						$("#mi4pMasterModalSave").attr("data-intJobId", intJobId + "|" + strBaseDate + "|" + strBaseTime);
						$("#mi4pMasterModalSave").removeAttr("disabled");
					}
					else {
						$("#mi4pMasterModalSave").attr("data-intJobId", intJobId + "|" + strBaseDate + "|" + strBaseTime);
						$("#mi4pMasterModalSave").attr("disabled", "disabled");
					}
					$("#mi4pMasterModalSave").addClass("fromEstimate");
				}
				else {
					$("#mi4pMasterModalSave").addClass("fromEstimate");
					$("#mi4pMasterModalSave").attr("data-intJobId", intJobId + "|" + strBaseDate + "|" + strBaseTime);
				}
				subShowModal("Options", objRespose, "modal-md", "", boolShowModal, true);
				$('#strBaseDateTime').datetimepicker({
					format: "YYYY-MM-DD HH:mm"
				});
				boolReloadSite = true;
			}
		},
		error: function (objRespose) {
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subCreateEstimateReportObject(intJobId, strBaseDate, strBaseTime) {
	let arrCheckBox = $(".customCheckOption:checked");
	let arrestim = new Array();

	if (arrCheckBox.length > 0) {
		arrCheckBox.each(function (index, value) {
			let arrres = new Array();
			//console.info(value)
			let intOptionId = $(this).attr("data-intOptionId");
			let jobdata = $(this).attr("data-jobdata").split("|");
			let resourceElement = $(this).parent().parent().parent().next().nextAll(".resEstimateOption_" + intOptionId);

			resourceElement.each(function (index, value) {
				let data_res_est = $(this).attr("data-res-est").split("|");
				let obj = {
					"intPkProcessInWorkflow": parseInt(data_res_est[0]),
					"intPkEleetOrEleele": parseInt(data_res_est[1]),
					"boolIsEleet": JSON.parse(data_res_est[2].toLowerCase()),
					"intPkResource": parseInt(data_res_est[3])
				}

				arrres.push(obj);
			});

			let arrioFixed = $(".io");
			arrioFixed.each(function (index, value) {
				if ($(this).find("span").attr("data-intnpk") != "") {
					let intnPk = $(this).find("span").attr("data-intnpk");
					let data_arrresSelected = $(this).attr("data-arrresSelected").split("|");

					let obj = {
						"intPkProcessInWorkflow": parseInt(data_arrresSelected[0]),
						"intPkEleetOrEleele": parseInt(data_arrresSelected[1]),
						"boolIsEleet": JSON.parse(data_arrresSelected[2].toLowerCase()),
						"intPkResource": parseInt(intnPk)
					}

					arrres.push(obj);
				}
			});

			arrestim.push(arrres)
		})
	}
	else {
		let arrioFixed = $(".io");
		let arrres = new Array();
		arrioFixed.each(function (index, value) {
			if ($(this).find("span").attr("data-intnpk") != "") {
				let intnPk = $(this).find("span").attr("data-intnpk");
				let data_arrresSelected = $(this).attr("data-arrresSelected").split("|");

				let obj = {
					"intPkProcessInWorkflow": parseInt(data_arrresSelected[0]),
					"intPkEleetOrEleele": parseInt(data_arrresSelected[1]),
					"boolIsEleet": JSON.parse(data_arrresSelected[2].toLowerCase()),
					"intPkResource": parseInt(intnPk)
				}

				arrres.push(obj);
			}
		});

		arrestim.push(arrres)
	}

	addEstimationobject = {
		"intJobId": parseInt(intJobId),
		"strBaseDate": strBaseDate,
		"strBaseTime": strBaseTime + ":00",
		"arrestim": arrestim
	}

	//console.info(addEstimationobject)
	//$("#mi4pMasterModalSave").addClass("fromEstimate");
	//$("#mi4pMasterModalSave").removeAttr("disabled");
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subCreateConfirmationObject(intJobId, intEstimationId, strPassword) {
	let arrpro = new Array();

	$(".divPkProcessInworkflow").each(function (index, value) {
		let intPkProcessInworkflow = $(this).attr("data-intPkProcessInworkflow")
		let arrres = new Array();
		$(".divResource_" + intPkProcessInworkflow).each(function (index, value) {
			let data_resource = $(this).attr("data-resource").split("|");

			if (data_resource[3] == "True") {
				let obj = {
					"intPkEleetOrEleele": parseInt(data_resource[0]),
					"boolIsEleet": JSON.parse(data_resource[1].toLowerCase()),
					"intPkResource": parseInt(data_resource[2])
				}

				arrres.push(obj)
			}
		});

		let obj = {
			"intPkProcessInWorkflow": parseInt(intPkProcessInworkflow),
			"arrres": arrres
		};

		arrpro.push(obj);
	});

	let confirmResourceObject = {
		"intJobId": parseInt(intJobId),
		"intEstimationId": parseInt(intEstimationId),
		"arrpro": arrpro,
		"strPassword": strPassword
	};

	return confirmResourceObject;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subCreateObjectAndGetOptions(element) {
	let arrresSelected = new Array();

	$(".io").each(function (index, value) {
		let intnPk = $(this).find("select").val();

		if (intnPk == null) {
			intnPk = $(this).find("span").attr("data-intnpk") == "" ? null :
				$(this).find("span").attr("data-intnpk");
		}

		if ($(this).find("select").val() == "none") {
			intnPk = null;
		}

		let io = $(this).attr("data-arrresSelected").split("|");
		let obj = {
			"intPkProcessInWorkflow": io[0],
			"intPkEleetOrEleele": io[1],
			"boolIsEleet": io[2],
			"intnPk": intnPk //== "" ? null : intnPk
		}

		arrresSelected.push(obj);
	});

	let strBaseDate = $("#strBaseDateTime").val().split(" ")[0] == "" ? null : $("#strBaseDateTime").val().split(" ")[0];
	let strBaseTime = $("#strBaseDateTime").val().split(" ")[1] == "" ? null : $("#strBaseDateTime").val().split(" ")[1];

	subGetOptions(element.attr("data-jobdata").split("|")[0], element.attr("data-jobdata").split("|")[1],
		arrresSelected, false, strBaseDate, strBaseTime, element.attr("data-jobdata").split("|")[2]);
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subGetAllCostumers(selectCustomer) {
	$.ajax({
		type: "GET",
		url: "/Estimate/GetAllCustomers",
		success: function (jsonResponse) {
			if (jsonResponse.intStatus == 200) {
				arrCustomers = jsonResponse.objResponse;
				selectCustomer.html("");

				if (jsonResponse.objResponse.length > 0) {
					for (var i = 0; i < jsonResponse.objResponse.length; i++) {
						var obj = jsonResponse.objResponse[i];
						let strDivElement = '<div class="customerOptionFilter" style="color: #58585b; border-radius:0px;"' +
							' data-intContactId="' + obj.intContactId + '">' + obj.strFirstName + ' ' +
							obj.strLastName + '</div>';

						selectCustomer.append(strDivElement);
					}
				}
				else {
					selectCustomer.val("null").change();
				}
			}
			else {
				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
			}
		},
		error: function () {
			subSendNotification("Something wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
