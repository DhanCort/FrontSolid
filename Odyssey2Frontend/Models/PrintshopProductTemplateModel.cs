/*TASK RP. TASK PROCCESS TEMPLATE*/
using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: November 26, 2019.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class PrintshopProductTemplateModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //PROPERTIES.
        [Required]
        public String strPrintshopId { get; set; }

        [JsonProperty(PropertyName = "strTemplateId")]
        public String strTemplateId { get; set; }

        [JsonProperty(PropertyName = "intWebsiteProductKey")]
        public int intWebsiteProductKey { get; set; }

        [JsonProperty(PropertyName = "strCategoryName")]
        public String strCategory { get; set; }

        [JsonProperty(PropertyName = "intPk")]
        public int intPk { get; set; }

        [Required]
        [JsonProperty(PropertyName = "strXJDFType")]
        public String strType { get; set; }

        [JsonProperty(PropertyName = "strXJDFType")]
        public String strXJDFType { get; set; }
        public String strTypeId { get; set; }
        public int? intnPkAccount { get; set; }
        public String strGuidedLink { get; set; }

    }

    //==================================================================================================================
    public class ProductAccountModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //PROPERTIES.
        public int intPkProduct { get; set; }
        public int intPkAccount { get; set; }
    }

    //==================================================================================================================
    public class ProductProcessesInWorkflowModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //PROPERTIES.

        public int intPk { get; set; }
        public String strName { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
