/*TASK RP. INVOICES*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //DATE: November 11, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================

    public class CompletedOrderModel
    {
        public int intOrderId { get; set; }
        public int? intnOrderNumber { get; set; }
        public int? intnPkInvoice { get; set; }
        public bool boolAllJobsAreCompleted { get; set; }
        public JobInfoModel[] darrjobsinfo { get; set; }
    }
    
    //==================================================================================================================
    public class GenerateInvoiceModel
    {
        public int intOrderId { get; set; }
        public int[] arrintJobsIds { get; set; }
    }

    //==================================================================================================================
    public class InvoiceModel
    {
        public int intPkInvoice { get; set; }
        public int intOrderId { get; set; }
        public int? intnOrderNumber { get; set; }
        public int? intnInvoiceNumber { get; set; }
        public String strOrderDate { get; set; }
        public int intJobsQuantity { get; set; }
        public String strLogoUrl { get; set; }
        public String strShippedToFirstName { get; set; }
        public String strShippedToLastName { get; set; }
        public String strShippedToLine1 { get; set; }
        public String strShippedToLine2 { get; set; }
        public String strShippedToCity { get; set; }
        public String strShippedToState { get; set; }
        public String strShippedToZip { get; set; }
        public String strShippedToCountry { get; set; }
        public String strBilledTo { get; set; }
        public String strPayableTo { get; set; }
        public String strShippingMethod { get; set; }
        public String strTerms { get; set; }
        public String strComments { get; set; }
        public String strPO { get; set; }
        public JobDataModel[] darrinvjobinfojson { get; set; }
        public double numSubtotalTotal { get; set; }
        public double numTaxes { get; set; }
        public double numTotal { get; set; }
        public bool boolIsShipped { get; set; }
        public double numTaxPercentage { get; set; }
    }

    //==================================================================================================================
    public class InvoicePaymentModel
    {
        public int intPk { get; set; }
        public int intOrderNumber { get; set; }
    }

    //==================================================================================================================
    public class JobDataModel
    {
        public int? intnJobId { get; set; }
        public String strJobNumber { get; set; }
        public String strName { get; set; }
        public int intQuantity { get; set; }
        public double numPrice { get; set; }
        public int? intnPkAccount { get; set; }
        public int? intnPkAccountMov { get; set; }
        public String strAccount { get; set; }
        public bool boolIsExempt { get; set; }
    }

    public class JobInfoModel
    {
        public int intJobId { get; set; }
        public String strJobTicket { get; set; }
        public bool boolIsCompleted { get; set; }
        public String strJobNumber { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
