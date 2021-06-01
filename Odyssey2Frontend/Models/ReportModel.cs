/*TASK RP.PRODUCT*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: Sep 03, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class ReportModel
    {
        public String field { get; set; }
        public String title { get; set; }
        public double numDimensions { get; set; }
    }

    //==================================================================================================================
    public class CustomReportModel
    {
        public int? intnPk { get; set; }
        public String strDataSet { get; set; }
        public String strName { get; set; }
        public CustomReportColumnFilterModel filter { get; set; }
    }

    //==================================================================================================================
    public class CustomReportColumnFilterModel
    {
        public List<String> arrstrColumn { get; set; }
        public List<CustomReportFilter> arrFilter { get; set; }
    }

    //==================================================================================================================
    public class CustomReportFilter
    {
        public String strColumn { get; set; }
        public Filter filterFirst { get; set; }
        public Filter filterSecond { get; set; }
        public String strOperator { get; set; }
    }

    //==================================================================================================================
    public class Filter
    {
        public String strOperator { get; set; }
        public String strValue { get; set; }
    }

    //==================================================================================================================
    public class ReportRedyPrintshopModel
    {
        public List<ReportFiltersModel> arrrepPrintshop { get; set; }
        public List<ReportFiltersModel> arrrepReadyToUse { get; set; }
    }

    //==================================================================================================================
    public class ReportFiltersModel
    {
        public int intPk { get; set; }
        public String strName { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
