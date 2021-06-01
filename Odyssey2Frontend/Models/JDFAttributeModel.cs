/*TASK RP. TASK ATTRIBUTE*/
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: November 22, 2019.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class JDFAttributeModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //PROPERTIES.

        public int intPk { get; set; }
        public int intTemplatePk { get; set; }
        public String strCustomName { get; set; }
        public String strCardinality { get; set; }
        public String strDatatype { get; set; }
        public String strDescription { get; set; }
        public bool boolIsGeneral { get; set; }
        public List<int> arrintAttributePk { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
