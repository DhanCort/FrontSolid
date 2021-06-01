$(document).ready(function () {
	//------------------------------------------------------------------------------------------------------------------
	$("#workflows-pill").click(function () {
		$.ajax({
			type: "GET",
			url: "/PrintshopWorkflows/GetBase",
			beforeSend: function () {
				$("#myWorkflowSection").children("div").html('<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span' +
					' class="sr-only"></span>');
			},
			success: function (objResponse) {
				$("#myWorkflowSection").children("div").html(objResponse);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});

	//------------------------------------------------------------------------------------------------------------------
	$("#generic-pill").click(function () {
		$.ajax({
			type: "get",
			url: "/PrintshopWorkflows/GetGenerics",
			beforeSend: function () {
				$("#genericWorkflowsSection").children("div").html('<i class="fa fa-spinner fa-pulse fa-3x fa-fw">' +
					'</i><span class="sr-only"></span>');
			},
			success: function (objResponse) {
				$("#genericWorkflowsSection").children("div").html(objResponse);
			},
			error: function () {
				subSendNotification("Something is wrong.", 400);
			}
		});
	});
});