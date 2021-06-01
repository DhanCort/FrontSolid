//------------------------------------------------------------------------------------------------------------------
let data_boolIsLogged = JSON.parse($(".boolIsLogged").attr("data-boolIsLogged").toLowerCase());
if (!data_boolIsLogged) {
    Cookies.set("boolIsLogged", "false");
}

//------------------------------------------------------------------------------------------------------------------
$(".logOut").click(function (e) {
    e.preventDefault();

    $.ajax({
        type: "GET",
        url: "/Base/Logout",
        success: function () {
            connection.stop();
            Cookies.set("boolIsLogged", "false");
            window.location.href = "/Home/Index";
        },
        error: function () {
            subSendNotification("Something is wrong.", 400);
        }
    });
});

let boolIsLogged = Cookies.get("boolIsLogged");
console.info(boolIsLogged)

if (boolIsLogged == "true") {

    var localUrl = window.location.origin.split(":")[0] + ":" + window.location.origin.split(":")[1] + ":5001/connectionHub";
    console.info(localUrl)
    var serverUrl = "http://201.149.34.46:5003/connectionHub";
    var strGroupName = $(".btnNotif").attr("data-strPrintshopId");

    var connection = new signalR.HubConnectionBuilder().withUrl(localUrl, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
    }).build();

    //------------------------------------------------------------------------------------------------------------------
    connection.start().then(function () {
        console.log("connected");
        connection.invoke('getConnectionId')
            .then(function (connectionId) {
                sessionStorage.setItem('conectionId', connectionId);
                connection.invoke("CreateGroup", connectionId, strGroupName);
            }).catch(err => console.error(err.toString()));
    });

    //------------------------------------------------------------------------------------------------------------------
    connection.on("AlertForAll", function (message) {
        $(".btnNotif").css("background-color", "#dc3545")
        let intNotification = parseInt($(".countNotif").html())
        $(".countNotif").html(intNotification + 1);

        $.notify({
            title: '<strong>Odyssey 2</strong>',
            icon: "fa fa-bell",
            message: message
        },
            {
                placement: {
                    from: 'bottom',
                    align: 'right'
                }
            }
        );

        console.log(message);
    });

    //------------------------------------------------------------------------------------------------------------------
    connection.on("AlertForAFew", function (strCxContactId, message) {
        let strContactId = $(".btnNotif").attr("data-intcontactid");
        let intIndex = strCxContactId.search(strContactId);
        if (
            intIndex > -1
        ) {
            $(".btnNotif").css("background-color", "#dc3545")
            let intNotification = parseInt($(".countNotif").html())
            $(".countNotif").html(intNotification + 1);

            $.notify({
                title: '<strong>Odyssey 2</strong>',
                icon: "fa fa-bell",
                message: message
            },
                {
                    placement: {
                        from: 'bottom',
                        align: 'right'
                    }
                }
            );
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    connection.on("ReduceForAll", function () {
        let intNotification = parseInt($(".countNotif").html())
        if (intNotification != 0) {
            $(".countNotif").html(intNotification - 1);
        }

        if (parseInt($(".countNotif").html()) == 0) {
            $(".btnNotif").css("background-color", "#939598");
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    connection.on("ReduceForAFew", function (strCxContactId) {
        let strContactId = $(".btnNotif").attr("data-intcontactid");
        let intIndex = strCxContactId.search(strContactId);
        if (
            intIndex > -1
        ) {
            let intNotification = parseInt($(".countNotif").html())
            if (intNotification != 0) {
                $(".countNotif").html(intNotification - 1);
            }

            if (parseInt($(".countNotif").html()) == 0) {
                $(".btnNotif").css("background-color", "#939598");
            }
        }
    });
}