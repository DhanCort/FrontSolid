let darrColumns = null;
let fields = null;
let arrcol = null;
let objFilterCustomReport = null;

$(document).ready(function () {
    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".jobReport", function (e) {
        e.preventDefault();
        let item = $(this);
        arrcol = null;

        $.ajax({
            type: "POST",
            url: "/PrintshopReports/GetJobsReportView",
            beforeSend: function () {
                $(".jobsGrid").html('<div class="text-center">' +
                    '<i class= "fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');
            },
            success: function (objResponse) {
                $(".reportsBody").html(objResponse);
                subGetJobsDataSet();
                $(".reportOption").removeClass("active")
                item.addClass("active");
                objFilterCustomReport = null;
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnJobsDownload", function () {
        let darrjobs = getResults(".jobsGrid");

        let darrjobsmodel = new Array();
        darrjobs.forEach(function (value) {
            let jobsmodel = {
                "strJobNumber": value.strJobNumber,
                "strJobTicket": value.strJobTicket,
                "strProductName": value.strProductName,
                "strProductCategory": value.strProductCategory,
                "intnQuantity": value.intnQuantity,
                "strDateLastUpdate": moment(value.dateLastUpdate).format("YYYY-MM-DD HH:mm:ss"),
                "numProgress": value.numProgress,
                "numMinCost": value.numMinCost,
                "numMinPrice": value.numMinPrice,
                "strStartDateTime": value.strStartDateTime,
                "strEndDateTime": value.strEndDateTime
            };

            darrjobsmodel.push(jobsmodel);
        });

        $.ajax({
            type: "POST",
            url: "/PrintshopReports/DownloadJobsReport",
            data:
            {
                darrjobsmodel: darrjobsmodel,
                arrcolJobs: arrcol == null ? darrColumns : arrcol
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (response) {
                var a = document.createElement('a');
                var url = window.URL.createObjectURL(response);
                a.href = url;
                a.download = 'jobs.pdf';
                document.body.append(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".customerReport", function (e) {
        e.preventDefault();
        let item = $(this);
        arrcol = null;

        $.ajax({
            type: "POST",
            url: "/PrintshopReports/GetCustomersReportView",
            success: function (objResponse) {
                $(".reportsBody").html(objResponse);
                subGetCustomersDataSet();
                $(".reportOption").removeClass("active")
                item.addClass("active");
                objFilterCustomReport = null;
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnCustomersDownload", function () {
        let darrcustomers = getResults(".customersGrid");

        let darrcustomermodel = new Array();
        darrcustomers.forEach(function (value) {
            let customermodel = {
                "strFirstName": value.strFirstName,
                "strLastName": value.strLastName,
                "strCompanyName": value.strCompanyName,
                "strPhone": value.strPhone,
                "strCellPhone": value.strCellPhone,
                "strEmail": value.strEmail
            };

            darrcustomermodel.push(customermodel);
        });
        console.info(darrcustomers);
        console.info(darrcustomermodel);
        console.info(arrcol == null ? darrColumns : arrcol)

        $.ajax({
            type: "POST",
            url: "/PrintshopReports/DownloadCustomersReport",
            data:
            {
                darrcustomermodel: darrcustomermodel,
                arrcolCustomers: arrcol == null ? darrColumns : arrcol
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (response) {
                var a = document.createElement('a');
                var url = window.URL.createObjectURL(response);
                a.href = url;
                a.download = 'customers.pdf';
                document.body.append(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".accountReport", function (e) {
        e.preventDefault();
        let item = $(this);
        arrcol = null;

        $.ajax({
            type: "POST",
            url: "/PrintshopReports/GetAccountsReportView",
            success: function (objResponse) {
                $(".reportsBody").html(objResponse);
                subGetAccountsDataSet(null, null, null, null);
                $(".reportOption").removeClass("active")
                item.addClass("active");
                objFilterCustomReport = null;

                $('#strStartDate').datetimepicker({
                    format: "YYYY-MM-DD HH:mm"
                });

                $('#strEndDate').datetimepicker({
                    format: "YYYY-MM-DD HH:mm"
                });
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnAccountsDownload", function () {
        let darraccount = getResults(".accountsGrid");

        let darraccountmodel = new Array();
        darraccount.forEach(function (value) {
            let customermodel = {
                "strNumber": value.strNumber,
                "strName": value.strName,
                "numAmount": value.numAmount,
                "strAccountType": value.strAccountType
            };

            darraccountmodel.push(customermodel);
        });
        console.info(darraccount);
        console.info(darraccountmodel);
        console.info(arrcol == null ? darrColumns : arrcol)

        $.ajax({
            type: "POST",
            url: "/PrintshopReports/DownloadAccountsReport",
            data:
            {
                darraccountmodel: darraccountmodel,
                arrcolAccounts: arrcol == null ? darrColumns : arrcol
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (response) {
                var a = document.createElement('a');
                var url = window.URL.createObjectURL(response);
                a.href = url;
                a.download = 'accounts.pdf';
                document.body.append(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".filterJobColumns", function (e) {
        e.preventDefault();      

        subCreateColumns();

        $.ajax({
            type: "POST",
            url: "/PrintshopReports/GetJobsDataSet",
            beforeSend: function () {
                $(".jobsGrid").html('<div class="text-center">' +
                    '<i class= "fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');
            },
            success: function (objResponse) {
                $(".jobsGrid").html("")

                subCreateGrid(objResponse, fields, arrcol, ".jobsGrid", "strJobTicket", 550)
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".filterCustomerColumns", function (e) {
        e.preventDefault();

        subCreateColumns();

        $.ajax({
            type: "POST",
            url: "/PrintshopReports/GetCustomersDataSet",
            beforeSend: function () {
                $(".customersGrid").html('<div class="text-center">' +
                    '<i class= "fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');
            },
            success: function (objResponse) {
                $(".customersGrid").html("")

                subCreateGrid(objResponse, fields, arrcol, ".customersGrid", "strFirstName", 550)
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".filterAccountColumns", function (e) {
        e.preventDefault();

        subCreateColumns();

        $.ajax({
            type: "POST",
            url: "/PrintshopReports/GetAccountsDataSet",
            beforeSend: function () {
                $(".accountsGrid").html('<div class="text-center">' +
                    '<i class= "fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');
            },
            success: function (objResponse) {
                $(".accountsGrid").html("")

                subCreateGrid(objResponse, fields, arrcol, ".accountsGrid", "strNumber", 400)
            },
            error: function () {
                subSendNotification("Something is wrong.", 400);
            }
        });
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnGetAccounts", function (e) {
        let strStartDate = $("#strStartDate").val().split(" ")[0];
        let strStartTime = $("#strStartDate").val().split(" ")[1] + ":00";
        let strEndDate = $("#strEndDate").val().split(" ")[0];
        let strEndTime = $("#strEndDate").val().split(" ")[1] + ":00";

        subGetAccountsDataSet(strStartDate, strStartTime, strEndDate, strEndTime);
    })

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".btnDownloadCsv", function () {
        let gridId = $(this).attr("data-grid");
        var grid = $(gridId).data("kendoGrid");
        var originalPageSize = grid.dataSource;
        var csv = '';
        let fileName = $(this).attr("data-filename");

        // Increase page size to cover all the data and get a reference to that data
        //grid.dataSource.pageSize(grid.dataSource.view().length);
        var filters = grid.dataSource.filter();
        let data = null;

        if (filters != null) {
            var allData = grid.dataSource.data();
            var query = new kendo.data.Query(allData);
            data = query.filter(filters).data;
        }
        else {
            data = Array.from(grid.dataSource.data());
        }

        //add the header row
        for (var i = 0; i < grid.columns.length; i++) {
            var field = grid.columns[i].field;
            var title = grid.columns[i].title || field;

            //NO DATA
            if (!field) continue;

            title = title.replace(/"/g, '""');
            csv += '"' + title + '"';
            if (i < grid.columns.length - 1) {
                csv += ',';
            }
        }
        csv += '\n';

        //add each row of data
        for (var row in data) {
            for (var i = 0; i < grid.columns.length; i++) {
                var fieldName = grid.columns[i].field;
                var template = grid.columns[i].template;
                var exportFormat = grid.columns[i].exportFormat;

                //VALIDATE COLUMN
                if (!fieldName) continue;
                var value = '';
                if (fieldName.indexOf('.') >= 0) {
                    var properties = fieldName.split('.');
                    var value = data[row] || '';
                    for (var j = 0; j < properties.length; j++) {
                        var prop = properties[j];
                        value = value[prop] || '';
                    }
                }
                else {

                    value = data[row][fieldName] || '';
                }
                if (value && template && exportFormat !== false) {
                    value = _.isFunction(template)

                    if (value) {
                        value = template(data[row]);
                    }
                    else {
                        value = data[row].numProgress;
                    }
                        //? template(data[row])
                        //: kendo.template(template)(data[row]);
                }

                value = value.toString().replace(/"/g, '""');
                csv += '"' + value + '"';
                if (i < grid.columns.length - 1) {
                    csv += ',';
                }
            }
            csv += '\n';
        }

        // Reset datasource
        //grid.dataSource.pageSize(originalPageSize);

        //EXPORT TO BROWSER
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' }); //Blob.js

        var a = document.createElement('a');
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        document.body.append(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".saveCustomReport", function () {
        let obj = subCreateReportObject($(this), false);
        let datastrdataset = $(this).attr("data-strdataset");

        if (obj != null) {
            subSaveCustomReports(obj)
            //subReset(datastrdataset);
        }
        else {
            subSendNotification("Custom report needs name o select some filters or columns to save.", 300);
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".saveAsCustomReport", function () {
        let obj = subCreateReportObject($(this), true);
        let datastrdataset = $(this).attr("data-strdataset");

        if (obj != null) {
            subSaveCustomReports(obj)
            //subReset(datastrdataset);
        }
        else {
            subSendNotification("Custom report needs name o select some filters or columns to save.", 300);
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".cancelCustomReport", function () {
        let datastrdataset = $(this).attr("data-strdataset");
        subReset(datastrdataset);
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("change", ".dropdownReports", function () {
        let intReportPk = $(this).val();
        let datagrid = $(this).attr("data-grid")
        let datastrdataset = $(this).attr("data-strdataset")
        let listType = $(this).attr("data-listType")
        let boolIsSuperAdmin = JSON.parse($(this).attr("data-boolIsSuperAdmin").toLowerCase())

        objFilterCustomReport = null;

        if (intReportPk != "") {
            $.ajax({
                type: "GET",
                url: "/PrintshopReports/GetOneReportFilter",
                data: { "intPk": intReportPk },
                success: function (jsonResponse) {
                    if (jsonResponse.intStatus == 200) {

                        if (listType == "public") {
                            $(".memorizedReports").prop("disabled", false);
                            $(".superAdminReports").prop("disabled", true);

                            $(".saveCustomReport").parent().prop("hidden", false);

                            $(".dropdownReports[data-listType='superadmin']").val("");
                        }
                        else {
                            $(".memorizedReports").prop("disabled", true);
                            $(".superAdminReports").prop("disabled", false);

                            if (boolIsSuperAdmin) {
                                $(".saveCustomReport").parent().prop("hidden", false);
                            }
                            else {
                                $(".saveCustomReport").parent().prop("hidden", true);
                            }

                            $(".dropdownReports[data-listType='public']").val("");
                        }                       

                        //$(".deleteCustomReport").prop("disabled", false);
                        $("#intnReportPk").val(intReportPk)
                        $("#strName").val(jsonResponse.objResponse.strName)
                        $(".chkField").prop("checked", false);

                        let arrstrColumn = jsonResponse.objResponse.filter.arrstrColumn;
                        if (arrstrColumn != null) {
                            for (var i = 0; i < arrstrColumn.length; i++) {
                                $("#formColumns").find("#" + arrstrColumn[i]).prop("checked", true)
                            }
                        }

                        let filters = new Array();

                        let arrFilter = jsonResponse.objResponse.filter.arrFilter;

                        let strGeneralOperator = "and";

                        if (arrFilter != null) {
                            for (var i = 0; i < arrFilter.length; i++) {
                                if (
                                    arrFilter[i].filterFirst != null &&
                                    arrFilter[i].filterSecond != null
                                ) {
                                    let filtersTemp = new Array()
                                    filtersTemp.push({
                                        "field": arrFilter[i].strColumn,
                                        "operator": arrFilter[i].filterFirst.strOperator,
                                        "value": arrFilter[i].filterFirst.strValue
                                    })
                                    filtersTemp.push({
                                        "field": arrFilter[i].strColumn,
                                        "operator": arrFilter[i].filterSecond.strOperator,
                                        "value": arrFilter[i].filterSecond.strValue
                                    })

                                    let objTemp = {
                                        "filters": filtersTemp,
                                        "logic": arrFilter[i].strOperator
                                    }

                                    filters.push(objTemp);
                                }
                                else {
                                    strGeneralOperator = arrFilter[i].strOperator
                                    filters.push({
                                        "field": arrFilter[i].strColumn,
                                        "operator": arrFilter[i].filterFirst.strOperator,
                                        "value": arrFilter[i].filterFirst.strValue
                                    })
                                }
                            }

                            objFilterCustomReport = {
                                "filters": filters,
                                "logic": strGeneralOperator
                            }
                        }

                        //if (datastrdataset == "Jobs") {
                        //    $("#formColumns").find(".filterJobColumns").click();
                        //}
                        //else if (datastrdataset == "Customers") {
                        //    $("#formColumns").find(".filterCustomerColumns").click();
                        //}
                        $("#formColumns").find(".btnFilterColumns").click();

                        $(".saveAsCustomReport").parent().prop("hidden", false);
                        $(".cancelCustomReport").parent().prop("hidden", false);                      
                        
                        subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
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
    });

    //------------------------------------------------------------------------------------------------------------------
    $(document).on("click", ".deleteCustomReport", function () {
        let intPk = $(this).parent().prev().find(".dropdownReports").val();
        let datastrdataset = $(this).attr("data-strdataset");
        if (intPk != "") {
            $.ajax({
                type: "POST",
                url: "/PrintshopReports/DeleteReportFilter",
                data: { "intPk": intPk },
                success: function (jsonResponse) {
                    subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                    $(".reportOption.active").click()
                    objFilterCustomReport = null
                },
                error: function () {
                    subSendNotification("Something is wrong.", 400);
                }
            });
        }
    })

    //------------------------------------------------------------------------------------------------------------------
});

//----------------------------------------------------------------------------------------------------------------------
//                                                          //SUPPORT METHODS.

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subGetJobsDataSet() {
    $.ajax({
        type: "POST",
        url: "/PrintshopReports/GetJobsDataSet",
        success: function (objResponse) {
            fields = {
                strJobNumber: { type: "string" },
                strJobTicket: { type: "string" },
                intProductKey: { type: "number" },
                strProductName: { type: "string" },
                strProductCategory: { type: "string" },
                intnQuantity: { type: "number" },
                dateLastUpdate: { type: "date" },
                numProgress: { type: "number" },
                numMinCost: { type: "number" },
                numMinPrice: { type: "number" },
                strStartDateTime: { type: "string" },
                strEndDateTime: { type: "string" }
            }

            darrColumns = [
                {
                    field: "strJobNumber",
                    title: "Job Number"
                },
                {
                    field: "strJobTicket",
                    title: "Job Name"
                },
                //{
                //    field: "intProductKey",
                //    title: "Product Key"
                //},
                {
                    field: "strProductName",
                    title: "Product Name"
                },
                {
                    field: "strProductCategory",
                    title: "Category"
                },
                {
                    field: "intnQuantity",
                    title: "Quantity"
                },
                //{
                //    field: "dateLastUpdate",
                //    title: "Last Update",
                //    format: "{0:yyyy-MM-dd HH:mm}"
                //},
                {
                    field: "numProgress",
                    title: "Progress",
                    template: "<div class='progress' style='width: 95%'></div>"
                },
                {
                    field: "numMinCost",
                    title: "Min. Cost",
                    format: "{0:c2}"
                },
                {
                    field: "numMinPrice",
                    title: "Min Price",
                    format: "{0:c2}"
                },
                {
                    field: "strStartDateTime",
                    title: "Start"
                },
                {
                    field: "strEndDateTime",
                    title: "End"
                }
            ]

            subCreateGrid(objResponse, fields, darrColumns, ".jobsGrid", "strJobTicket", 550)
        },
        error: function () {
            subSendNotification("Something is wrong.", 400);
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subCreateColumns() {
    arrcol = new Array();

    $(".chkField:checked").each(function () {
        let field = this.value.split("|")[0];
        let title = this.value.split("|")[1];
        let format = this.value.split("|")[2];
        let template = this.value.split("|")[3];

        let obj = null;

        if (format != "") {
            obj = {
                field: field,
                title: title,
                format: format
            }
        }
        else if (template != "") {
            obj = {
                field: field,
                title: title,
                template: template
            }
        }
        else {
            obj = {
                field: field,
                title: title
            }
        }

        arrcol.push(obj)
    });

    if (arrcol.length == 0) {
        arrcol = darrColumns;
    }
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subCreateGrid(orderData_O, fields_O, columns_O, gridContainer_O, sort_O, intHeight) {
    var gridDataSource = new kendo.data.DataSource({
        data: orderData_O,
        schema: {
            model: {
                fields: fields_O
            }
        },
        pageSize: 20,
        sort: {
            field: sort_O,
            dir: "asc"
        }
    });

    if (objFilterCustomReport != null) {
        gridDataSource.filter(objFilterCustomReport)
    }

    $(gridContainer_O).kendoGrid({
        dataSource: gridDataSource,
        height: intHeight,
        pageable: true,
        sortable: true,
        filterable: true,
        columns: columns_O,
        resizable: true,
        dataBound: function (e) {
            var grid = this;
            $(".progress").each(function () {
                var row = $(this).closest("tr");
                var model = grid.dataItem(row);
                //console.info(model)
                $(this).kendoProgressBar({
                    value: model.numProgress,
                    max: 100
                });
            });
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function getJobsResults() {
    var dataSource = $(".reportsBody").data("kendoGrid").dataSource;
    var filters = dataSource.filter();
    var allData = dataSource.data();
    var query = new kendo.data.Query(allData);
    var data = query.filter(filters).data;

    return Array.from(data);
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subGetCustomersDataSet() {
    $.ajax({
        type: "POST",
        url: "/PrintshopReports/GetCustomersDataSet",
        success: function (objResponse) {

            fields = {
                intContactId: { type: "number" },
                intnCompanyId: { type: "number" },
                strCompanyName: { type: "string" },
                intnBranchId: { type: "number" },
                strBranchName: { type: "string" },
                strFirstName: { type: "string" },
                strLastName: { type: "string" },
                strEmail: { type: "string" },
                strPhone: { type: "string" },
                strCellPhone: { type: "string" }
            }

            darrColumns = [
                {
                    field: "strFirstName",
                    title: "Name"
                },
                {
                    field: "strLastName",
                    title: "Last Name"
                },
                {
                    field: "strCompanyName",
                    title: "Company"
                },
                {
                    field: "strPhone",
                    title: "Phone"
                },
                {
                    field: "strCellPhone",
                    title: "Cell Phone"
                },
                {
                    field: "strEmail",
                    title: "Email"
                }
            ]

            subCreateGrid(objResponse, fields, darrColumns, ".customersGrid", "strJobTicket", 550)
        },
        error: function () {
            subSendNotification("Something is wrong.", 400);
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subGetAccountsDataSet(
    strStartDate,
    strStartTime,
    strEndDate,
    strEndTime
) {
    $.ajax({
        type: "POST",
        url: "/PrintshopReports/GetAccountsDataSet",
        data: {
            "strStartDate": strStartDate,
            "strStartTime": strStartTime,
            "strEndDate": strEndDate,
            "strEndTime": strEndTime
        },
        success: function (objResponse) {

            fields = {
                strNumber: { type: "string" },
                strName: { type: "string" },
                numAmount: { type: "number" },
                strAccountType: { type: "string" }
            }

            darrColumns = [
                {
                    field: "strNumber",
                    title: "Number"
                },
                {
                    field: "strName",
                    title: "Name"
                },
                {
                    field: "numAmount",
                    title: "Amount"
                },
                {
                    field: "strAccountType",
                    title: "Type"
                }
            ]

            subCreateGrid(objResponse, fields, darrColumns, ".accountsGrid", "strNumber", 400)
        },
        error: function () {
            subSendNotification("Something is wrong.", 400);
        }
    });
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function getResults(grid) {
    var dataSource = $(grid).data("kendoGrid").dataSource;
    var filters = dataSource.filter();
    var allData = dataSource.data();
    var query = new kendo.data.Query(allData);
    var data = query.filter(filters).data;

    return Array.from(data);
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subCreateReportObject(element, boolIsSaveAs) {
    //                                                  //This boolean will help to check if we have some filters
    let boolHasFilters = false;

    //                                                  //This boolean will help to check if the report has name
    let boolHasName = false;

    //                                                  //Get data grid context
    let strGrid = element.attr("data-grid")

    //                                                  //Get dataset "Jobs", "Customers", etc
    let strDataSet = element.attr("data-strdataset")

    //                                                  //Getting report pk.
    let intnPk = boolIsSaveAs == true ? null : $("#intnReportPk").val()

    //                                                  //Get report name from input
    let strName = $("#strName").val();

    //                                                  //Check if name exists
    if (strName != "") {
        boolHasName = true;
    }

    //                                                  //Create array to save columns showing in the grid
    let arrstrColumns = new Array();

    //                                                  //Get columns from the grid
    let columns = $(strGrid).data("kendoGrid").options.columns;

    //                                                  //If the array cointains one element or more, columns will
    //                                                  //  will be save in the array
    if (columns.length > 0) {
        //                                              //Boolean is true when filters exists
        boolHasFilters = true;

        for (var i = 0; i < columns.length; i++) {
            arrstrColumns.push(columns[i].field)
        }
    }

    //                                                  //Create array to save filters showing in the grid
    let arrFilter = new Array();

    //                                                  //Get grid datasource
    let dataSource = $(strGrid).data("kendoGrid").dataSource;

    console.info(dataSource.filter())

    if (dataSource.filter() != undefined) {
        //                                                  //Get selected filters in grid
        let filters = dataSource.filter().filters;

        //                                                  //If the array cointains one element or more, filters will
        //                                                  //  will be save in the array
        if (filters.length > 0) {
            //                                              //Boolean is true when filters exists
            boolHasFilters = true;

            for (var i = 0; i < filters.length; i++) {

                //                                          //If object contains an array
                if (filters[i].logic != undefined) {

                    //                                      //Getting filtered column
                    let strColumn = filters[i].filters[0].field;

                    //                                      //Creating filterFisrt object
                    let filterFirst = {
                        "strOperator": filters[i].filters[0].operator,
                        "strValue": filters[i].filters[0].value
                    };

                    //                                      //Creating filterSecond object
                    let filterSecond = {
                        "strOperator": filters[i].filters[1].operator,
                        "strValue": filters[i].filters[1].value
                    };

                    //                                      //Getting logic operator
                    let strOperator = filters[i].logic;

                    //                                      //Crrating object with filter
                    let obj = {
                        "strColumn": strColumn,
                        "filterFirst": filterFirst,
                        "filterSecond": filterSecond,
                        "strOperator": strOperator
                    }

                    //                                      //Save in array
                    arrFilter.push(obj)
                }
                else {
                    //                                      //Getting filtered column
                    let strColumn = filters[i].field;

                    //                                      //Creating filterFisrt object
                    let filterFirst = {
                        "strOperator": filters[i].operator,
                        "strValue": filters[i].value
                    };

                    //                                      //Crrating object with filter
                    let obj = {
                        "strColumn": strColumn,
                        "filterFirst": filterFirst,
                        "filterSecond": null,
                        "strOperator": dataSource.filter().logic
                    }

                    //                                      //Save in array
                    arrFilter.push(obj)
                }
            }
        }
    }

    let objFilter = {
        "arrstrColumn": arrstrColumns,
        "arrFilter": arrFilter
    }

    //console.info(arrFilter)

    let obj = null;
    //                                                  //If user has filters
    if (boolHasFilters && boolHasName) {
        obj = {
            "intnPk": intnPk,
            "strDataSet": strDataSet,
            "strName": strName,
            "filter": objFilter
        }
    }

    return obj;
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subSaveCustomReports(customReportObject) {
    $.ajax({
        type: "POST",
        url: "/PrintshopReports/SetReportFilter",
        data: { "customReport": customReportObject },
        success: function (jsonResponse) {
            if (jsonResponse.intStatus == 200) {
                subSendNotification(jsonResponse.strUserMessage, jsonResponse.intStatus);
                $(".reportOption.active").click()
                objFilterCustomReport = null
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

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function subReset(datastrdataset) {
    $(".saveCustomReport").parent().prop("hidden", false);
    $(".saveAsCustomReport").parent().prop("hidden", true);
    $(".cancelCustomReport").parent().prop("hidden", true);
    $(".deleteCustomReport").prop("disabled", true);
    $("#intnReportPk").val("")
    $("#strName").val("")
    objFilterCustomReport = null;

    $(".dropdownReports").val("").change();

    $(".chkField").prop("checked", true);
    //if (datastrdataset == "Jobs") {
    //    $("#formColumns").find(".filterJobColumns").click();
    //}
    //else if (datastrdataset == "Customers") {
    //    $("#formColumns").find(".filterCustomerColumns").click();
    //}
    $("#formColumns").find(".btnFilterColumns").click();    

    $(".deleteCustomReport").prop("disabled", true)
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -