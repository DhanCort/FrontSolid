/*TASK RP. TASK PROCCESS TEMPLATE*/
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF-Liliana Gutierrez).
//                                                          //DATE: November 26, 2019.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class PrintshopProcessTemplateModel
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //PROPERTIES.
        public int intPk { get; set; }

        public int intPkType { get; set; }

        public String strPrintshopId { get; set; }

        public String strTypeId { get; set; }

        public String strName { get; set; }

        public String strProcessName { get; set; }

        public String strElementName { get; set; }

        public bool? boolHasIt { get; set; }

        public bool boolIsXJDF { get; set; }

        public String strClassification { get; set; }
        public bool boolIsCommon { get; set; }

        public PrintshopProcessTemplateModel2[] arrrestyportemInput { get; set; }
        public PrintshopProcessTemplateModel2[] arrrestyportemOutput { get; set; }
    }

    //==================================================================================================================

    public class PrintshopProcessTemplateModel2
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //PROPERTIES.
        public int intPkEleetOrEleele { get; set; }

        public String strTypeOrTemplate { get; set; }

        public bool boolIsEleet { get; set; }

    }

    //==================================================================================================================
}
/*END-TASK*/
