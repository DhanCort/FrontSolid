/*TASK RP.LOGIN*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: April 14, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class PrintshopUserModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.
        public List<PrintshopModel> arrps { get; set; }
        public bool boolIsAdmin { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }


    //==================================================================================================================
    public class PrintshopModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public String strName { get; set; }
        public int intPrintshopId { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
    public class LoginModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public String strPrintshopId { get; set; }
        public String strEmail { get; set; }
        public String strPassword { get; set; }
        public String strTimeZone { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
    public class SessionModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public String strToken { get; set; }
        public String strUserFirstName { get; set; }
        public String strUserLastName { get; set; }
        public String strPrintshopId { get; set; }
        public String strPrintshopName { get; set; }
        public bool boolIsAdmin { get; set; }
        public bool boolIsOwner { get; set; }
        public bool boolIsSuperAdmin { get; set; }
        public bool boolIsAccountant { get; set; }
        public int intUnreadAlerts { get; set; }
        public String strSendAProofUrl { get; set; }
        public int intContactId { get; set; }
        public bool boolOffset { get; set; }
        public String strCustomerUrl { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
    public class SpecialPasswordModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public string strCurrentPassword { get; set; }
        public string strNewPassword { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
    public class AlertModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES.

        public string strAlertType { get; set; }
        public string strAlertDescription { get; set; }
        public bool? boolnJob { get; set; }
        public bool boolInEstimating { get; set; }
        public int? intnJobId { get; set; }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
