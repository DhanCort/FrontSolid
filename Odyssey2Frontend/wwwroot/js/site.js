let boolReloadSite = false;
let strElementIdForTriggerEvent = null;
let strNewLinkForReload = null;
let boolSendEmail = false;

$(document).ready(function () {
	//------------------------------------------------------------------------------------------------------------------
	$("#kendoVersion").text(kendo.version);
	var options = [];

	//------------------------------------------------------------------------------------------------------------------
	$('.keep-open').click(function (e) {
		if (/input|label/i.test(e.target.tagName)) {
			var parent = $(e.target).parent();
			if (parent.hasClass('checkbox')) {
				var checkbox = parent.find('input[type=checkbox]');
				checkbox.prop("checked", !checkbox.prop("checked"));
				return false;
			}
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".custom-file-input").on("change", function () {
		var fileName = $(this).val().split("\\").pop();
		$(this).siblings(".custom-file-label").addClass("selected").html(fileName.substring(0, 45));
	});

	//------------------------------------------------------------------------------------------------------------------
	strElementIdForTriggerEvent = Cookies.get("strElementIdForTriggerEvent");

	if (
		//                                                  //If the user is logged, get the unread notifications number.
		boolIsLogged == "true"
	) {
		funGetUnreadNotificationsNumber();
	}

	if (
		//                                                  //Get the id of the element event that wants to trigger.
		strElementIdForTriggerEvent != null &&
		strElementIdForTriggerEvent.length > 0
	) {
		$("#" + Cookies.get("strElementIdForTriggerEvent")).click();

		Cookies.remove("strElementIdForTriggerEvent")
	}

	//------------------------------------------------------------------------------------------------------------------
	$(document).on('mouseup touchend', function (e) {
		var container = $(".bootstrap-datetimepicker-widget");
		if (!container.is(e.target) && container.has(e.target).length === 0) {
			container.hide();
		}
	});
	//------------------------------------------------------------------------------------------------------------------
	$("input[name=processType]").click(function () {
		var type = $('input:radio[name=processType]:checked').val();
		if (type == "new") {
			$("#newXJDF").fadeOut();
			$("#newProcess").fadeIn();
		}
		else if (type == "xjdf") {
			$("#newProcess").fadeOut();
			$("#newXJDF").fadeIn();
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#templatesList").change(function () {
		var intPk = $('#templatesList').val();
		$.ajax({
			type: "POST",
			url: "/PrintshopProcessTemplate/GetAttribute",
			data: { 'intPk': intPk },
			dataType: "html",
			success: function (response) {
				$("#attributesXJDF").html(response);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#savePrintshopTemplate").click(function (e) {
		e.preventDefault;
		var strPrintshopId = $("#strPrintshopIdXJDF").val();
		var strCustomTemplateId = $("#templatesList").val();
		var strTemplateId = $("#strTemplateId").val();
		var selectedAttributes = [];

		$('input[name="strAttribute[]"]:checked').each(function () {
			var value = $(this).val();
			selectedAttributes.push(value);
		});

		$.ajax({
			type: "POST",
			url: "/PrintshopProcessTemplate/CreateNewFromXJDF",
			data: {
				"strPrintshopId": strPrintshopId,
				"strCustomTemplateId": strCustomTemplateId,
				"strTemplateId": strTemplateId,
				"arrattrAttributes": selectedAttributes
			},
			success: function (response) {

			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#btnGetPrintshops").click(function (event) {

		let strEmail = $("#strEmail").val();
		let strPassword = $("#strPassword").val();

		$.ajax({
			type: "GET",
			url: "/Base/GetPrintshops",
			data: {
				"strEmail": strEmail
			},
			beforeSend: function () {
				$("#btnGetPrintshops").prop("disabled", true);
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					$(this).parent().parent().find("#divPrintshopIdDropdown").html("");
					if (
						objResponse.objResponse.boolIsAdmin
					) {
						$(".divPrintshopId").prop("hidden", false);
						$("#btnGetPrintshops").prop("hidden", true);
						$("#btnLogin").prop("hidden", false);
					}
					else if (
						objResponse.objResponse.arrps.length > 1
					) {
						$("#strPrintshopIdDropdown").html("");
						$("#strPrintshopIdDropdown").append(new Option("Pick one Printshop", ""))
						$.each(objResponse.objResponse.arrps, function (intIndex, objValue) {
							$("#strPrintshopIdDropdown").append(new Option(objValue.strName, objValue.intPrintshopId));
						});

						$(".divPrintshopIdDropdown").prop("hidden", false);
						$("#btnGetPrintshops").prop("hidden", true);
						$("#btnLogin").prop("hidden", false);
					}
					else if (
						objResponse.objResponse.arrps.length == 1
					) {
						funLogin(strEmail, objResponse.objResponse.arrps[0].intPrintshopId, strPassword);
					}
					else {
						subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					}
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					$(".divPrintshopId").prop("hidden", true);
					$(".divPrintshopIdDropdown").prop("hidden", true);
					$("#btnGetPrintshops").prop("hidden", false);
					$("#btnLogin").prop("hidden", true);
				}

				$("#btnGetPrintshops").prop("disabled", false);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
				$("#btnGetPrintshops").prop("disabled", false);
				$("#btnGetPrintshops").prop("hidden", false);
				$(".divPrintshopId").prop("hidden", true);
				$(".divPrintshopIdDropdown").prop("hidden", true);
				$("#btnLogin").prop("hidden", true);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#btnLogin").click(function (event) {
		event.preventDefault();

		let strEmail = $("#strEmail").val();
		let strPassword = $("#strPassword").val();
		let strPrintshop = $("#strPrintshopIdDropdown").val();
		if (
			!(strPrintshop != "Pick a printshop")
		) {
			strPrintshop = $("#strPrintshopId").val();
		}

		funLogin(strEmail, strPrintshop, strPassword);
	});

	////------------------------------------------------------------------------------------------------------------------
	//$("#login-link").click(function (event) {
	//    event.preventDefault();

	//    //												//Show the section and hide the others.
	//    $("#email-form").removeAttr("hidden");
	//    $("#login-printshop-list-section").attr("hidden", true);
	//    $("#printshop-pasword").attr("hidden", true);
	//    $("#login-btn-back").attr("hidden", true);

	//    //												//Reset forms.
	//    $("#email-form")[0].reset();
	//    $("#printshop-pasword")[0].reset();
	//});

	////------------------------------------------------------------------------------------------------------------------
	//$("#email-form").submit(function (event) {
	//    event.preventDefault();

	//    let strUrl = $(this).attr("action");
	//    let strData = $(this).serialize();

	//    $.ajax({
	//        type: "GET",
	//        url: strUrl,
	//        data: strData,
	//        beforeSend: function () {
	//            $("#email-loader").removeAttr("hidden");
	//            $("#email-form").find("button").attr("hidden", true);
	//        },
	//        success: function (objResponse) {
	//            if (
	//                objResponse.intStatus == 200
	//            ) {
	//                $("#login-printshop-list").html("");
	//                if (
	//                    objResponse.objResponse.boolIsAdmin
	//                ) {
	//                    showPasswordForm(null, null, false, true);
	//                    $("#email-form").attr("hidden", true);
	//                }
	//                else if (
	//                    objResponse.objResponse.arrps.length > 1
	//                ) {
	//                    $.each(objResponse.objResponse.arrps, function (intIndex, objValue) {
	//                        $("#login-printshop-list")
	//                            .append("<button class='dropdown-item printshop-option' href='#' data-intPrintshopId='" +
	//                                objValue.intPrintshopId + "' data-strName='" + objValue.strName + "'>" +
	//                                objValue.strName + "</button>");
	//                    });

	//                    $("#login-printshop-list-section").removeAttr("hidden");
	//                    $("#email-form").attr("hidden", true);
	//                }
	//                else if (
	//                    objResponse.objResponse.arrps.length == 1
	//                ) {
	//                    showPasswordForm(objResponse.objResponse.arrps[0].intPrintshopId,
	//                        objResponse.objResponse.arrps[0].strName, false);
	//                    $("#email-form").attr("hidden", true);
	//                }
	//                else {
	//                    subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
	//                }
	//            }
	//            else {
	//                subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
	//            }
	//            $("#email-loader").attr("hidden", true);
	//            $("#email-form").find("button").removeAttr("hidden");
	//        },
	//        error: function () {
	//            subSendNotification("Something is wrong.", 400);
	//            $("#email-loader").attr("hidden", true);
	//            $("#email-form").find("button").removeAttr("hidden");
	//        }
	//    });
	//});

	////------------------------------------------------------------------------------------------------------------------
	//$("#login-btn-back").click(function () {
	//    $("#login-printshop-list-section").removeAttr("hidden");
	//    $("#printshop-pasword").attr("hidden", true);
	//    $("#login-btn-back").attr("hidden", true);
	//});

	////------------------------------------------------------------------------------------------------------------------
	//$(document).on("click", ".printshop-option", function (event) {
	//    event.stopPropagation();

	//    let intPrintshopId = $(this).data("intprintshopid");
	//    let strName = $(this).data("strname");

	//    showPasswordForm(intPrintshopId, strName, true, false);
	//});

	////------------------------------------------------------------------------------------------------------------------
	//$("#printshop-pasword").submit(function (event) {
	//    event.preventDefault();
	//    let strUrl = $(this).attr("action");
	//    let strData = $(this).serialize();

	//    $.ajax({
	//        type: "GET",
	//        url: strUrl,
	//        data: strData,
	//        beforeSend: function () {
	//            $("#login-loader").removeAttr("hidden");
	//            $("#printshop-pasword").find("button").attr("hidden", true);
	//        },
	//        success: function (objRespose) {
	//            if (objRespose.intStatus == 200) {
	//                Cookies.set("boolIsLogged", "true");
	//                location.reload();
	//            }
	//            else {
	//                subSendNotification(objRespose.strUserMessage, objRespose.intStatus);
	//                $("#login-loader").attr("hidden", true);
	//                $("#printshop-pasword").find("button").removeAttr("hidden");
	//            }
	//        },
	//        error: function () {
	//            subSendNotification("Something is wrong.", 400);
	//            $("#login-loader").attr("hidden", true);
	//            $("#printshop-pasword").find("button").removeAttr("hidden");
	//        }
	//    });
	//});

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
	$("#changePrintshopForm").submit(function (event) {
		event.preventDefault();
		$.ajax({
			type: "POST",
			url: "/Home/ChangePrintshop",
			data: $(this).serialize(),
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {
					location.href = "/home/";
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
	$("#jobs-dropdown-menu").on("show.bs.dropdown", function () {
		let divContainerElement = $(this).find("ul");

		$.ajax({
			type: "GET",
			url: "/Jobs/GetQuantities",
			beforeSend: function () {
				$(".job-quantity").html("<i class='fa fa-cog fa-spin'></i>");
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					$.each(objResponse.objResponse, function (intIndex, objValue) {
						let strFixedIdName = objValue.strType.replace(" ", "-").replace(".", "");
						$("#job-quantity-" + strFixedIdName).html(objValue.intQuantity);
					});
				}
				else {
					$(".job-quantity").html("0");
				}
			},
			error: function () {
				$(".job-quantity").html("0");
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#estimates-dropdown-menu").on("show.bs.dropdown", function () {
		$.ajax({
			type: "GET",
			url: "/Jobs/GetEstimatesQuantities",
			beforeSend: function () {
				$(".job-quantity").html("<i class='fa fa-cog fa-spin'></i>");
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					$.each(objResponse.objResponse, function (intIndex, objValue) {
						let strFixedIdName = objValue.strType.replace(" ", "-").replace(".", "");
						$("#estimate-quantity-" + strFixedIdName).html(objValue.intQuantity);
					});
				}
				else {
					$(".estimate-quantity").html("0");
				}
			},
			error: function () {
				$(".estimate-quantity").html("0");
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#specialPasswordForm").submit(function (event) {
		event.preventDefault();
		let strCurrentPassword = $("#strCurrentPassword").val();
		let strNewPassword = $("#strNewPassword").val();

		let data = {
			"strCurrentPassword": strCurrentPassword,
			"strNewPassword": strNewPassword
		};

		$.ajax({
			type: "POST",
			url: "/Base/ModifySpecialPassword",
			data: data,
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					$("#specialPasswordModal").modal("hide");
					cleanSpecialPasswordForm();
					enableSpecialPasswordButton();
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					cleanSpecialPasswordForm();
					enableSpecialPasswordButton();
				}
			},
			error: function () {
				subSendNotification("Something is wrong", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#strCurrentPassword").keyup(function () {
		enableSpecialPasswordButton();
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#strNewPassword").keyup(function () {
		enableSpecialPasswordButton();
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#strConfirmNewPassword").keyup(function () {
		enableSpecialPasswordButton();
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#specialPasswordModal").on("hide.bs.modal", function () {
		cleanSpecialPasswordForm();
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#confirmation-modal").keypress(function (e) {
		if (e.which == 13) {
			$("#modal-btn-yes").click();
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$('#mi4pMasterModal').on('hidden.bs.modal', function () {
		//loader();
		if (boolReloadSite) {
			disableElements();

			if (strNewLinkForReload == null) {
				location.reload();
			}
			else {
				location.href = strNewLinkForReload;
			}
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".btnNotif").on("click", function () {
		let alertList = $(this).parent().find(".dropdown-menu");
		if (
			!alertList.hasClass("show")
		) {
			$.ajax({
				type: "GET",
				url: "/Base/GetAlerts",
				beforeSend: function () {
					alertList.html("");
					alertList.append('<div class="col-sm-12 text-center"><i class="fa fa-spinner fa-pulse fa-3x fa-fw">' +
						'</i><span class="sr-only" >Loading...</span ></div>')
				},
				success: function (objResponse) {
					if ((objResponse.intStatus) == 200 && (objResponse.objResponse != "")) {
						alertList.html("");
						$.each(objResponse.objResponse, function (index, value) {
							let strUnderlinedStyle = "";
							if (
								value.boolnJob != null && value.intnJobId
							) {
								strUnderlinedStyle = " text-decoration: underline;";
							}

							let strHtmlCardCode = ('<div class="row dropdown-item"><div class= "card" ' +
								'style = "min-width: 100% !important;' + strUnderlinedStyle +
								'"><div class="card-body"><h4 class="card-title">' + value.strAlertType +
								'</h4><p class="card-text">' + value.strAlertDescription + '</p >' + '</div></div ></div>');

							if (
								value.boolnJob != null && value.intnJobId
							) {
								let strUrl = "/Estimate?boolRequested=True"
								if (
									value.boolnJob
								) {
									strUrl = "/Jobs?";
									if (
										value.boolInEstimating
									) {
										strUrl = strUrl + "boolnInEstimating=True";
									}
									else {
										strUrl = strUrl + "boolnPending=True";
									}
								}

								strHtmlCardCode = "<a class='notificationLink' href='" + strUrl + "' data-intJobId='" +
									value.intnJobId + "'>" + strHtmlCardCode + "</a>";
							}

							alertList.append(strHtmlCardCode);
						});
						$(".countNotif").html(0);
						$(".btnNotif").css("background-color", "#939598");
					}
					else if (
						(objResponse.intStatus) == 200 && (objResponse.objResponse == "")
					) {
						alertList.html("");
						alertList.append('<div class="row dropdown-item" href="#"><div class= "card" ' +
							'style = "min-width: 100% !important;"><div class="card-body"><p class="card-text">' +
							'No alerts to show.' + '</p >' +
							'</div></div ></div >')
						$(".countNotif").html(0);
						$(".btnNotif").css("background-color", "#939598");
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
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".NotifDropdown", function (event) {
		event.stopPropagation()
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".notificationLink", function (event) {
		event.preventDefault();
		let intJobId = $(this).data("intjobid");

		Cookies.set("intJobId", intJobId);
		location.href = $(this).attr("href");
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#frmOffsetNumber").submit(function (event) {
		event.preventDefault();

		let form = $(this).serialize();

		$(".btnYesNo").css("display", "block");
		$(".btnOk").css("display", "none");
		$("#myModalBody").html(
			"<span class='font-bold'>You will not be able   to to reset or change this number.<br /> Are you sure?</span><br/>"
		);
		$("#confirmation-modal").modal('show');

		$("#modal-btn-yes").unbind();
		$("#modal-btn-yes").bind("click", function () {
			$.ajax({
				type: "POST",
				url: "/Home/SetOffset",
				data: form,
				success: function (objResponse) {
					if (objResponse.intStatus == 200) {
						location.href = "/home/";
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

		$("#modal-btn-no").unbind();
		$("#modal-btn-no").bind("click", function () {
			$("#confirmation-modal").modal('hide');
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#pendingtasks-pill, #inprogresstasks-pill").click(function () {
		let arrstrId = $(this).attr("id").split('-');

		let boolPending = (arrstrId[0] == "pendingtasks");

		$.ajax({
			type: "GET",
			url: "/Jobs/GetTasksJobs",
			data: {
				"boolPending": boolPending
			},
			beforeSend: function () {
				$("#" + arrstrId[0]).html('<div class="col-sm-12 text-center"><i class="fa fa-spinner fa-pulse fa-3x ' +
					'fa-fw"></i><span class="sr-only" >Loading...</span ></div>');
			},
			success: function (objResponse) {
				$("#" + arrstrId[0]).html(objResponse);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("shown.bs.dropdown", ".slcWfTask", function () {
		let intPkProduct = $(this).data("intpkproduct");
		let intJobId = $(this).data("intjobid");
		let dropdownSection = $(this).find("div");

		$.ajax({
			type: "GET",
			url: "/Jobs/GetProductWorkflows",
			data: {
				"intPkProduct": intPkProduct,
				"intnJobId": intJobId,
				"boolEstimate": false
			},
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {
					let boolHasAtLeastOneDefault = false;
					dropdownSection.html("");

					$.each(objResponse.objResponse, function (intIndex, objValue) {
						let linkElement = $("<a class='dropdown-item taskSelect' data-intPkWorkflow='" +
							objValue.intPkWorkflow + "' data-intJobId='" + intJobId + "'>" + objValue.strName + "</a>");

						if (
							(!objValue.boolUsed && boolHasAtLeastOneDefault) ||
							(objValue.boolUsed && !objValue.boolStillValid)
						) {
							linkElement.addClass("showNotification");
							if (
								objValue.boolUsed && !objValue.boolStillValid
							) {
								linkElement.attr("data-boolReadOnly", true);
								linkElement.attr("data-strWarningMessage", "There is a new version for this " +
									"workflow, you can open it as read only.");
							}
							else {
								linkElement.attr("data-strWarningMessage", strMessage);
							}
						}
						else {
							linkElement.addClass("selectWfTask");
						}

						dropdownSection.append(linkElement);
						if (
							objValue.boolUsed
						) {
							boolHasAtLeastOneDefault = true;
							dropdownSection.append('<div class="dropdown-header">Other Workflows</div>');
							strMessage = objValue.strWarningMessage;
						}
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
	$(document).on("click", ".clpTasksJob", function () {
		let intPkWorkflow = $(this).data("intpkworkflow");
		let intJobId = $(this).data("intjobid");
		let boolPending = $(this).data("pending");

		if (
			boolPending == "False"
		) {
			var div = $("#Periods_" + intJobId);
			if (
				div.hasClass("show")
			) {
				div.removeClass("show");
				$(this).removeClass("collapse");
				$(this).addClass("collapsed");
			}
			else {
				div.html('<div class="col-sm-12 text-center"><i class="fa fa-spinner fa-pulse fa-3x ' +
					'fa-fw"></i><span class="sr-only" >Loading...</span ></div>')
				div.addClass("show");
				$.when(
					$.ajax({
						type: "GET",
						url: "/Jobs/GetPeriodsForAJobAndWorkflow",
						data: {
							"intPkWorkflow": intPkWorkflow,
							"intJobId": intJobId
						},
						success: function (objResponse) {
							div.html(objResponse);
							if (
								$("#PeriodJobsTable_" + intJobId + " tr").length == 1
							) {
								div.find("#PeriodJobsTable_" + intJobId).append("<tr><td colspan='8' style='text-align:center;'>" +
									"This job and workflow contains no tasks.</td></tr>");
							}
							div.addClass("show");
							$(this).removeClass("collapsed");
							$(this).addClass("collapse");
						},
						error: function () {
							div.html("");
							div.removeClass("show");
							$(this).removeClass("collapse");
							$(this).addClass("collapsed");
							subSendNotification("Something is wrong.", 400);
						}
					})
				).then(function () {
					$(".dtpicker").each(function () {
						$(this).datetimepicker({
							format: "YYYY-MM-DD HH:mm",
							widgetPositioning: {
								horizontal: "auto",
								vertical: "bottom"
							}
						});
					});
					getEmployeesForResource();
				})

			}
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".selectWfTask", function () {
		let intPkWorkflow = $(this).attr("data-intPkWorkflow");
		let intJobId = $(this).attr("data-intJobId");
		let boolReadOnly = Cookies.get("boolReadOnly");
		Cookies.remove("boolReadOnly");

		var div = $("#Periods_" + intJobId);
		if (
			!isNaN(parseInt(intPkWorkflow))
		) {
			div.html('<div class="col-sm-12 text-center"><i class="fa fa-spinner fa-pulse fa-3x ' +
				'fa-fw"></i><span class="sr-only" >Loading...</span ></div>')
			div.addClass("show");
			$.when(
				$.ajax({
					type: "GET",
					url: "/Jobs/GetPeriodsForAJobAndWorkflow",
					data: {
						"intPkWorkflow": intPkWorkflow,
						"intJobId": intJobId
					},
					success: function (objResponse) {
						div.html(objResponse);
						if (
							$("#PeriodJobsTable_" + intJobId + " tr").length == 1
						) {
							div.find("#PeriodJobsTable_" + intJobId).append("<tr><td colspan='8' style='text-align:center;'>" +
								"This job and workflow contains no tasks.</td></tr>");
						}

						if (
							boolReadOnly != null && boolReadOnly != undefined && JSON.parse(boolReadOnly)
						) {
							$("button, input, select").prop("disabled", true);
						}
					},
					error: function () {
						subSendNotification("Something is wrong.", 400);
						div.html("");
						div.removeClass("show");
					}
				})
			).then(function () {
				$(".dtpicker").each(function () {
					$(this).datetimepicker({
						format: "YYYY-MM-DD HH:mm",
						widgetPositioning: {
							horizontal: "auto",
							vertical: "bottom"
						}
					});
				});
				getEmployeesForResource();
			})
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".SetResourcePeriod", function () {
		//                                                  //The data is order as follows:
		//                                                  //      intPkResource|intPkProcessInWorkflow|
		//                                                  //          intPkEleetOrEleele | boolIsEleet
		let data_new_period = $(this).attr("data-new-period").split("|");
		let intPeriodId = $(this).attr("data-intPeriodId");
		let period;
		let strPassword = null;

		if ($(this).attr("data-intPkPeriod") != "") {
			period = {
				"intPkPeriod": $(this).attr("data-intPkPeriod"),
				"intnPkPeriod": $(this).attr("data-intPkPeriod"),
				"strPassword": strPassword,
				"intPkResource": data_new_period[0],
				"intJobId": $(this).attr("data-intJobId"),
				"intPkProcessInWorkflow": data_new_period[1],
				"strStartDate": $("#strStartDate_" + intPeriodId).val().split(" ")[0],
				"strStartTime": $("#strStartDate_" + intPeriodId).val().split(" ")[1] + ":00",
				"strEndDate": $("#strEndDate_" + intPeriodId).val().split(" ")[0],
				"strEndTime": $("#strEndDate_" + intPeriodId).val().split(" ")[1] + ":00",
				"intnContactId": $("#strEmployee_" + intPeriodId).val(),
				"intPkEleetOrEleele": data_new_period[2],
				"boolIsEleet": data_new_period[3],
				"intMinsBeforeDelete": $("#intMinsBeforeDelete_" + intPeriodId).val(),
				"intPeriodId": intPeriodId
			};
		}
		else {
			period = {
				"intnPkPeriod": null,
				"intPkResource": data_new_period[0],
				"strPassword": strPassword,
				"strStartDate": $("#strStartDate_" + intPeriodId).val().split(" ")[0],
				"strStartTime": $("#strStartDate_" + intPeriodId).val().split(" ")[1] + ":00",
				"strEndDate": $("#strEndDate_" + intPeriodId).val().split(" ")[0],
				"strEndTime": $("#strEndDate_" + intPeriodId).val().split(" ")[1] + ":00",
				"intJobId": $(this).attr("data-intJobId"),
				"intPkProcessInWorkflow": data_new_period[1],
				"intPkEleetOrEleele": data_new_period[2],
				"boolIsEleet": data_new_period[3],
				"intnContactId": $("#strEmployee_" + intPeriodId).val(),
				"intMinsBeforeDelete": $("#intMinsBeforeDelete_" + intPeriodId).val(),
				"intPeriodId": intPeriodId
			};
		}

		//console.info(period);

		$.ajax({
			type: "POST",
			url: "/Period/PeriodIsAddable",
			data: period,
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {
					let strPasswordInput = "<input type='password' placeholder='Special Password' class='input-with-dropdowns form-control mt-2' id ='strConfirmPassword' />";
					if (objResponse.objResponse.boolIsAddableAboutPeriods == true &&
						objResponse.objResponse.boolIsAddableAboutRules == true) {
						subAddOrModifyPeriod(data_new_period, period);
					}
					else if (objResponse.objResponse.boolIsAddableAboutPeriods == true &&
						objResponse.objResponse.boolIsAddableAboutRules == false) {
						subConfirmAddOrModifyPeriod(objResponse, period, strPasswordInput, data_new_period);
					}
					else if (objResponse.objResponse.boolIsAddableAboutPeriods == false &&
						objResponse.objResponse.boolIsAddableAboutRules == true) {
						strPasswordInput = "";
						subConfirmAddOrModifyPeriod(objResponse, period, strPasswordInput, data_new_period);
					}
					else if (objResponse.objResponse.boolIsAddableAboutPeriods == false &&
						objResponse.objResponse.boolIsAddableAboutRules == false) {
						subConfirmAddOrModifyPeriod(objResponse, period, strPasswordInput, data_new_period);
					}
					else {
						subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					}
				}
				else {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			},
			error: function () {
				subSendNotification("Something is wrong", 400);
			}
		});

	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".resetResourcePeriod", function () {
		let intPkPeriod = $(this).attr("data-intPkPeriod");
		let intPeriodId = $(this).attr("data-intPeriodId");

		if (
			intPkPeriod != "" && intPkPeriod != null && intPkPeriod > 0
		) {
			$.ajax({
				type: "GET",
				url: "/Period/GetPeriod",
				data: {
					"intPkPeriod": intPkPeriod
				},
				success: function (objResponse) {
					if (
						objResponse.intStatus == 200
					) {
						let strStartTime = objResponse.objResponse.strStartTime.split(":");
						let strEndTime = objResponse.objResponse.strEndTime.split(":");
						$("#strStartDate_" + intPeriodId).val(objResponse.objResponse.strStartDate + " " + strStartTime[0] + ":"
							+ strStartTime[1]);
						$("#strEndDate_" + intPeriodId).val(objResponse.objResponse.strEndDate + " " + strEndTime[0] + ":"
							+ strEndTime[1]);
						$("#intMinsBeforeDelete_" + intPeriodId).val(objResponse.objResponse.intMinsBeforeDelete);
						$("#strEmployee_" + intPeriodId).val(objResponse.objResponse.intnContactId);
					}
					else {
						subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					}
				},
				error: function () {
					subSendNotification("Something wrong.", 400);
				}
			});
		}
		else {
			$("#strStartDate_" + intPeriodId).val(null);
			$("#strEndDate_" + intPeriodId).val(null);
			$("#intMinsBeforeDelete_" + intPeriodId).val("");
			$("#strEmployee_" + intPeriodId).val("");
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".deleteResourcePeriod", function () {
		let intPkPeriod = $(this).val();
		let intPeriodId = $(this).attr("data-intPeriodId");
		let intJobId = intPeriodId.split("_")[0];

		$.ajax({
			type: "POST",
			url: "/Period/DeletePeriod",
			data: { "intPkPeriod": intPkPeriod },
			success: function (response) {
				if (response.intStatus == 200) {
					$("#estimateDateLabel-" + intJobId).html("Estimated Date: " + response.objResponse.strEstimatedDate);

					subSendNotification(response.strUserMessage, response.intStatus);
					$("#strStartDate_" + intPeriodId).val(null);
					$("#strEndDate_" + intPeriodId).val(null);
					$("#intMinsBeforeDelete_" + intPeriodId).val("");
					$("#strEmployee_" + intPeriodId).val("");
					$("#btnDeleteResourcePeriod_" + intPeriodId).prop("hidden", true);
					$("#btnDeleteResourcePeriod_" + intPeriodId).val("");
					$("#btnResetResourcePeriod_" + intPeriodId).attr("data-intPkPeriod", "");
					$("#btnSetResourcePeriod_" + intPeriodId).attr("data-intPkPeriod", "");
				}
				else {
					subSendNotification(response.strUserMessage, response.intStatus);
				}
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#btnAddcustomerModal", function () {
		$("#addCustomerModal").find("#frmAddCustomer")[0].reset();
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#frmAddCustomer").submit(function (event) {
		event.preventDefault();

		var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if (!regex.test($("#frmAddCustomer").find("#strEmail").val())) {
			subSendNotification("Invalid e-mail", 400);
		} else {
			$.ajax({
				type: "POST",
				url: "/PrintshopContacts/Add",
				data: $(this).serialize(),
				success: function (jsonResponse) {
					if (jsonResponse.intStatus == 200) {

						let cutomersList = $("#newEstimateForm").find("#customerNameSearchInput").next();
						cutomersList.append('<div class="customerOptionFilter" style="color: #58585b; border-radius:0px;"' +
							'data-intcontactid="' + jsonResponse.objResponse.intContactId + '">' +
							jsonResponse.objResponse.strFullName + '</div>')

						$("#newEstimateForm").find("input[name=intContactId]")
							.val(jsonResponse.objResponse.intContactId);
						$("#newEstimateForm").find("#customerNameSearchInput")
							.val(jsonResponse.objResponse.strFullName);

						$("#addCustomerModal").modal("hide");

						subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
					}
					else {
						subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
					}
				},
				error: function (jsonResponse) {
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				}
			});
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnCloseaddCustomerModal", function () {
		$("#addCustomerModal").modal("hide")
	});


	//------------------------------------------------------------------------------------------------------------------
	$("#timeZoneLink").click(function () {
		$.ajax({
			type: "GET",
			url: "/Home/GetTimeZone",
			success: function (objResponse) {
				if (
					typeof objResponse === "object"
				) {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
				else {
					subShowModal("Time Zone", objResponse, "modal-md", "autoHeight", true, false);
				}
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("submit", "#timeZoneForm", function (event) {
		event.preventDefault();
		let formElement = $(this);

		$.ajax({
			type: "POST",
			url: "/Home/UpdateTimeZone",
			data: $(this).serialize(),
			beforeSend: function () {
				formElement.find("button").prop("disabled", true);
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					$("#mi4pMasterModal").modal("toggle");
				}
				else {
					formElement.find("button").prop("disabled", false);
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				formElement.find("button").prop("disabled", false);
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------
//															//SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subDisableAllButtons() {
	$("button").prop("disabled", true);
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function calculateJob(jobId) {
	var colValue = $('#jobsTable').find("#tr_" + jobId).find("#td_" + jobId).text();
	$.ajax({
		type: "POST",
		url: "/Jobs/Calculate",
		data: { 'jobId': jobId, 'name': colValue },
		dataType: "html",
		success: function (response) {
			$("#result_calculation").html(response);
			$(".panel").fadeOut();
			$("#panel_" + jobId).fadeIn();
			$('#myModal').modal('show');
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function subSendNotification(strMessage, intStatus) {
	let strMessageType = arrstrGetNotificationType(intStatus);

	if (
		strMessage.toLowerCase() == "success" ||
		strMessage.toLowerCase() == "success." ||
		strMessage.toLowerCase() == "warning" ||
		strMessage.toLowerCase() == "warning." ||
		strMessage.toLowerCase() == "error" ||
		strMessage.toLowerCase() == "error."
	) {
		strMessage = "";
	}

	$.notify({
		title: '<strong>' + strMessageType[1] + '</strong>',
		message: strMessage
	},
		{
			type: strMessageType[0],
			placement: {
				from: 'bottom',
				align: 'right'
			}
		}
	);
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function arrstrGetNotificationType(intStatus) {
	let strMessageType = ["", ""]

	/*CASE*/
	if (
		intStatus == 200
	) {
		strMessageType[0] = "success";
		strMessageType[1] = "Success.";
	}
	else if (
		intStatus == 300
	) {
		strMessageType[0] = "warning";
		strMessageType[1] = "Warning.";
	}
	else {
		strMessageType[0] = "danger";
		strMessageType[1] = "Error.";
	}
	/*END-CASE*/

	return strMessageType;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function showPasswordForm(intPrintshopId_I, strName_I, boolIsMultiplePrintshop_I, boolIsAdmin_I) {
	let strEmail = $("#email-form").find("input[name=strEmail]").val();
	let strMessage = null;

	//													//Show the elements.
	$("#login-printshop-list-section").attr("hidden", true);
	$("#printshop-pasword").removeAttr("hidden");

	//													//Set the email value.
	$("#printshop-pasword").find("input[name=strEmail]").val(strEmail);

	if (
		boolIsAdmin_I
	) {
		$("#login-printsopid").removeAttr("hidden");
		$("#printshop-pasword").removeAttr("hidden");
		strMessage = "Enter the <strong>printshop id</strong> and your password for <strong>" + strEmail + ".";
	}
	else {
		if (
			//												//If the user has more than one printshop, show the 
			//												//		back button.
			boolIsMultiplePrintshop_I
		) {
			$("#login-btn-back").removeAttr("hidden");
		}

		//													//Hide the the printshopid field.
		$("#login-printsopid").attr("hidden", true);

		//													//Set the printshopid value field.
		$("#printshop-pasword").find("input[name=strPrintshopId]").val(intPrintshopId_I);

		//													//Set the text for the label.
		strMessage = "Enter your password for <strong>" + strEmail + "</strong> at <strong>" + strName_I + "</strong>";
	}

	$("#password-for-printshop").html(strMessage);
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function disableElements() {
	$(".elementToDisable").each(function () {
		$(this).prop('disabled', true);
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function enableElements() {
	$(".elementToDisable").each(function () {
		$(this).prop('disabled', false);
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function enableSpecialPasswordButton() {
	let strCurrentPassword = $("#strCurrentPassword").val();
	let strNewPassword = $("#strNewPassword").val();
	let strConfirmNewPassword = $("#strConfirmNewPassword").val();

	if ((strNewPassword == strConfirmNewPassword) && (strNewPassword != "" && strConfirmNewPassword != "")) {
		if (strCurrentPassword != "") {
			$("#setPasswordButton").removeAttr("hidden");
		}
		else {
			$("#setPasswordButton").attr("hidden", "hidden");
		}
		$(".times-icon").css("display", "none");
		$(".check-icon").css("display", "inline");
	}
	else {
		$("#setPasswordButton").attr("hidden", "hidden");
		$(".check-icon").css("display", "none");
		$(".times-icon").css("display", "inline");
	}
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function cleanSpecialPasswordForm() {
	$("#strCurrentPassword").val("");
	$("#strNewPassword").val("");
	$("#strConfirmNewPassword").val("");

	$(".check-icon").css("display", "none");
	$(".times-icon").css("display", "none");

	$("#setPasswordButton").attr("hidden", "hidden");
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subShowModal(
	strTitle,
	strBody,
	strModalClassSize,
	strClassHeight,
	boolShowModal,
	boolShowBtnSave,
	strTitleLabelSize = "h4",
	strButtonName = "Save"
) {
	$("#mi4pMasterModalBody").html(strBody);
	if (boolShowModal) {
		$("#mi4pMasterModalTitle").html("<" + strTitleLabelSize + ">" + strTitle + "</" + strTitleLabelSize + ">")
		$("#mi4pMasterModalDialog").addClass(strModalClassSize);
		$("#mi4pMasterModalBody").addClass(strClassHeight);
		$("#mi4pMasterModal").modal("show");
	}

	$("#mi4pMasterModalSave").attr("hidden", true);
	if (boolShowBtnSave) {
		$("#mi4pMasterModalSave").unbind();
		$("#mi4pMasterModalSave").html(strButtonName);
		$("#mi4pMasterModalSave").removeAttr("hidden")
	}
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subConvertSerializeDataToJson(strSerialize) {
	var data = strSerialize.split("&");
	var obj = {};
	for (var key in data) {
		obj[data[key].split("=")[0]] = data[key].split("=")[1];
	}

	return obj;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function funGetUnreadNotificationsNumber() {
	$.ajax({
		type: "GET",
		url: "/Home/GetUnreadNotificationsNumber",
		success: function (intNotificationNumber) {
			if (
				intNotificationNumber > 0
			) {
				$(".btnNotif").css("background-color", "#dc3545");
			}
			else if (
				intNotificationNumber == 0
			) {
				$(".btnNotif").css("background-color", "#939598");
			}

			$(".countNotif").html(intNotificationNumber);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function funLogin(
	strEmail,
	strPrintshopId,
	strPassword
) {
	let resolvedOptions = Intl.DateTimeFormat().resolvedOptions();

	$.ajax({
		type: "GET",
		url: "/Base/Login",
		data: {
			"strEmail": strEmail,
			"strPrintshopId": strPrintshopId,
			"strPassword": strPassword,
			"strTimeZone": resolvedOptions.timeZone
		},
		success: function (objRespose) {
			if (objRespose.intStatus == 200) {
				Cookies.set("boolIsLogged", "true");
				location.reload();
				$(".divPrintshopId").prop("hidden", true);
				$(".divPrintshopIdDropdown").prop("hidden", true);
				$("#btnGetPrintshops").prop("hidden", false);
				$("#btnLogin").prop("hidden", true);
			}
			else {
				subSendNotification(objRespose.strUserMessage, objRespose.intStatus);
			}
		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function strCurrencyFormat(
	numAmount
) {
	let strFormattedAmount = numAmount.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	});

	return strFormattedAmount.replace('$', '');
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function funGoToJobOrEstimate() {
	let intJobId = Cookies.get("intJobId");
	Cookies.remove("intJobId");

	if (
		intJobId != null &&
		intJobId != undefined
	) {
		$("#tr_" + intJobId).fadeIn("slow", function () {
			$(this).addClass("table-primary");

			$('body,html').stop(true, true).animate({
				scrollTop: $("#tr_" + intJobId).offset().top - 200
			}, 1000);
		});
	}
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function funShowEmailDialog(
	strDescription,
	funFunction
) {
	$(".btnYesNo").css("display", "block");
	$(".btnOk").css("display", "none");
	$("#confirmation-modal").modal('show');
	$("#myModalBody").html(
		"<span class='font-bold'>" + strDescription + "</span><br />");

	$("#modal-btn-yes").unbind();
	$("#modal-btn-yes").bind("click", function () {
		$("#confirmation-modal").modal('hide');
		boolSendEmail = true;
		if (
			funFunction != null
			) {
			funFunction();
		}
	});

	$("#modal-btn-no").unbind();
	$("#modal-btn-no").bind("click", function () {
		$("#confirmation-modal").modal('hide');
		boolSendEmail = false;
		if (
			funFunction != null
			) {
			funFunction();
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function funSendEmail(
	intJobId,
	arrintOrdersId = null
) {
	if (
		boolSendEmail
	) {
		$.ajax({
			type: "POST",
			url: "/Jobs/SendEmailToCustomer",
			data: {
				"intJobId": intJobId,
				"arrintOrdersId": arrintOrdersId
			},
			success: function (objResponse) {
				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	}
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
$(document).on("click", ".genericSwitch", function () {
	let element = $(this).children().children();
	let boolEnabled = $(this).children().children().hasClass("on");

	if (
		!boolEnabled
	) {
		element.addClass("on");
		element.closest(".genericSwitch").find("label").html("Enabled");
	}
	else {
		element.removeClass("on");
		element.closest(".genericSwitch").find("label").html("Disabled");
	}
	
	element.closest(".genericSwitch").find("input").val(!boolEnabled);
});