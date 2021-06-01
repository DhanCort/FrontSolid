/*TASK RP. JsonResponseModel*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (VSDT - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: February 24, 2019.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class JsonResponseModel
    {
        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.
        public int intStatus { get; set; }
        public String strDevMessage { get; set; }
        public String strUserMessage { get; set; }
        public Object objResponse { get; set; }
        public bool boolSendNotification { get; set; }
        public String strNotificationMessage { get; set; }
        public bool boolReduceNotifications { get; set; }
        public int[] arrintContactId { get; set; }
        public int[] arrintContactIdToReduce { get; set; }

        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //-------------------------------------------------------------------------------------------------------------
        public JsonResponseModel()
        {

        }

        //-------------------------------------------------------------------------------------------------------------
        public JsonResponseModel(
            int intStatus_I,
            String strUserMessage_I,
            String strDevMessage_I,
            Object objResponse_I,
            bool boolSendNotification_I,
            String strNotificationMessage_I,
            bool boolReduceNotifications_I,
            int[] arrintContactId_I,
            int[] arrintContactIdToReduce_I
            )
        {
            this.intStatus = intStatus_I;
            this.strUserMessage = strUserMessage_I;
            this.strDevMessage = strDevMessage_I;
            this.objResponse = objResponse_I;
            this.boolSendNotification = boolSendNotification_I;
            this.strNotificationMessage = strNotificationMessage_I;
            this.boolReduceNotifications = boolReduceNotifications_I;
            this.arrintContactId = arrintContactId_I;
            this.arrintContactIdToReduce = arrintContactIdToReduce_I;
        }
    }

    //==================================================================================================================
}
/*END-TASK*/
