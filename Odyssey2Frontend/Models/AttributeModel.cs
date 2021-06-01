/*TASK RP. TASK PROCCESS TEMPLATE*/
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

//                                                          //AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: December 2, 2019.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class AttributeModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //PROPERTIES.
        [JsonProperty(PropertyName = "intPk")]
        public int? intnPk { get; set; }

        [JsonProperty(PropertyName = "strCustomName")]
        public String strCustomName { get; set; }

        [JsonProperty(PropertyName = "strXJDFName")]
        public String strXJDFName { get; set; }

        [JsonProperty(PropertyName = "strCardinality")]
        public String strCardinality { get; set; }

        [JsonProperty(PropertyName = "strDatatype")]
        public String strDatatype { get; set; }

        [JsonProperty(PropertyName = "strDescription")]
        public String strDescription { get; set; }

        [JsonProperty(PropertyName = "intWebsiteElementId")]
        public int? intWebsiteElementId  { get; set; }

        [JsonProperty(PropertyName = "strCategoryName")]
        public String strCategoryName { get; set; }

        [JsonProperty(PropertyName = "arrstrValues")]
        public List<String> arrstrValues { get; set; }

        public String strValue { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
