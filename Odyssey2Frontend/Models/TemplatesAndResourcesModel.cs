/*TASK RP.RESOURCE*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: February 24, 2019.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class ObjIsDispensableResponse
    {
        public int intStatus { get; set; }
        public String strDevMessage { get; set; }
        public String strUserMessage { get; set; }
        public bool? objResponse { get; set; }
    }

    //==================================================================================================================
    public class ObjTemplatesAndResourcesResponse
    {
        public int intStatus { get; set; }
        public String strDevMessage { get; set; }
        public String strUserMessage { get; set; }
        public TemplatesAndResourcesModel objResponse { get; set; }

    }

    //==================================================================================================================
    public class TemplatesAndResourcesModel
    {
        public List<MyResourcesModel> arrpePathElement { get; set; }
        public List<MyResourcesModel> arrattr { get; set; }
        public List<MyResourcesModel> arrtem { get; set; }
        public List<MyResourcesModel> arrres { get; set; }
        public bool boolIsPhysical { get; set; }
        public bool boolIDeviceToolOrCustom { get; set; }
    }

    //==================================================================================================================
    public class ResourceAvailability
    {
        public int intPkResource { get; set; }
        public bool boolIsCalendar { get; set; }
        public bool? boolnIsAvailable { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
