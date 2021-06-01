/*TASK RP. SESSION*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Odyssey2Frontend.Models;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: December 20, 2019.

namespace Odyssey2Frontend.Controllers
{

    //==================================================================================================================
    public class AppSessionContext
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //--------------------------------------------------------------------------------------------------------------
        IHttpContextAccessor httpContextAccessor;
        public AppSessionContext(IHttpContextAccessor httpContextAccessor)
        {
            this.httpContextAccessor = httpContextAccessor;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetSessionObject(SessionModel sessmod_I)
        {
            //                                              //Set the printshop on the session variable.
            httpContextAccessor.HttpContext.Session.SetString("sessionObject", JsonSerializer.Serialize(sessmod_I));
        }

        //--------------------------------------------------------------------------------------------------------------
        internal SessionModel sessmodGetSessionObject()
        {
            SessionModel sessmod = null;

            //                                              //Get the printshop id from the session variable.
            String strSessionObject =  httpContextAccessor.HttpContext.Session.GetString("sessionObject");

            if (!String.IsNullOrEmpty(strSessionObject))
            {
                sessmod = JsonSerializer.Deserialize<SessionModel>(strSessionObject);
            }

            return sessmod;
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetPrintshopId(String strPrintshop_I)
        {
            //                                              //Set the printshop on the session variable.
            httpContextAccessor.HttpContext.Session.SetString("strPrintshopId", strPrintshop_I);
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetPrintshopName(String strPrintshopName_I)
        {
            //                                              //Set the printshop on the session variable.
            httpContextAccessor.HttpContext.Session.SetString("strPrintshopName", strPrintshopName_I);
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetBoolIsAdmin(bool boolIsAdmin_I)
        {
            //                                              //Set the bool on the session variable.
            httpContextAccessor.HttpContext.Session.SetString("boolIsAdmin", JsonSerializer.Serialize(boolIsAdmin_I));
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetBoolIsOwner(bool boolIsOwner_I)
        {
            //                                              //Set the bool on the session variable.
            httpContextAccessor.HttpContext.Session.SetString("boolIsOwner", JsonSerializer.Serialize(boolIsOwner_I));
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetBoolIsSuperAdmin(bool boolIsSuperAdmin_I)
        {
            //                                              //Set the bool on the session variable.
            httpContextAccessor.HttpContext.Session.SetString("boolIsSuperAdmin", JsonSerializer
                .Serialize(boolIsSuperAdmin_I));
        }

        //--------------------------------------------------------------------------------------------------------------
        internal bool boolGetBoolIsAdmin()
        {
            //                                              //Get the bool on the session variable.
            return bool.Parse(httpContextAccessor.HttpContext.Session.GetString("boolIsAdmin") ?? "false");
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetUnreadAlerts(int intUnreadAlerts_I)
        {
            //                                              //Get the bool on the session variable.
            httpContextAccessor.HttpContext.Session.SetInt32("intUnreadAlerts", intUnreadAlerts_I);
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetContactId(int intContactId_I)
        {
            //                                              //Get the bool on the session variable.
            httpContextAccessor.HttpContext.Session.SetInt32("intContactId", intContactId_I);
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetSendAProofUrl(String strSendAProofUrl_I)
        {
            //                                              //Get the bool on the session variable.
            httpContextAccessor.HttpContext.Session.SetString("strSendAProofUrl", strSendAProofUrl_I ?? "");
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetBoolIsAccountant(bool boolIsAccountant_I)
        {
            //                                              //Set the bool on the session variable.
            httpContextAccessor.HttpContext.Session.SetString("boolIsAccountant", JsonSerializer.Serialize(
                boolIsAccountant_I));
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetBoolOfffset(bool boolOffset_I)
        {
            //                                              //Set the bool on the session variable.
            httpContextAccessor.HttpContext.Session.SetString("boolOffset", JsonSerializer.Serialize(
                boolOffset_I));
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subSetCustomerUrl(String strCustomerUrl_I)
        {
            //                                              //Set the bool on the session variable.
            httpContextAccessor.HttpContext.Session.SetString("strCustomerUrl", strCustomerUrl_I ?? "");
        }

        //--------------------------------------------------------------------------------------------------------------
        internal void subEndSession()
        {
            httpContextAccessor.HttpContext.Session.Clear();
        }
        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
