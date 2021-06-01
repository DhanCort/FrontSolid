/*TASK RP.EMPLOYEE*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: Jun 22, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class PrintshopSupervisorEmployeeModel
    {
        public List<PrintshopEmployeeModel> arrEmployee { get; set; }
    }

    //==================================================================================================================
    public class PrintshopEmployeeModel
    {
        public String strFirstName { get; set; }
        public String strLastName { get; set; }
        public int intContactId { get; set; }
        public String strPhotoUrl { get; set; }
        public bool boolIsSupervisor { get; set; }
        public bool boolIsAccountant { get; set; }
    }

    //==================================================================================================================
    public class TaskModel
    {
        public int? intnPkTask { get; set; }
        public String strDescription { get; set; }
        public String strStartDate { get; set; }
        public String strStartTime { get; set; }
        public String strEndDate { get; set; }
        public String strEndTime { get; set; }
        public int intMinutesForNotification { get; set; }
        public bool boolIsNotifiedable { get; set; }
        public int? intnCustomerId { get; set; }
        public int? intnContactId { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
