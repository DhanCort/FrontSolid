/*TASK RP.RESOURCE*/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

//                                                          //AUTHOR: Towa (DPG - Daniel Pena).
//                                                          //CO-AUTHOR: Towa (LGF - Liliana Gutierrez).
//                                                          //DATE: March 9, 2020.

namespace Odyssey2Frontend.Models
{
    //==================================================================================================================
    public class EditResourceModel
    {
        public int intPkType { get; set; }
        public String strTypeName { get; set; }
        public int? intnPkInherited { get; set; }
        public String strInheritedName { get; set; }
        public int intPkResource { get; set; }
        public String strResourceName { get; set; }
        public bool boolIsTemplate { get; set; }
        public String strUnit { get; set; }
        public List<ResourceAttributeModel> arrattr { get; set; }
        public bool boolIsPhysical { get; set; }
        public bool? boolnIsChangeable { get; set; }
        public InheritanceDataModel unitinhe { get; set; }
        public InheritanceDataModel costinhe { get; set; }
        public InheritanceDataModel avainhe { get; set; }
        public bool? boolnIsDecimal { get; set; }
        public bool? boolnIsDeviceToolOrCustom { get; set; }
    }

    //==================================================================================================================
    public class ResourceAttributeModel
    {
        public int? intPkValue { get; set; }
        public int? intnPkValueInherited { get; set; }
        public String strValue { get; set; }
        public List<int> arrPkAscendant { get; set; }
        public bool boolChangeable { get; set; }
        public bool boolIsBlocked { get; set; }
    }

    //==================================================================================================================
}
/*END-TASK*/
