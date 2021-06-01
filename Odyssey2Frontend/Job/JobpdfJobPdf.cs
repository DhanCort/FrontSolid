/*RP. TASK ESTIMATE*/
using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Shapes;
using MigraDoc.DocumentObjectModel.Tables;
using MigraDoc.Rendering;
using Odyssey2Frontend.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

//                                                          //AUTHOR: Towa (AQG - Andrea Quiroz).
//                                                          //CO-AUTHOR: Towa (VSTD - Victor Torres).
//                                                          //DATE: July 6, 2020.

namespace Odyssey2Frontend.Job
{
    //==================================================================================================================
    public class JobpdfJobPdf
    {
        //--------------------------------------------------------------------------------------------------------------
        //                                                  //INSTANCE VARIABLES

        private Document document = null;
        private Section section = null;
        private Table jobs = null;
        private List<JobsModel> darrjobsmodel = null;
        private List<ReportModel> darrcolJobs = null;

        //-------------------------------------------------------------------------------------------------------------
        //                                                  //CONSTRUCTORS.

        //-------------------------------------------------------------------------------------------------------------
        public JobpdfJobPdf(
            List<JobsModel> darrjobsmodel_I,
            List<ReportModel> darrcolJobs_I
            )
        {
            this.darrjobsmodel = darrjobsmodel_I;
            this.darrcolJobs = darrcolJobs_I;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //TRANSFORMATION METHODS.
        public byte[] GeneratePdf(
            )
        {
            this.document = new Document();
            this.document.DefaultPageSetup.LeftMargin = 20;
            this.document.DefaultPageSetup.RightMargin = 15;

            //                                              //This functions set the values for the bullet on the
            //                                              //      estimation table.
            this.subSetStyles();

            //                                              //This function call all the functions for each estimation
            //                                              //      on the received list.
            this.subAddSection();

            //                                              //Render the document.
            PdfDocumentRenderer pdfRenderer = new PdfDocumentRenderer(false);
            pdfRenderer.Document = this.document;
            pdfRenderer.RenderDocument();

            //                                              //Parse the document to array of bytes.
            byte[] arrByte = null;
            using (MemoryStream stream = new MemoryStream())
            {
                pdfRenderer.Save(stream, true);
                arrByte = stream.ToArray();
            }

            //                                              //Return the array of bytes.
            return arrByte;
        }

        //--------------------------------------------------------------------------------------------------------------
        //                                                  //SUPPORT METHODS.

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subSetStyles()
        {
            Style style = this.document.Styles["Normal"];

            //                                              //Bullet style config.
            style = this.document.AddStyle("Bullet", "Normal");
            style.ParagraphFormat.LeftIndent = "0.5cm";
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddSection(
            )
        {
            //                                              //Add a new page.
            this.section = this.document.AddSection();
            this.section.PageSetup.PageFormat = PageFormat.Letter;

            //                                          //Add a table with all the estimation data.
            this.subAddJobs();
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddJobs(
            )
        {
            //                                              //Title section config.
            TextFrame textFrameTitle = section.AddTextFrame();
            textFrameTitle.Height = "3.0cm";
            textFrameTitle.Width = "14.0cm";
            textFrameTitle.Left = ShapePosition.Left;
            textFrameTitle.RelativeHorizontal = RelativeHorizontal.Margin;
            textFrameTitle.Top = "1.0cm";
            textFrameTitle.RelativeVertical = RelativeVertical.Page;

            //                                              //Title section info.
            String strTitle = "Jobs";

            Paragraph paragraph = textFrameTitle.AddParagraph(strTitle);
            paragraph.Format.Font.Size = 20;
            paragraph.Format.SpaceAfter = 3;

            //                                              //Create the tale.
            this.section.AddParagraph("\n");
            this.jobs = this.section.AddTable();

            //                                              //Set the style.
            this.jobs.Style = "Table";
            this.jobs.Borders.Color = MigraDoc.DocumentObjectModel.Color.FromRgb(7, 12, 51);
            this.jobs.Borders.Width = 1;
            this.jobs.Borders.Left.Width = 1;
            this.jobs.Borders.Right.Width = 1;
            this.jobs.Rows.LeftIndent = 0;

            //                                              //Column dimensions.
            double numJobNumberDimensions = 2.5;
            double numJobNameDimensions = 3.0;
            double numProductDimensions = 2.2;
            double numCategoryDimensions = 2.3;
            double numQuantityDimensions = 1.1;
            double numDateAddedDimensions = 2.0;
            double numProgressDimensions = 1.2;
            double numMinCostDimensions = 1.3;
            double numMinPriceDimensions = 1.3;
            double numStartDimensions = 1.5;
            double numEndDimensions = 1.5;

            //                                              //Get final dimensions considering the columns to show.
            this.subGetFinalDimensions(ref numJobNumberDimensions, ref numJobNameDimensions, 
                ref numProductDimensions, ref numCategoryDimensions, ref numQuantityDimensions, 
                ref numDateAddedDimensions, ref numProgressDimensions, ref numMinCostDimensions, 
                ref numMinPriceDimensions, ref numStartDimensions, ref numEndDimensions);

            //                                              //Add columns.
            this.subAddColumns();

            //                                              //First row.
            this.subAddFirstRow();

            foreach (JobsModel jobsmodel in darrjobsmodel)
            {
                //                                          //Function to add the product name.
                this.subAddJobRow(jobsmodel);
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subGetFinalDimensions(
            ref double numJobNumberDimensions_IO,
            ref double numJobNameDimensions_IO, 
            ref double numProductDimensions_IO,
            ref double numCategoryDimensions_IO,
            ref double numQuantityDimensions_IO, 
            ref double numDateAddedDimensions_IO,
            ref double numProgressDimensions_IO,
            ref double numMinCostDimensions_IO,
            ref double numMinPriceDimensions_IO,
            ref double numStartDimensions_IO, 
            ref double numEndDimensions_IO
            )
        {
            foreach(ReportModel reportmodel in this.darrcolJobs)
            {
                /*CASE*/
                if (
                    reportmodel.field == "strJobNumber"
                    )
                {
                    reportmodel.numDimensions = numJobNumberDimensions_IO;
                }
                else if (
                    reportmodel.field == "strJobTicket"
                    )
                {
                    reportmodel.numDimensions = numJobNameDimensions_IO;
                }
                else if (
                    reportmodel.field == "strProductName"
                    )
                {
                    reportmodel.numDimensions = numProductDimensions_IO;
                }
                else if (
                    reportmodel.field == "strProductCategory"
                    )
                {
                    reportmodel.numDimensions = numCategoryDimensions_IO;
                }
                else if (
                    reportmodel.field == "intnQuantity"
                    )
                {
                    reportmodel.numDimensions = numQuantityDimensions_IO;
                }
                else if (
                    reportmodel.field == "dateLastUpdate"
                    )
                {
                    reportmodel.numDimensions = numDateAddedDimensions_IO;
                }
                else if (
                    reportmodel.field == "numProgress"
                    )
                {
                    reportmodel.numDimensions = numProgressDimensions_IO;
                }
                else if (
                    reportmodel.field == "numMinCost"
                    )
                {
                    reportmodel.numDimensions = numMinCostDimensions_IO;
                }
                else if (
                    reportmodel.field == "numMinPrice"
                    )
                {
                    reportmodel.numDimensions = numMinPriceDimensions_IO;
                }
                else if (
                    reportmodel.field == "strStartDateTime"
                    )
                {
                    reportmodel.numDimensions = numStartDimensions_IO;
                }
                else if (
                    reportmodel.field == "strEndDateTime"
                    )
                {
                    reportmodel.numDimensions = numEndDimensions_IO;
                }
                /*END-CASE*/
            }

            if (
                !this.darrcolJobs.Exists(c => c.field == "strJobNumber")
                )
            {
                double numDimensionsDivided = numJobNumberDimensions_IO / this.darrcolJobs.Count;

                foreach(ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }
           
            if (
                !this.darrcolJobs.Exists(c => c.field == "strJobTicket")
                )
            {
                double numDimensionsDivided = numJobNameDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }
            
            if (
                !this.darrcolJobs.Exists(c => c.field == "strProductName")
                )
            {
                double numDimensionsDivided = numProductDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }

            if (
                !this.darrcolJobs.Exists(c => c.field == "strProductCategory")
                )
            {
                double numDimensionsDivided = numCategoryDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }

            if (
                !this.darrcolJobs.Exists(c => c.field == "intnQuantity")
                )
            {
                double numDimensionsDivided = numQuantityDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }
            
            if (
                !this.darrcolJobs.Exists(c => c.field == "dateLastUpdate")
                )
            {
                double numDimensionsDivided = numDateAddedDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }

            if (
                !this.darrcolJobs.Exists(c => c.field == "numProgress")
                )
            {
                double numDimensionsDivided = numProgressDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }

            if (
                !this.darrcolJobs.Exists(c => c.field == "numMinCost")
                )
            {
                double numDimensionsDivided = numMinCostDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }

            if (
                !this.darrcolJobs.Exists(c => c.field == "numMinPrice")
                )
            {
                double numDimensionsDivided = numMinPriceDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }

            if (
                !this.darrcolJobs.Exists(c => c.field == "strStartDateTime")
                )
            {
                double numDimensionsDivided = numStartDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }
            
            if (
                !this.darrcolJobs.Exists(c => c.field == "strEndDateTime")
                )
            {
                double numDimensionsDivided = numEndDimensions_IO / this.darrcolJobs.Count;

                foreach (ReportModel reportmodel in this.darrcolJobs)
                {
                    reportmodel.numDimensions = reportmodel.numDimensions + numDimensionsDivided;
                }
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddColumns(
            )
        {
            foreach(ReportModel reportmodel in this.darrcolJobs)
            {
                Column column = this.jobs.AddColumn(Math.Round(reportmodel.numDimensions, 1) + "cm");
                column.Format.Alignment = ParagraphAlignment.Center;
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddFirstRow(
            )
        {
            Row row = this.jobs.AddRow();

            for(int intI = 0; intI < this.darrcolJobs.Count; intI++)
            {
                ReportModel reportmodel = this.darrcolJobs[intI];

                row.Cells[intI].Format.Alignment = ParagraphAlignment.Center;
                row.Cells[intI].VerticalAlignment = VerticalAlignment.Center;
                Paragraph paragraph = row.Cells[intI].AddParagraph();
                paragraph.AddFormattedText(reportmodel.title);
                paragraph.Format.Font.Size = 8;
                paragraph.Format.Font.Bold = true;
            }
        }

        //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
        private void subAddJobRow( 
            JobsModel jobsmodel_I
            )
        {
            Row row = this.jobs.AddRow();
            for(int intI = 0; intI < this.darrcolJobs.Count; intI++)
            {
                ReportModel reportmodel = this.darrcolJobs[intI];

                row.Cells[intI].Format.Alignment = ParagraphAlignment.Center;
                row.Cells[intI].VerticalAlignment = VerticalAlignment.Center;
                Paragraph paragraph = row.Cells[intI].AddParagraph();

                /*CASE*/
                if (
                    reportmodel.field == "strJobNumber"
                    )
                {
                    //                                          //Job Id.
                    paragraph.AddFormattedText(jobsmodel_I.strJobNumber + "");
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "strJobTicket"
                    )
                {
                    //                                          //Job Name.
                    row.Cells[intI].Format.Alignment = ParagraphAlignment.Left;
                    paragraph.AddFormattedText(jobsmodel_I.strJobTicket ?? "");
                    paragraph.Format.Font.Size = 7;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "strProductName"
                    )
                {
                    //                                          //Product.
                    row.Cells[intI].Format.Alignment = ParagraphAlignment.Left;
                    paragraph.AddFormattedText(jobsmodel_I.strProductName ?? "");
                    paragraph.Format.Font.Size = 7;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "strProductCategory"
                    )
                {
                    //                                          //Product.
                    row.Cells[intI].Format.Alignment = ParagraphAlignment.Left;
                    String strCategory = (jobsmodel_I.strProductCategory != null) ? jobsmodel_I.strProductCategory : "-";
                    paragraph.AddFormattedText(strCategory);
                    paragraph.Format.Font.Size = 7;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "intnQuantity"
                    )
                {
                    //                                          //Quantity.
                    paragraph.AddFormattedText(jobsmodel_I.intnQuantity + "");
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "dateLastUpdate"
                    )
                {
                    //                                          //Date added.
                    paragraph.AddFormattedText(jobsmodel_I.strDateLastUpdate ?? "");
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "numProgress"
                    )
                {
                    //                                          //Date added.
                    paragraph.AddFormattedText(jobsmodel_I.numProgress + "");
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "numMinCost"
                    )
                {
                    //                                          //Date added.
                    paragraph.AddFormattedText(jobsmodel_I.numMinCost + "");
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "numMinPrice"
                    )
                {
                    //                                          //Date added.
                    paragraph.AddFormattedText(jobsmodel_I.numMinPrice + "");
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "strStartDateTime"
                    )
                {
                    //                                          //Start date.
                    String strStartDate = (jobsmodel_I.strStartDateTime != null) ? jobsmodel_I.strStartDateTime : "";
                    paragraph.AddFormattedText(strStartDate);
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
                else if (
                    reportmodel.field == "strEndDateTime"
                    )
                {
                    //                                          //End date.
                    String strEndDate = (jobsmodel_I.strEndDateTime != null) ? jobsmodel_I.strEndDateTime : "";
                    paragraph.AddFormattedText(strEndDate);
                    paragraph.Format.Font.Size = 8;
                    paragraph.Format.Font.Bold = false;
                }
            }
        }

        //--------------------------------------------------------------------------------------------------------------
    }

    //==================================================================================================================
}
/*END-TASK*/
