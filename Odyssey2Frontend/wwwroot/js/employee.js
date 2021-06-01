let currentDate = null;
let boolIsFromMyEmployees = null;
$(document).ready(function () {
	//------------------------------------------------------------------------------------------------------------------
	$('#strStartDateTimeTask').datetimepicker({
		format: "YYYY-MM-DD HH:mm"
	});

	//------------------------------------------------------------------------------------------------------------------
	$('#strEndDateTimeTask').datetimepicker({
		format: "YYYY-MM-DD HH:mm"
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".showMyCalendar", function (e) {
		e.preventDefault();
		let strDate = moment().format("YYYY-MM-DD");
		let intnContactId = $(this).data("contactid");
		let strEmployeeName = $(this).data("employee-name");
		boolIsFromMyEmployees = $(this).attr("data-boolIsFromMyEmployees");
		getEmployeeCalendar(strDate, intnContactId, strEmployeeName);
	});

	//------------------------------------------------------------------------------------------------------------------
	$("[name = 'strEmployee']").keypress(function (e) {
		let form = $("#frmSearchEmployee");
		if (e.which == 13) {
			form.submit();
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(".searchEmployee").click(function (e) {
		let form = $("#frmSearchEmployee");
		form.submit();
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#jobPrevDayEmployee", function () {
		let previousDay = moment(currentDate, "YYYY-MM-DD").add(-1, 'days').format('YYYY-MM-DD');
		let intnContactId = $(this).data("contactid");
		currentDate = previousDay;
		setDate(currentDate);
		getEmployeePeriods(currentDate, intnContactId);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#jobNextDayEmployee", function () {
		var nextDay = moment(currentDate, "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD');
		let intnContactId = $(this).data("contactid");
		currentDate = nextDay;
		setDate(currentDate);
		getEmployeePeriods(currentDate, intnContactId);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#goToJobDateNowEmployee", function () {
		let day = moment().format("YYYY-MM-DD");
		let intnContactId = $(this).data("contactid");
		currentDate = day;
		setDate(currentDate);
		getEmployeePeriods(currentDate, intnContactId);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#overdueTasks-pill", function () {
		let intnContactId = $(this).data("contactid");
		funGetOverdueTasks(intnContactId);
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#allTasks-pill", function () {
		let intnContactId = $(this).data("contactid");

		$.ajax({
			type: "GET",
			url: "/PrintshopEmployees/GetAllTasks",
			data: {
				"intnContactId": intnContactId
			},
			success: function (objResponse) {
				$("#allTasks").html(objResponse);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnStartEmployeeTask", function () {
		let btnElement = $(this);
		let intPkPeriod = $(this).data("intnpkperiod");
		let intJobId = $(this).data("strjobid");
		let strPrintshopId = $(".btnNotif").attr("data-strPrintshopId");

		$.ajax({
			type: "POST",
			url: "/PrintshopEmployees/SetFinalStart",
			data: {
				"intPkPeriod": intPkPeriod
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					if (objResponse.boolSendNotification) {
						connection.invoke("SendToAFew", strPrintshopId, objResponse.arrintContactId,
							objResponse.strNotificationMessage);
					}

					if (objResponse.boolReduceNotifications) {
						connection.invoke("ReduceToAFew", strPrintshopId, objResponse.arrintContactIdToReduce);
					}

					let intNotification = parseInt($(".countNotif").html())
					if (intNotification != 0) {
						$(".countNotif").html(intNotification - 1);
					}

					if (parseInt($(".countNotif").html()) == 0) {
						$(".btnNotif").css("background-color", "#939598");
					}

					btnElement.next().removeAttr("disabled");
					btnElement.next().next().removeAttr("disabled");
					btnElement.attr("disabled", true);

					if (
						//									//Validate if the email dialog needs to be open.
						objResponse.objResponse
					) {
						funShowEmailDialog("The order has been already started.<br />" +
							"Would you like to send an email to your customer?", function () { funSendEmail(intJobId) });
					}
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnEndEmployeeTask", function () {
		let btnElement = $(this);
		let intPkPeriod = $(this).data("intnpkperiod");
		let intJobId = $(this).data("strjobid");
		let strPrintshopId = $(".btnNotif").attr("data-strPrintshopId");

		$.ajax({
			type: "POST",
			url: "/PrintshopEmployees/SetFinalEnd",
			data: {
				"intPkPeriod": intPkPeriod
			},
			success: function (objResponse) {
				if (
					objResponse.intStatus == 200
				) {
					if (objResponse.boolSendNotification) {
						connection.invoke("SendToAFew", strPrintshopId, objResponse.arrintContactId,
							objResponse.strNotificationMessage);
					}

					if (objResponse.boolReduceNotifications) {
						connection.invoke("ReduceToAFew", strPrintshopId, objResponse.arrintContactIdToReduce);
					}

					btnElement.attr("disabled", true);

					if (
						//									//Validate if the email dialog needs to be open.
						objResponse.objResponse
					) {
						funShowEmailDialog("The order has been completed.<br />" +
							"Would you like to send an email to your customer?", function () { funSendEmail(intJobId) });
					}
				}

				subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#intMinutesForNotification").keyup(function () {
		let strMinutes = $(this).val().toLowerCase();

		if (/^[0-9]+$/.test(strMinutes)) {
			console.info("valida")
		}
		else {
			$(this).val('');
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$('#modalAddTask').on('hidden.bs.modal', function () {
		$("#btnSaveTask").removeAttr("data-intnPkTask")
		$("#formTask").find("#strDescription").val('')
		$("#formTask").find("#strStartDateTimeTask").val('')
		$("#formTask").find("#strEndDateTimeTask").val('')
		$("#formTask").find("#intMinutesForNotification").val('')
		$("#formTask").find("#boolIsNotifiedable").prop('checked', false)
		$("#modalAddTask").find(".modal-title").html("Add task")
	})

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", "#btnAddTask", function () {
		let boolIsOverdue = $(this).attr("data-boolIsOverdue");
		$("#formTask").attr("data-boolIsOverdue", boolIsOverdue);

		$.ajax({
			type: "GET",
			url: "/PrintshopContacts/GetAllForAPrintshop",
			data: null,
			success: function (objResponse) {
				if (objResponse.intStatus == 200) {
					$("#modalAddTask").modal("show");
					let arrCustomers = objResponse.objResponse;
					let select = $(".selectCustomer");
					select.html("");

					option = document.createElement("option");
					option.value = "";
					option.text = "-";
					select.append(new Option(option.text, option.value));

					for (var i = 0; i < arrCustomers.length; i++) {
						var obj = arrCustomers[i];
						option = document.createElement("option");
						option.value = obj.intContactId;
						option.text = obj.strFirstName;
						if (obj.strLastName != null) {
							option.text = obj.strFirstName + " " + obj.strLastName;
						}
						select.append(new Option(option.text, option.value));
					}
				}
			}
		});
	})

	//------------------------------------------------------------------------------------------------------------------
	$("#btnSaveTask").click(function () {
		let btnSaveTask = $(this);
		let boolIsOverdue = $("#formTask").attr("data-boolIsOverdue");

		if (
			($("#boolIsNotifiedable").prop("checked")) &&
			($("#formTask").find("#intMinutesForNotification").val().replace(" ").length == 0)
		) {
			subSendNotification("Please, enter the minutes", 400);
		}
		else {
			let obj = {
				"intnPkTask": btnSaveTask.attr("data-intnPkTask") == "" ? null : btnSaveTask.attr("data-intnPkTask"),
				"strDescription": $("#formTask").find("#strDescription").val(),
				"strStartDate": $("#formTask").find("#strStartDateTimeTask").val().split(" ")[0],
				"strStartTime": $("#formTask").find("#strStartDateTimeTask").val().split(" ")[1] + ":00",
				"strEndDate": $("#formTask").find("#strEndDateTimeTask").val().split(" ")[0],
				"strEndTime": $("#formTask").find("#strEndDateTimeTask").val().split(" ")[1] + ":00",
				"intMinutesForNotification": $("#formTask").find("#intMinutesForNotification").val(),
				"intnContactId": $("#intnContactId").val(),
				"boolIsNotifiedable": $("#formTask").find("#boolIsNotifiedable").is(':checked')
			}

			//console.info(obj)
			$.ajax({
				type: "POST",
				url: "/PrintshopEmployees/SetTask",
				data: obj,
				success: function (objResponse) {
					if (objResponse.intStatus == 200) {
						$("#modalAddTask").modal("hide");

						if (
							boolIsOverdue != "True"
						) {
							btnSaveTask.removeAttr("data-intnPkTask")
							currentDate = $("#formTask").find("#strStartDateTimeTask").val().split(" ")[0];
							setDate(currentDate);
							getEmployeePeriods($("#formTask").find("#strStartDateTimeTask").val().split(" ")[0], null);
						}
						else {
							funGetOverdueTasks();
							$("#formTask").removeAttr("data-boolIsOverdue");
						}
					}
					else {
						subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
					}
				},
				error: function () {
					subSendNotification(objResponse.strUserMessage, objResponse.intStatus);
				}
			});
		}
	})

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnEditTask", function () {
		let intnPkTask = $(this).attr("data-intnPkTask");
		let boolIsOverdue = $(this).attr("data-boolIsOverdue");
		let arrCustomers = null;
		$.ajax({
			type: "GET",
			url: "/PrintshopEmployees/GetTask",
			data: { "intPkTask": intnPkTask },
			success: function (jsonResponse) {
				if (jsonResponse.intStatus == 200) {
					$.when(
						$.ajax({
							type: "GET",
							url: "/PrintshopContacts/GetAllForAPrintshop",
							data: null,
							success: function (objResponse) {
								if (objResponse.intStatus == 200) {
									arrCustomers = objResponse.objResponse;
								}
							}
						})
					).then(function () {
						$("#btnSaveTask").attr("data-intnPkTask", jsonResponse.objResponse.intnPkTask);
						$("#formTask").find("#strDescription").val(jsonResponse.objResponse.strDescription);
						$("#formTask").attr("data-boolIsOverdue", boolIsOverdue)
						$("#formTask").find("#strStartDateTimeTask").val(jsonResponse.objResponse.strStartDate + " " +
							jsonResponse.objResponse.strStartTime.substring(0, 5));
						$("#formTask").find("#strEndDateTimeTask").val(jsonResponse.objResponse.strEndDate + " " +
							jsonResponse.objResponse.strEndTime.substring(0, 5));
						$("#formTask").find("#intMinutesForNotification").val(
							jsonResponse.objResponse.intMinutesForNotification);
						$("#formTask").find("#boolIsNotifiedable").prop('checked',
							jsonResponse.objResponse.boolIsNotifiedable);
						$("#modalAddTask").find(".modal-title").html("Edit task");

						let select = $("#modalAddTask").find(".selectCustomer");
						select.html("");

						option = document.createElement("option");
						option.value = "";
						option.text = "-";
						select.append(new Option(option.text, option.value));

						for (var i = 0; i < arrCustomers.length; i++) {
							var obj = arrCustomers[i];
							option = document.createElement("option");
							option.value = obj.intContactId;
							option.text = obj.strFirstName;
							if (obj.strLastName != null) {
								option.text = obj.strFirstName + " " + obj.strLastName;
							}
							select.append(new Option(option.text, option.value));
						}

						if (jsonResponse.objResponse.intnCustomerId != null) {
							let intCostumerId = jsonResponse.objResponse.intnCustomerId;
							$("#modalAddTask").find(".selectCustomer").val(intCostumerId).change();
						}
						$("#modalAddTask").modal("show");
					});
				}
				else {
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				}
			},
			error: function (jsonResponse) {
				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".btnDeleteTask", function () {
		let intnPkTask = $(this).attr("data-intnPkTask");
		let strStartDate = $(this).attr("data-strStartDate")
		let boolIsOverdue = $(this).attr("data-boolIsOverdue");

		$.ajax({
			type: "GET",
			url: "/PrintshopEmployees/DeleteTask",
			data: { "intnPkTask": intnPkTask },
			success: function (jsonResponse) {
				if (jsonResponse.intStatus == 200) {
					if (
						boolIsOverdue != "True"
					) {
						currentDate = strStartDate;
						setDate(currentDate);
						getEmployeePeriods(strStartDate, null);
					}
					else {
						funGetOverdueTasks();
					}
				}
				else {
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				}
			},
			error: function (jsonResponse) {
				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("click", ".completeTask", function () {
		let intnPkTask = $(this).attr("data-intnPkTask");
		let boolIsOverdue = $(this).attr("data-boolIsOverdue");

		$.ajax({
			type: "GET",
			url: "/PrintshopEmployees/CompleteTask",
			data: { "intnPkTask": intnPkTask },
			success: function (jsonResponse) {
				if (jsonResponse.intStatus == 200) {
					if (
						boolIsOverdue != "True"
					) {
						$(".disableIfCompleted[data-intnpktask='" + intnPkTask + "'").prop("disabled", true);
					}
					else {
						funGetOverdueTasks();
					}

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
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", "#boolIsNotifiedable", function () {
		if ($(this).is(":checked")) {
			$(this).parent().next().find("#intMinutesForNotification").removeAttr("disabled")
		}
		else {
			$(this).parent().next().find("#intMinutesForNotification").attr("disabled", "disabled")
			$(this).parent().next().find("#intMinutesForNotification").val("")
		}
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".chkSupervisor", function () {
		let intContactId = $(this).attr("data-intcontactid");
		let boolIsSupervisor = $(this).is(":checked");
		let element = $(this);

		$.ajax({
			type: "GET",
			url: "/PrintshopEmployees/SetRole",
			data: {
				"intContactId": intContactId,
				"boolnIsSupervisor": boolIsSupervisor
			},
			success: function (jsonResponse) {
				if (jsonResponse.intStatus == 200) {
					location.reload();
				}
				else {
					element.prop('checked', !boolIsSupervisor);
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				}
			},
			error: function (jsonResponse) {
				element.prop('checked', !boolIsSupervisor);
				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$(document).on("change", ".chkAccountant", function () {
		let intContactId = $(this).attr("data-intcontactid");
		let boolIsAccountant = $(this).is(":checked");
		let element = $(this);

		$.ajax({
			type: "GET",
			url: "/PrintshopEmployees/SetRole",
			data: {
				"intContactId": intContactId,
				"boolnIsAccountant": boolIsAccountant
			},
			success: function (jsonResponse) {
				if (jsonResponse.intStatus == 200) {
					location.reload();
				}
				else {
					element.prop('checked', !boolIsAccountant);
					subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
				}
			},
			error: function (jsonResponse) {
				element.prop('checked', !boolIsAccountant);
				subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------
//                                                          //SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function setDate(strDate) {
	let date = moment(strDate, "YYYY-MM-DD").format("MMMM Do YYYY");
	$(".divMonthEmployee").html(date)
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getEmployeeCalendar(strDate, intnContactId, strEmployeeName) {
	$.ajax({
		type: "GET",
		url: "/PrintshopEmployees/GetEmployeeCalendar",
		beforeSend: function () {
			$("#mi4pMasterModalBody").html("")
		},
		data: { "strDay": strDate, "boolIsMain": true, "intnContactId": intnContactId },
		success: function (objRespose) {
			$("#mi4pMasterModalBody").html(objRespose)
			let date = moment(strDate, "YYYY-MM-DD").format("MMMM Do YYYY");
			$(".divMonthEmployee").html(date)
			$("#mi4pMasterModalDialog").addClass("modal-md")
			$("#mi4pMasterModalTitle").html(strEmployeeName);

			if (boolIsFromMyEmployees == "false") {
				$("#mi4pMasterModalBody").find(".disableIfIsAdmin").prop("disabled", false);
			}
			else {
				$("#mi4pMasterModalBody").find(".disableIfIsAdmin").prop("disabled", true);
			}

			$("#mi4pMasterModalBody").find(".disableIfCompleted").each(function (index, value) {
				let boolIsCompleted = JSON.parse($(this).attr("data-booliscompleted").toLowerCase());
				if (boolIsCompleted) {
					$(this).prop("disabled", true);
				}
				else {
					$(this).prop("disabled", false);
				}
			});

			$("#mi4pMasterModal").modal("show");

			currentDate = strDate;
		},
		error: function (objRespose) {
			subSendNotification("Something is wrong.", 400);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getEmployeePeriods(strDate, intnContactId) {
	$.ajax({
		type: "POST",
		url: "/PrintshopEmployees/GetEmployeeCalendar",
		beforeSend: function () {
			$("#employeeCalendar").html("")
		},
		data: { "strDay": strDate, "boolIsMain": false, "intnContactId": intnContactId },
		success: function (objRespose) {
			$("#employeeCalendar").html(objRespose)

			if (boolIsFromMyEmployees == "false") {
				$("#mi4pMasterModalBody").find(".disableIfIsAdmin").prop("disabled", false);
			}
			else {
				$("#mi4pMasterModalBody").find(".disableIfIsAdmin").prop("disabled", true);
			}

			$("#mi4pMasterModalBody").find(".disableIfCompleted").each(function (index, value) {
				let boolIsCompleted = JSON.parse($(this).attr("data-booliscompleted").toLowerCase());
				if (boolIsCompleted) {
					$(this).prop("disabled", true);
				}
				else {
					$(this).prop("disabled", false);
				}
			});

			currentDate = strDate;
		},
		error: function () {
			subSendNotification(objRespose.strUserMessage, objRespose.intStatus);
		}
	});
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function funGetOverdueTasks(intnContactId = null) {
	$.ajax({
		type: "GET",
		url: "/PrintshopEmployees/GetOverdueTasks",
		data: {
			"intnContactId": intnContactId
		},
		success: function (objResponse) {
			//$("#mi4pMasterModalBody").find("button, .divMonthEmployee").attr("hidden", true);
			$("#overdueTasks").html(objResponse);
		},
		error: function () {
			subSendNotification("Something is wrong.", 400);
		}
	});
}